
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Settlement, SettlementType, WeeklyStatement, DeliveryPartner, Order, AdminSettings } from '../types';
import { useDeliveryPartner } from './DeliveryPartnerContext';
import { useOrder } from './OrderContext';
import { useSettings } from './SettingsContext';

interface SettlementContextType {
  settlements: Settlement[];
  createCodSettlement: (partnerId: string, amount: number) => Settlement;
  createUpiSettlement: (partnerId: string, amount: number, transactionId: string) => Settlement;
  verifyUpiSettlement: (settlementId: string) => Promise<boolean>;
  approveUpiSettlement: (settlementId: string) => void;
  generateSettlementOtp: (settlementId: string) => string;
  verifySettlementOtp: (settlementId: string, otp: string) => boolean;
  getPartnerPendingCodSettlement: (partnerId: string) => Settlement | undefined;
  approveWeeklySettlement: (settlementId: string) => void;
  rejectSettlement: (settlementId: string, reason: string) => void;
  runManualWeeklySettlement: () => void;
}

const SettlementContext = createContext<SettlementContextType | undefined>(undefined);

const OTP_VALIDITY_MINUTES = 5;

export const SettlementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settlements, setSettlements] = useLocalStorage<Settlement[]>('rannaghar_settlements', []);
  const { allPartners, setAllPartners } = useDeliveryPartner();
  const { orders } = useOrder();
  const { settings } = useSettings();

  // WEEKLY AUTO SETTLEMENT LOGIC (Simulated Cron)
  useEffect(() => {
    const checkSettlementCycle = () => {
        const now = new Date();
        const isMonday = now.getDay() === 1;
        const hour = now.getHours();
        
        const lastSettlement = settlements.find(s => s.type === 'WEEKLY_SETTLEMENT');
        const lastDate = lastSettlement ? new Date(lastSettlement.date) : new Date(0);
        
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        if (now.getTime() - lastDate.getTime() > oneWeekMs && isMonday && hour >= 10) {
            runManualWeeklySettlement();
        }
    };

    const interval = setInterval(checkSettlementCycle, 60000);
    return () => clearInterval(interval);
  }, [settlements]);

  const runManualWeeklySettlement = () => {
    const now = new Date();
    const periodEnd = new Date(now);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodEnd.getDate() - 7);

    const newRecords: Settlement[] = [];
    const updatedPartners = { ...allPartners };
    let processedCount = 0;

    Object.values(allPartners).forEach(p => {
        // SAFETY RULE: Cannot generate payout if COD Pending > 0
        if (p.codCollected > 0) return;

        // 1. Filter orders in range
        const periodOrders = orders.filter(o => {
            if (!o.partnerId || o.partnerId !== p.id) return false;
            if (o.status !== 'DELIVERED' && o.status !== 'RETURNED_TO_RESTAURANT') return false;
            const orderTime = new Date(o.date).getTime();
            return orderTime >= periodStart.getTime() && orderTime <= periodEnd.getTime();
        });

        // 2. Calculate components
        const normalEarnings = periodOrders.reduce((sum, o) => sum + (o.deliveryEarning || 0), 0);
        const returnCharges = periodOrders.reduce((sum, o) => sum + (o.returnDetails?.returnCharge || 0), 0);
        const incentives = p.incentives.filter(i => !i.isSettled).reduce((sum, i) => sum + i.amount, 0);
        const penalties = p.penalties.filter(pen => !pen.isSettled).reduce((sum, pen) => sum + pen.amount, 0);
        
        const grossEarnings = normalEarnings + returnCharges + incentives;
        const netAfterPenalties = grossEarnings - penalties;
        
        const codPending = p.codCollected;
        let currentPeriodPayable = 0;
        let currentPeriodNegativeCarry = 0;

        if (codPending > netAfterPenalties) {
            currentPeriodPayable = 0;
            currentPeriodNegativeCarry = codPending - netAfterPenalties;
        } else {
            currentPeriodPayable = netAfterPenalties - codPending;
            currentPeriodNegativeCarry = 0;
        }

        // 3. Apply Previous Negative Balances
        let totalNetPayable = currentPeriodPayable;
        let finalNegativeCarry = currentPeriodNegativeCarry;

        if (p.negativeWalletBalance > 0) {
            if (totalNetPayable > p.negativeWalletBalance) {
                totalNetPayable -= p.negativeWalletBalance;
            } else {
                finalNegativeCarry += (p.negativeWalletBalance - totalNetPayable);
                totalNetPayable = 0;
            }
        }

        // 4. Decision: Should we create a statement?
        // Create if there's any activity or a remaining balance to settle
        if (periodOrders.length > 0 || incentives > 0 || penalties > 0 || codPending > 0 || p.negativeWalletBalance > 0) {
            const uniqueSuffix = Math.random().toString(36).substring(7);
            
            const weeklyData: WeeklyStatement = {
                id: `stmt-${p.id}-${now.getTime()}`,
                partnerId: p.id,
                periodStart: periodStart.toISOString(),
                periodEnd: periodEnd.toISOString(),
                grossEarnings,
                totalDeliveries: periodOrders.length,
                returnCharges,
                incentives,
                penalties,
                commission: 0,
                codDeducted: codPending,
                netPayable: totalNetPayable,
                negativeCarryForward: finalNegativeCarry,
                status: 'Pending Approval',
                processedAt: now.toISOString()
            };

            const settlementRecord: Settlement = {
                id: `settle-weekly-${p.id}-${now.getTime()}-${uniqueSuffix}`,
                partnerId: p.id,
                type: 'WEEKLY_SETTLEMENT',
                date: now.toISOString(),
                amount: totalNetPayable,
                method: 'Bank',
                status: 'Pending Approval',
                weeklyData
            };

            newRecords.push(settlementRecord);
            processedCount++;

            // Update partner state
            updatedPartners[p.phone] = {
                ...p,
                codCollected: 0,
                pendingEarnings: 0,
                negativeWalletBalance: finalNegativeCarry,
                penalties: p.penalties.map(pen => ({ ...pen, isSettled: true })),
                incentives: p.incentives.map(i => ({ ...i, isSettled: true })),
                settlementHistory: [settlementRecord, ...p.settlementHistory]
            };
        }
    });

    if (processedCount > 0) {
        setAllPartners(updatedPartners);
        setSettlements(prev => [...newRecords, ...prev]);
        alert(`Settlement cycle completed for ${processedCount} partner(s).`);
    } else {
        alert("No activity or outstanding balances found to process for this cycle.");
    }
  };

  const approveWeeklySettlement = (id: string) => {
    setSettlements(prev => prev.map(s => {
        if (s.id !== id) return s;
        // Synchronize both status fields
        const updatedWeeklyData = s.weeklyData ? { ...s.weeklyData, status: 'Paid' as const } : undefined;
        return { 
            ...s, 
            status: 'Paid', 
            paidAt: new Date().toISOString(),
            weeklyData: updatedWeeklyData
        };
    }));
  };

  const rejectSettlement = (id: string, reason: string) => {
    setSettlements(prev => prev.map(s => {
        if (s.id !== id) return s;
        return { ...s, status: 'Rejected', rejectionReason: reason };
    }));
  };

  const createCodSettlement = (partnerId: string, amount: number): Settlement => {
    const existingPending = settlements.find(s => s.partnerId === partnerId && s.type === 'COD_DEPOSIT' && s.status !== 'Completed' && s.status !== 'Rejected');
    if (existingPending) return existingPending;
    
    const newSettlement: Settlement = {
      id: `settle-cod-${Date.now()}`,
      partnerId,
      type: 'COD_DEPOSIT',
      date: new Date().toISOString(),
      amount,
      method: 'Cash',
      status: 'Pending',
    };
    setSettlements(prev => [newSettlement, ...prev]);
    return newSettlement;
  };

  const createUpiSettlement = (partnerId: string, amount: number, transactionId: string): Settlement => {
    setSettlements(prev => prev.filter(s => !(s.partnerId === partnerId && s.type === 'COD_DEPOSIT' && s.status !== 'Completed' && s.status !== 'Rejected')));
    const newSettlement: Settlement = { 
        id: `settle-upi-${Date.now()}`, 
        partnerId, 
        type: 'COD_DEPOSIT', 
        date: new Date().toISOString(), 
        amount, 
        method: 'UPI', 
        status: 'Pending Approval',
        transactionId
    };
    setSettlements(prev => [newSettlement, ...prev]);
    return newSettlement;
  }
  
  const verifyUpiSettlement = async (settlementId: string): Promise<boolean> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            setSettlements(prev => prev.map(s => s.id === settlementId ? { ...s, status: 'Completed' } : s));
            const settlement = settlements.find(s => s.id === settlementId);
            if (settlement) {
                // Update partner state via completeCodSettlement
                const partnerPhone = Object.values(allPartners).find(p => p.id === settlement.partnerId)?.phone;
                if (partnerPhone) {
                    const p = allPartners[partnerPhone];
                    const completedSettlement = { ...settlement, status: 'Completed' as const };
                    setAllPartners(prev => ({
                        ...prev,
                        [partnerPhone]: {
                            ...p,
                            codCollected: 0,
                            codLedger: p.codLedger.map(entry => ({ ...entry, status: 'Settled', settlementId: settlement.id })),
                            settlementHistory: [completedSettlement, ...p.settlementHistory]
                        }
                    }));
                }
            }
            resolve(true);
        }, 1000);
     });
  };

  const approveUpiSettlement = (settlementId: string) => {
    setSettlements(prev => prev.map(s => {
        if (s.id !== settlementId) return s;
        
        // Update partner state
        const partnerPhone = Object.values(allPartners).find(p => p.id === s.partnerId)?.phone;
        if (partnerPhone) {
            const p = allPartners[partnerPhone];
            const completedSettlement = { ...s, status: 'Completed' as const };
            setAllPartners(prev => ({
                ...prev,
                [partnerPhone]: {
                    ...p,
                    codCollected: 0,
                    codLedger: p.codLedger.map(entry => ({ ...entry, status: 'Settled', settlementId: s.id })),
                    settlementHistory: [completedSettlement, ...p.settlementHistory]
                }
            }));
        }
        
        return { ...s, status: 'Completed' };
    }));
  };

  const generateSettlementOtp = (settlementId: string): string => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60000).toISOString();
    setSettlements(prev => prev.map(s => s.id === settlementId ? { ...s, otp, otpExpiry: expiry, status: 'AwaitingOTP' } : s));
    return otp;
  };

  const verifySettlementOtp = (settlementId: string, otp: string): boolean => {
    const settlement = settlements.find(s => s.id === settlementId);
    if (!settlement || !settlement.otp || !settlement.otpExpiry) return false;
    if (new Date().getTime() > new Date(settlement.otpExpiry).getTime()) return false;
    if (settlement.otp === otp) {
        setSettlements(prev => prev.map(s => s.id === settlementId ? { ...s, status: 'Completed' } : s));
        
        const partnerPhone = Object.values(allPartners).find(p => p.id === settlement.partnerId)?.phone;
        if (partnerPhone) {
            const p = allPartners[partnerPhone];
            const completedSettlement = { ...settlement, status: 'Completed' as const };
            setAllPartners(prev => ({
                ...prev,
                [partnerPhone]: {
                    ...p,
                    codCollected: 0,
                    codLedger: p.codLedger.map(entry => ({ ...entry, status: 'Settled', settlementId: settlement.id })),
                    settlementHistory: [completedSettlement, ...p.settlementHistory]
                }
            }));
        }
        return true;
    }
    return false;
  };

  const getPartnerPendingCodSettlement = (partnerId: string): Settlement | undefined => {
      return settlements.find(s => s.partnerId === partnerId && s.type === 'COD_DEPOSIT' && s.status !== 'Completed');
  };

  return (
    <SettlementContext.Provider value={{ 
        settlements, createCodSettlement, createUpiSettlement, verifyUpiSettlement, 
        approveUpiSettlement, generateSettlementOtp, verifySettlementOtp, 
        getPartnerPendingCodSettlement, approveWeeklySettlement, rejectSettlement,
        runManualWeeklySettlement 
    }}>
      {children}
    </SettlementContext.Provider>
  );
};

export const useSettlement = (): SettlementContextType => {
  const context = useContext(SettlementContext);
  if (context === undefined) throw new Error('useSettlement must be used within a SettlementProvider');
  return context;
};
