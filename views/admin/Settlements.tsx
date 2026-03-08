
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Landmark, RefreshCcw, 
  Download, Filter, Search, 
  CheckCircle2, AlertCircle, Clock,
  ChevronRight, Calendar, Receipt,
  ArrowUpRight, ArrowDownRight,
  Coins, User, Bike, Phone,
  ChevronDown, ChevronUp, Info, KeyRound
} from 'lucide-react';
import type { Settlement, DeliveryPartner } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const SettlementCard: React.FC<{ 
    settlement: Settlement; 
    partner?: DeliveryPartner;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onGenerateOtp: (id: string) => void;
}> = ({ settlement, partner, onApprove, onReject, onGenerateOtp }) => {
    const isPending = settlement.status === 'Pending Approval' || settlement.status === 'Pending';
    const isPaid = settlement.status === 'Paid' || settlement.status === 'Completed';
    const isAwaitingOtp = settlement.status === 'AwaitingOTP';

    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (isAwaitingOtp && settlement.otpExpiry) {
            const expiryTime = new Date(settlement.otpExpiry).getTime();
            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
                setTimeLeft(diff);
            };
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [isAwaitingOtp, settlement.otpExpiry]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4 group hover:border-rose-100 transition-all duration-500"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                        isPaid ? 'bg-emerald-50 text-emerald-600' : isPending || isAwaitingOtp ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                        {settlement.type === 'COD_DEPOSIT' ? <Coins size={20} /> : <Landmark size={20} />}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-base leading-none">
                            {partner?.name || `Partner #${settlement.partnerId.slice(-4)}`}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                            {new Date(settlement.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {settlement.method} • {settlement.type.replace('_', ' ')}
                        </p>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                    {settlement.status}
                </div>
            </div>

            {settlement.method === 'UPI' && settlement.transactionId && (
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">UTR: {settlement.transactionId}</span>
                    </div>
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-tight flex items-center gap-1">
                        View Screenshot <ChevronRight size={12} />
                    </button>
                </div>
            )}

            {isAwaitingOtp && settlement.method === 'Cash' && (
                <div className="bg-amber-50 p-3 rounded-xl flex items-center justify-between border border-amber-100">
                    <div className="flex items-center gap-2">
                        <KeyRound size={14} className="text-amber-600" />
                        <span className="text-xs font-black text-amber-900 tracking-widest">OTP: {settlement.otp}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Share with Partner</span>
                        <span className={`text-[10px] font-black ${timeLeft < 60 ? 'text-rose-500' : 'text-amber-600'}`}>
                            {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Expired'}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        {settlement.type === 'COD_DEPOSIT' ? 'Collection Amount' : 'Net Payout'}
                    </p>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">₹{settlement.amount.toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-2">
                    {settlement.method === 'Cash' && settlement.status === 'Pending' && (
                        <button 
                            onClick={() => onGenerateOtp(settlement.id)}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            Generate OTP
                        </button>
                    )}
                    {settlement.status === 'Pending Approval' && (
                        <>
                            <button 
                                onClick={() => onReject(settlement.id, 'Invalid Transaction')}
                                className="px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all"
                            >
                                Reject
                            </button>
                            <button 
                                onClick={() => onApprove(settlement.id)}
                                className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 transition-all"
                            >
                                Approve
                            </button>
                        </>
                    )}
                    <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const CODPartnerCard: React.FC<{ 
    partner: DeliveryPartner;
    onCollect: (id: string, amount: number) => void;
}> = ({ partner, onCollect }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4"
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100">
                        <img 
                            src={partner.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} 
                            className="w-full h-full object-cover" 
                            alt="" 
                        />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-base leading-none">{partner.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{partner.phone}</p>
                    </div>
                </div>
                <a href={`tel:${partner.phone}`} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <Phone size={18} />
                </a>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex justify-between items-center">
                <div>
                    <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-0.5">Cash in Hand</p>
                    <p className="text-xl font-black text-rose-600 tracking-tighter">₹{partner.codCollected.toFixed(0)}</p>
                </div>
                <button 
                    onClick={() => onCollect(partner.id, partner.codCollected)}
                    className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-rose-100"
                >
                    Initiate Collection
                </button>
            </div>
        </motion.div>
    );
};

const Settlements: React.FC<{ 
    settlements: Settlement[]; 
    partners: DeliveryPartner[];
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onGenerateOtp: (id: string) => void;
    onRunPayouts: () => void;
    onInitiateCod: (partnerId: string, amount: number) => void;
}> = ({ settlements, partners, onApprove, onReject, onGenerateOtp, onRunPayouts, onInitiateCod }) => {
    const [activeTab, setActiveTab] = useState<'Payouts' | 'COD'>('Payouts');
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Paid'>('All');

    const filteredSettlements = useMemo(() => {
        let result = settlements;
        if (activeTab === 'Payouts') {
            result = settlements.filter(s => s.type === 'WEEKLY_SETTLEMENT');
        } else {
            result = settlements.filter(s => s.type === 'COD_DEPOSIT');
        }

        if (filter === 'Pending') result = result.filter(s => ['Pending Approval', 'Pending', 'AwaitingOTP'].includes(s.status));
        else if (filter === 'Paid') result = result.filter(s => ['Paid', 'Completed'].includes(s.status));
        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [settlements, filter, activeTab]);

    const codPartners = useMemo(() => {
        return partners.filter(p => p.codCollected > 0).sort((a, b) => b.codCollected - a.codCollected);
    }, [partners]);

    const totalPayout = settlements.filter(s => s.type === 'WEEKLY_SETTLEMENT').reduce((sum, s) => sum + s.amount, 0);
    const pendingPayout = settlements.filter(s => s.type === 'WEEKLY_SETTLEMENT' && s.status === 'Pending Approval').reduce((sum, s) => sum + s.amount, 0);
    const totalCOD = partners.reduce((sum, p) => sum + p.codCollected, 0);
    const pendingCOD = settlements.filter(s => s.type === 'COD_DEPOSIT' && s.status !== 'Completed').reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className="space-y-6 lg:space-y-8 pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Finance</h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Settlements & Cash Control</p>
                </div>
                <button 
                    onClick={onRunPayouts}
                    className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                    <RefreshCcw size={20}/>
                </button>
            </header>

            {/* Main Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                <button 
                    onClick={() => setActiveTab('Payouts')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Payouts' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400'}`}
                >
                    Payouts
                </button>
                <button 
                    onClick={() => setActiveTab('COD')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'COD' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400'}`}
                >
                    COD Control
                </button>
            </div>

            {activeTab === 'Payouts' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Payouts</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalPayout.toFixed(0)}</p>
                        </div>
                        <div className="bg-rose-600 p-6 rounded-[32px] text-white space-y-2 shadow-xl shadow-rose-100">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Pending</p>
                            <p className="text-2xl font-black tracking-tighter">₹{pendingPayout.toFixed(0)}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
                        {['All', 'Pending', 'Paid'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                    filter === f 
                                    ? 'bg-slate-900 text-white border-slate-900' 
                                    : 'bg-white text-slate-400 border-slate-100'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredSettlements.map(settlement => (
                                <SettlementCard 
                                    key={settlement.id} 
                                    settlement={settlement} 
                                    partner={partners.find(p => p.id === settlement.partnerId)}
                                    onApprove={onApprove}
                                    onReject={onReject}
                                    onGenerateOtp={onGenerateOtp}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-6 rounded-[32px] text-white space-y-2 shadow-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Total Cash with Partners</p>
                            <p className="text-2xl font-black tracking-tighter">₹{totalCOD.toFixed(0)}</p>
                        </div>
                        <div className="bg-amber-500 p-6 rounded-[32px] text-white space-y-2 shadow-xl shadow-amber-100">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Pending Collection</p>
                            <p className="text-2xl font-black tracking-tighter">₹{pendingCOD.toFixed(0)}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
                        {['All', 'Pending', 'Paid'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                    filter === f 
                                    ? 'bg-slate-900 text-white border-slate-900' 
                                    : 'bg-white text-slate-400 border-slate-100'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {filter !== 'Paid' && codPartners.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Cash in Hand</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {codPartners.map(partner => (
                                        <CODPartnerCard 
                                            key={partner.id} 
                                            partner={partner} 
                                            onCollect={onInitiateCod}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Settlement History</h3>
                            <AnimatePresence mode="popLayout">
                                {filteredSettlements.map(settlement => (
                                    <SettlementCard 
                                        key={settlement.id} 
                                        settlement={settlement} 
                                        partner={partners.find(p => p.id === settlement.partnerId)}
                                        onApprove={onApprove}
                                        onReject={onReject}
                                        onGenerateOtp={onGenerateOtp}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {((activeTab === 'Payouts' && filteredSettlements.length === 0) || (activeTab === 'COD' && codPartners.length === 0)) && (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                        <Receipt size={32} />
                    </div>
                    <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">No records found</p>
                </div>
            )}
        </div>
    );
};

export default Settlements;
