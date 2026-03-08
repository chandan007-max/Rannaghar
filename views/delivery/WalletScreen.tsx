
import React, { useState, useMemo, useEffect } from 'react';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';
import { useSettlement } from '../../context/SettlementContext';
import { useOrder } from '../../context/OrderContext';
import { useSettings } from '../../context/SettingsContext';
import { Settlement } from '../../types';
import { Wallet, Landmark, History, KeyRound, CheckCircle, Clock, ArrowDown, ArrowUp, QrCode, Receipt, FileText, BadgeInfo, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WeeklyCountdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const nextMonday = new Date();
            nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
            nextMonday.setHours(10, 0, 0, 0);
            if (nextMonday < now) nextMonday.setDate(nextMonday.getDate() + 7);
            
            const diff = nextMonday.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            setTimeLeft(`${days}d ${hours}h ${mins}m`);
        }, 60000);
        return () => clearInterval(interval);
    }, []);
    return <span>Next Settlement: {timeLeft || 'Calculating...'}</span>;
};

const WalletScreen: React.FC = () => {
  const { partner } = useDeliveryPartner();
  const { orders } = useOrder();
  const { settings } = useSettings();
  
  const [selectedStatement, setSelectedStatement] = useState<Settlement | null>(null);
  
  if (!partner) return null;

  // Live Weekly Calculation for Display
  const weeklyEstimate = useMemo(() => {
    const now = new Date();
    const lastMonday = new Date();
    lastMonday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    lastMonday.setHours(0,0,0,0);

    const periodOrders = orders.filter(o => o.partnerId === partner.id && (o.status === 'DELIVERED' || o.status === 'RETURNED_TO_RESTAURANT') && new Date(o.date) >= lastMonday);
    const earnings = periodOrders.reduce((sum, o) => sum + (o.deliveryEarning || 0) + (o.returnDetails?.returnCharge || 0), 0);
    const activePenalties = partner.penalties.filter(p => !p.isSettled).reduce((sum, p) => sum + p.amount, 0);
    const activeIncentives = partner.incentives.filter(i => !i.isSettled).reduce((sum, i) => sum + i.amount, 0);
    
    const gross = earnings + activeIncentives;
    const net = gross - activePenalties; 
    const cod = partner.codCollected;
    
    return { gross, net, cod, payable: Math.max(0, net - cod), carry: Math.max(0, cod - net), count: periodOrders.length };
  }, [orders, partner, settings]);

  const sortedHistory = useMemo(() => [...partner.settlementHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [partner.settlementHistory]);

  return (
    <div className="p-5 space-y-6 bg-slate-50 min-h-full pb-24">
      <div className="bg-slate-900 text-white p-4 rounded-3xl flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-3"><Clock size={20} className="text-amber-400"/><div className="text-xs font-black uppercase tracking-widest"><WeeklyCountdown/></div></div>
        <BadgeInfo size={18} className="opacity-40" />
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">This Week (Live)</h3>
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">{weeklyEstimate.count} Orders</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Gross Earnings</p><p className="text-xl font-black">₹{weeklyEstimate.gross.toFixed(0)}</p></div>
            <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">COD in Hand</p><p className="text-xl font-black text-rose-500">₹{weeklyEstimate.cod.toFixed(0)}</p></div>
        </div>
        <div className="pt-2 border-t space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500"><span>Commission</span><span className="text-teal-600">₹0 (Zero Fee)</span></div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t"><span>Estimated Payout</span><span className="text-teal-600">₹{weeklyEstimate.payable.toFixed(0)}</span></div>
            {weeklyEstimate.carry > 0 && <p className="text-[9px] text-rose-500 font-black uppercase text-right">Remaining COD Carry: ₹{weeklyEstimate.carry.toFixed(0)}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Past Statements</h3>
        {sortedHistory.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
                <FileText size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-400">No statements yet</p>
            </div>
        ) : (
            sortedHistory.map(s => (
                <button 
                    key={s.id} 
                    onClick={() => s.type === 'WEEKLY_SETTLEMENT' && setSelectedStatement(s)}
                    className="w-full bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-left hover:border-indigo-200 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${s.type === 'WEEKLY_SETTLEMENT' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}><Receipt size={16}/></div>
                        <div>
                            <p className="text-xs font-black">{s.type.replace('_', ' ')}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{new Date(s.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className={`text-sm font-black ${s.type === 'EARNING_PAYOUT' || (s.type === 'WEEKLY_SETTLEMENT' && s.amount > 0) ? 'text-teal-600' : 'text-slate-900'}`}>₹{s.amount.toFixed(0)}</p>
                            <span className="text-[9px] font-bold uppercase text-slate-300">{s.status}</span>
                        </div>
                        {s.type === 'WEEKLY_SETTLEMENT' && <FileText size={14} className="text-slate-300" />}
                    </div>
                </button>
            ))
        )}
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedStatement && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedStatement(null)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl"
                >
                    <div className="bg-slate-900 p-8 text-white text-center relative">
                        <button onClick={() => setSelectedStatement(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={20}/></button>
                        <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt size={32} className="text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Weekly Payout</h2>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                            {new Date(selectedStatement.weeklyData?.periodStart || '').toLocaleDateString()} - {new Date(selectedStatement.weeklyData?.periodEnd || '').toLocaleDateString()}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-500"><span>Gross Earnings ({selectedStatement.weeklyData?.totalDeliveries} orders)</span><span className="text-slate-900">₹{selectedStatement.weeklyData?.grossEarnings?.toFixed(0)}</span></div>
                            <div className="flex justify-between text-xs font-bold text-slate-500"><span>Incentives</span><span className="text-teal-600">+₹{selectedStatement.weeklyData?.incentives?.toFixed(0)}</span></div>
                            <div className="flex justify-between text-xs font-bold text-slate-500"><span>Penalties</span><span className="text-rose-600">-₹{selectedStatement.weeklyData?.penalties?.toFixed(0)}</span></div>
                            <div className="flex justify-between text-xs font-bold text-slate-500"><span>COD Deducted</span><span className="text-rose-600">-₹{selectedStatement.weeklyData?.codDeducted?.toFixed(0)}</span></div>
                            <div className="pt-3 border-t flex justify-between items-center">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Net Payable</span>
                                <span className="text-2xl font-black text-teal-600">₹{selectedStatement.amount.toFixed(0)}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Status</span><span className="text-slate-900">{selectedStatement.status}</span></div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Method</span><span className="text-slate-900">{selectedStatement.method}</span></div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Date</span><span className="text-slate-900">{new Date(selectedStatement.date).toLocaleDateString()}</span></div>
                        </div>

                        <button 
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"
                            onClick={() => alert("Downloading PDF Receipt...")}
                        >
                            <FileText size={18} />
                            Download PDF Receipt
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletScreen;
