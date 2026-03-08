
import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { DeliveryPartner, Order, Settlement, OnboardingStatus, Geolocation, Penalty, Incentive } from '../types';

interface DeliveryPartnerContextType {
  partner: DeliveryPartner | null;
  allPartners: Record<string, DeliveryPartner>;
  setAllPartners: (value: Record<string, DeliveryPartner> | ((val: Record<string, DeliveryPartner>) => Record<string, DeliveryPartner>)) => void;
  login: (phone: string, otp: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  toggleOnlineStatus: () => void;
  recordDeliveryCompletion: (order: Order) => void;
  recordDeliveryReturn: (order: Order) => void;
  completeCodSettlement: (settlement: Settlement) => void;
  completeEarningPayout: (settlement: Settlement) => void;
  toggleSuspension: (partnerId: string) => void;
  updatePartnerOnboarding: (data: Partial<DeliveryPartner>) => void;
  approvePartner: (partnerId: string) => void;
  rejectPartner: (partnerId: string, reason: string) => void;
  submitForReview: (partnerId: string) => void;
  updatePartnerLocation: (location: Geolocation) => void;
  addPenalty: (partnerId: string, penalty: Omit<Penalty, 'id' | 'date' | 'isSettled'>) => void;
  addIncentive: (partnerId: string, incentive: Omit<Incentive, 'id' | 'date' | 'isSettled'>) => void;
  updatePartnerDetails: (phone: string, updatedData: Partial<DeliveryPartner>) => void;
  deletePartner: (phone: string) => void;
}

const DeliveryPartnerContext = createContext<DeliveryPartnerContextType | undefined>(undefined);

const getInitialPartnerData = (phone: string): DeliveryPartner => ({
    id: `partner-${phone.slice(-4)}`,
    phone: phone,
    name: "",
    address: "",
    profilePhoto: "",
    emergencyContact: "",
    vehicleNumber: "",
    documents: {},
    paymentDetails: { type: 'upi' },
    policyAgreed: false,
    onboardingStatus: 'pending_docs',
    isOnline: false,
    codCollected: 0,
    negativeWalletBalance: 0,
    pendingEarnings: 0,
    lifetimeEarnings: 0,
    rating: 4.5,
    codLedger: [],
    settlementHistory: [],
    penalties: [],
    incentives: [],
    isSuspended: false,
    createdAt: new Date().toISOString(),
});


export const DeliveryPartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useLocalStorage<DeliveryPartner | null>('rannaghar_delivery_partner', null);
  const [allPartners, setAllPartners] = useLocalStorage<Record<string, DeliveryPartner>>('rannaghar_all_partners', {});

  const login = (phone: string, otp: string): boolean => {
    if (phone.length >= 10 && otp === '777777') {
      let currentPartner = allPartners[phone];
      
      if (!currentPartner) {
        const newPartner = getInitialPartnerData(phone);
        if (phone === "9999999999") {
            newPartner.name = "Demo Delivery Partner";
            newPartner.onboardingStatus = 'active';
            newPartner.vehicleNumber = "WB-DEMO-001";
            newPartner.rating = 4.8;
            newPartner.lifetimeEarnings = 1500;
            newPartner.pendingEarnings = 450;
            newPartner.isOnline = true;
            newPartner.documents = { aadhaar: "verified_demo_aadhaar", license: "verified_demo_license" };
            newPartner.codLedger = [
                { id: 'ledger-1', orderId: 'ORD-1001', amount: 450, date: new Date().toISOString(), status: 'Unsettled' },
                { id: 'ledger-2', orderId: 'ORD-1002', amount: 1200, date: new Date().toISOString(), status: 'Unsettled' }
            ];
            newPartner.codCollected = 1650;
        }
        currentPartner = newPartner;
        setAllPartners(prev => ({...prev, [phone]: newPartner}));
      }
      setPartner(currentPartner);
      return true;
    }
    return false;
  };
  
  const updatePartnerOnboarding = (data: Partial<DeliveryPartner>) => {
    setPartner(p => {
        if (!p) return null;
        const updatedPartner = { ...p, ...data };
        setAllPartners(prev => ({...prev, [p.phone]: updatedPartner}));
        return updatedPartner;
    });
  };

  const approvePartner = (partnerId: string) => {
    const phone = Object.values(allPartners).find(p => p.id === partnerId)?.phone;
    if (phone) {
        setAllPartners(prev => {
            const partnerToUpdate = prev[phone];
            if (partnerToUpdate) return {...prev, [phone]: {...partnerToUpdate, onboardingStatus: 'active'}};
            return prev;
        });
    }
    setPartner(p => p?.id === partnerId ? { ...p, onboardingStatus: 'active' as OnboardingStatus } : p);
  };

  const rejectPartner = (partnerId: string, reason: string) => {
    const phone = Object.values(allPartners).find(p => p.id === partnerId)?.phone;
    if (phone) {
        setAllPartners(prev => {
            const partnerToUpdate = prev[phone];
            if (partnerToUpdate) return {...prev, [phone]: {...partnerToUpdate, onboardingStatus: 'rejected', rejectionReason: reason}};
            return prev;
        });
    }
    setPartner(p => p?.id === partnerId ? { ...p, onboardingStatus: 'rejected' as OnboardingStatus, rejectionReason: reason } : p);
  };

  const submitForReview = (partnerId: string) => {
    updateGlobalPartner(partnerId, (p) => ({ ...p, onboardingStatus: 'under_review' }));
  };

