
import React, { useEffect, useState, useMemo } from 'react';
import { Order } from '../types';
import { ALARM_SOUND } from '../assets/sounds';
import useSound from '../hooks/useSound';
import { useSettings } from '../context/SettingsContext';
import { BellRing, Check, X, MapPin, BadgeIndianRupee, Clock, Zap, ChevronRight, Navigation, Package, Volume2, VolumeX, ChevronLeft, ShieldAlert } from 'lucide-react';

interface NewAssignmentAlertModalProps {
    order: Order;
    onAccept: () => void;
    onReject: (reason: string) => void;
}

const COUNTDOWN_SECONDS = 180; // 3 minutes for Partner response
const REJECTION_REASONS = [
    'Vehicle Breakdown',
    'Too Far Away',
    'Not Enough Payout',
    'Ending Shift',
    'Other'
];

const NewAssignmentAlertModal: React.FC<NewAssignmentAlertModalProps> = ({ order, onAccept, onReject }) => {
    const { play, stop } = useSound(ALARM_SOUND, true);
    const { settings } = useSettings();
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [isMuted, setIsMuted] = useState(false);
    const [view, setView] = useState<'MAIN' | 'REJECT'>('MAIN');
    const [selectedRejectReason, setSelectedRejectReason] = useState(REJECTION_REASONS[0]);

    const partnerEarning = useMemo(() => {
        if (!settings || !order) return 0;
        if (settings.partnerEarningModel === 'percentage') {
            return (order.deliveryCharge || 0) * (settings.partnerEarningValue / 100);
        }
        return settings.partnerEarningValue || 0;
    }, [settings, order]);
    
    useEffect(() => {
        // Attempt to play sound
        const startSound = async () => {
            try {
                await play();
                setIsMuted(false);
            } catch (e) {
                console.warn("Autoplay blocked or audio failed", e);
                setIsMuted(true);
            }
        };

        startSound();
        
        // Safe Notification triggering
        try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification("🚚 RANNAGHAR: NEW GIG", {
                    body: `Earn ₹${partnerEarning.toFixed(0)} • ${(order.distance || 0).toFixed(1)}km away`,
                    requireInteraction: true
                });
            }
        } catch (e) {
            console.error("Notification creation failed", e);
        }

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onReject('Auto Rejected - Timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => {
            stop();
            clearInterval(timer);
        };
    }, [play, stop, partnerEarning, onReject, order.distance]);

    const handleAccept = () => {
        stop();
        onAccept();
    };

    const handleFinalReject = () => {
        stop();
        onReject(selectedRejectReason);
    };

    const handleUnmute = async () => {
        try {
            await play();
            setIsMuted(false);
        } catch (e) {
            console.error("Manual play failed:", e);
        }
    };
    
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    const isUrgent = countdown < 60;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 md:p-6">
            <div className={`bg-white rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-sm transform transition-all animate-pop-in overflow-hidden flex flex-col max-h-[95vh] ${isUrgent ? 'ring-4 md:ring-8 ring-rose-500/20' : ''}`}>
                
                {/* Header */}
                <div className={`p-6 md:p-8 text-white text-center relative shrink-0 ${isUrgent ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                    {isUrgent && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
                    {isMuted && (
                        <button 
                            onClick={handleUnmute}
                            className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all animate-pulse flex items-center gap-2"
                        >
                            <VolumeX size={16} />
                            <span className="text-[8px] font-black uppercase hidden sm:inline">Unmute</span>
                        </button>
                    )}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-white/20 p-3 md:p-4 rounded-[24px] md:rounded-[28px] mb-3 md:mb-4">
                            {isUrgent ? <ShieldAlert className="h-8 w-8 md:h-12 md:w-12 animate-bounce" /> : <BellRing className="h-8 w-8 md:h-12 md:w-12 animate-shake" />}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">NEW GIG ALERT</h2>
                        {!isMuted && (
                            <div className="mt-2 flex items-center gap-1 text-white/60">
                                <Volume2 size={12} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Sound Playing</span>
                            </div>
                        )}
                        <div className="mt-3 md:mt-4 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full">
                            <Clock size={16} className="text-amber-400"/>
                            <p className="text-xs font-black uppercase tracking-widest tabular-nums">
                                Reassigning in {minutes}:{String(seconds).padStart(2, '0')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 md:p-8 space-y-6 md:space-y-8 overflow-y-auto no-scrollbar flex-1">
                    {view === 'MAIN' && (
                        <>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potential Payout</p>
                                <p className="text-5xl md:text-6xl font-black text-teal-600 tracking-tighter">₹{partnerEarning.toFixed(0)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 md:p-4 rounded-2xl md:rounded-3xl flex flex-col items-center gap-1 border border-slate-100">
                                    <Navigation size={18} className="text-indigo-500" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Distance</p>
                                    <p className="font-black text-slate-800">{(order.distance || 0).toFixed(1)} KM</p>
                                </div>
                                <div className="bg-slate-50 p-3 md:p-4 rounded-2xl md:rounded-3xl flex flex-col items-center gap-1 border border-slate-100">
                                    <BadgeIndianRupee size={18} className="text-amber-500" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Method</p>
                                    <p className="font-black text-slate-800">{order.paymentMode || 'COD'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 rounded-2xl md:rounded-[32px] border border-slate-100">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 shrink-0"><MapPin size={18} className="md:w-5 md:h-5"/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Drop Location</p>
                                        <p className="text-xs md:text-sm font-bold text-slate-700 leading-snug line-clamp-2">{order.deliveryAddress?.fullAddress || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {view === 'REJECT' && (
                        <div className="space-y-4 animate-pop-in pb-4">
                            <button onClick={() => setView('MAIN')} className="text-slate-400 font-black uppercase text-[10px] flex items-center gap-2 mb-2 hover:text-indigo-600 transition-colors"><ChevronLeft size={14}/> Go Back</button>
                            <h3 className="text-lg md:text-xl font-black text-slate-900">Reason for Rejection</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {REJECTION_REASONS.map(reason => (
                                    <button 
                                        key={reason}
                                        onClick={() => setSelectedRejectReason(reason)}
                                        className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl text-left font-bold text-sm transition-all ${selectedRejectReason === reason ? 'bg-rose-50 border-2 border-rose-500 text-rose-700' : 'bg-slate-50 border-2 border-transparent text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-8 bg-slate-50 shrink-0 flex flex-col gap-3 md:gap-4 border-t border-slate-100">
                    {view === 'MAIN' ? (
                        <>
                            <button onClick={handleAccept} className="w-full py-4 md:py-6 bg-teal-500 text-white rounded-[24px] md:rounded-[28px] font-black uppercase text-base md:text-lg tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3">
                                <Zap size={20} fill="currentColor" className="md:w-6 md:h-6"/> ACCEPT GIG <ChevronRight size={20} className="md:w-6 md:h-6"/>
                            </button>
                            <button onClick={() => setView('REJECT')} className="w-full py-3 font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-rose-600 transition-colors">
                                Decline this Gig
                            </button>
                        </>
                    ) : view === 'REJECT' ? (
                        <button onClick={handleFinalReject} className="w-full py-4 md:py-6 bg-rose-600 text-white rounded-[24px] md:rounded-[28px] font-black text-base md:text-lg uppercase tracking-widest shadow-xl shadow-rose-600/30 active:scale-95 transition-all">
                            CONFIRM REJECTION
                        </button>
                    ) : null}
                </div>
            </div>
            <style>{`
                @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                @keyframes shake { 0%, 100% { transform: rotate(0deg); } 20%, 60% { transform: rotate(-10deg); } 40%, 80% { transform: rotate(10deg); } }
                .animate-shake { animation: shake 0.6s infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default NewAssignmentAlertModal;