  const logout = () => setPartner(null);

  const toggleOnlineStatus = () => {
    setPartner(prev => {
        if (!prev || prev.isSuspended || prev.onboardingStatus !== 'active') return prev;
        const updated = { ...prev, isOnline: !prev.isOnline };
        setAllPartners(p => ({...p, [updated.phone]: updated}));
        return updated;
    });
  };

  const updateGlobalPartner = (partnerId: string, updateFn: (p: DeliveryPartner) => DeliveryPartner) => {
    const phone = Object.values(allPartners).find(p => p.id === partnerId)?.phone;
    if (phone) {
        setAllPartners(prev => prev[phone] ? { ...prev, [phone]: updateFn(prev[phone]) } : prev);
    }
    setPartner(p => p && p.id === partnerId ? updateFn(p) : p);
  };

  const recordDeliveryCompletion = (order: Order) => {
    if (!order.partnerId) return;
    updateGlobalPartner(order.partnerId, (p) => {
        const isCod = order.paymentMode === 'COD';
        const newLedger = [...p.codLedger];
        if (isCod) {
            newLedger.push({
                id: `ledger-${Date.now()}`,
                orderId: order.id,
                amount: order.totalAmount,
                date: new Date().toISOString(),
                status: 'Unsettled'
            });
        }

        return {
            ...p,
            lifetimeEarnings: p.lifetimeEarnings + (order.deliveryEarning || 0),
            pendingEarnings: p.pendingEarnings + (order.deliveryEarning || 0),
            codCollected: p.codCollected + (isCod ? order.totalAmount : 0),
            codLedger: newLedger,
            lastOrderFinishedAt: new Date().toISOString()
        };
    });
  };
  
  const recordDeliveryReturn = (order: Order) => {
    if (!order.partnerId || !order.returnDetails) return;
    const earning = (order.deliveryEarning || 0) + order.returnDetails!.returnCharge;
    updateGlobalPartner(order.partnerId, (p) => ({
        ...p,
        lifetimeEarnings: p.lifetimeEarnings + earning,
        pendingEarnings: p.pendingEarnings + earning,
    }));
  };

  const completeCodSettlement = (settlement: Settlement) => {
      updateGlobalPartner(settlement.partnerId, (p) => ({
          ...p,
          codCollected: 0,
          codLedger: p.codLedger.map(entry => ({ ...entry, status: 'Settled', settlementId: settlement.id })),
          settlementHistory: [settlement, ...p.settlementHistory]
      }));
  };

  const completeEarningPayout = (settlement: Settlement) => {
    updateGlobalPartner(settlement.partnerId, (p) => ({
        ...p,
        pendingEarnings: 0, // Reset pending earnings after payout
        settlementHistory: [settlement, ...p.settlementHistory]
    }));
  };

  const addPenalty = (partnerId: string, pData: Omit<Penalty, 'id' | 'date' | 'isSettled'>) => {
    const penalty: Penalty = { ...pData, id: `pen-${Date.now()}`, date: new Date().toISOString(), isSettled: false };
    updateGlobalPartner(partnerId, (p) => ({ ...p, penalties: [...p.penalties, penalty] }));
  };

  const addIncentive = (partnerId: string, iData: Omit<Incentive, 'id' | 'date' | 'isSettled'>) => {
    const incentive: Incentive = { ...iData, id: `inc-${Date.now()}`, date: new Date().toISOString(), isSettled: false };
    updateGlobalPartner(partnerId, (p) => ({ ...p, incentives: [...p.incentives, incentive] }));
  };

  const toggleSuspension = (partnerId: string) => {
    updateGlobalPartner(partnerId, (p) => ({ ...p, isSuspended: !p.isSuspended, isOnline: false }));
  };

  const updatePartnerLocation = (location: Geolocation) => {
    setPartner(p => {
        if (!p) return null;
        const updatedPartner = { ...p, currentLocation: location };
        setAllPartners(prev => ({...prev, [p.phone]: updatedPartner}));
        return updatedPartner;
    });
  };

  const updatePartnerDetails = (phone: string, updatedData: Partial<DeliveryPartner>) => {
    const updateFn = (p: DeliveryPartner) => ({ ...p, ...updatedData });
    setAllPartners(prev => prev[phone] ? { ...prev, [phone]: updateFn(prev[phone]) } : prev);
    setPartner(p => p && p.phone === phone ? updateFn(p) : p);
  };

  const deletePartner = (phone: string) => {
    setAllPartners(prev => {
        const newPartners = { ...prev };
        delete newPartners[phone];
        return newPartners;
    });
    setPartner(p => p && p.phone === phone ? null : p);
  };

  return (
    <DeliveryPartnerContext.Provider value={{ partner, allPartners, setAllPartners, login, logout, isAuthenticated: !!partner, toggleOnlineStatus, recordDeliveryCompletion, recordDeliveryReturn, completeCodSettlement, completeEarningPayout, toggleSuspension, updatePartnerOnboarding, approvePartner, rejectPartner, submitForReview, updatePartnerLocation, addPenalty, addIncentive, updatePartnerDetails, deletePartner }}>
      {children}
    </DeliveryPartnerContext.Provider>
  );
};

export const useDeliveryPartner = (): DeliveryPartnerContextType => {
  const context = useContext(DeliveryPartnerContext);
  if (context === undefined) throw new Error('useDeliveryPartner must be used within a DeliveryPartnerProvider');
  return context;
};
