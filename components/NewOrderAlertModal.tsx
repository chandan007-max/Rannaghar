
import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { ALARM_SOUND } from '../assets/sounds';
import useSound from '../hooks/useSound';
import { BellRing, Check, Clock, ShieldAlert, ChevronLeft, Package, CreditCard, MapPin, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

interface NewOrderAlertModalProps {
    order?: Order;
    onAccept: (orderId: string, prepTime: number) => void;
    onReject: (orderId: string, reason: string) => void;
    onlinePartnersCount?: number;
}

const COUNTDOWN_SECONDS = 240;
const REJECTION_REASONS = [
    'Out of Stock',
    'Kitchen Busy',
    'Restaurant Closing',
    'Delivery Partner Unavailable',
    'Other'
];

const NewOrderAlertModal: React.FC<NewOrderAlertModalProps> = ({ order, onAccept, onReject, onlinePartnersCount = 1 }) => {
    if (!order) return null;
    
    const { play, stop } = useSound(ALARM_SOUND, true);
    const [view, setView] = useState<'MAIN' | 'REJECT'>('MAIN');
    const [prepTime, setPrepTime] = useState<number>(30);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [isMuted, setIsMuted] = useState(true);
    const [selectedRejectReason, setSelectedRejectReason] = useState(REJECTION_REASONS[0]);
 
    useEffect(() => {
        const startSound = async () => {
            try {
                await play();
                setIsMuted(false);
            } catch (e) {
                console.warn("Autoplay blocked", e);
                setIsMuted(true);
            }
        };

        startSound();
        
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onReject(order.id, 'Auto Rejected - No Response');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            stop();
            clearInterval(timer);
        };
    }, [play, stop]);

    const handleFinalAccept = () => {
        stop();
        onAccept(order.id, prepTime);
    };

    const handleUnmute = async () => {
        try {
            // Try to play. This is a direct user action, so it should unlock the audio.
            await play();
            setIsMuted(false);
        } catch (e: any) {
            console.warn("Manual play failed:", e.name, e.message);
            // Even if play fails, we want to let the user see the order details.
            // They can try to accept/reject anyway.
            setIsMuted(false);
        }
    };

    const isUrgent = countdown < 60;
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    const noPartnersOnline = onlinePartnersCount === 0;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/98 z-[9999] flex items-center justify-center p-4 md:p-10 backdrop-blur-2xl"
            onClick={() => { if (isMuted) handleUnmute(); }}
            onTouchStart={() => { if (isMuted) handleUnmute(); }}
        >
             <div 
                className={`bg-white rounded-[48px] shadow-2xl w-full max-w-4xl transform transition-all animate-scale-in overflow-hidden flex flex-col max-h-[95vh] ${noPartnersOnline ? 'ring-8 ring-amber-500/20' : ''}`}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
             >
                
                {/* Header */}
                <div className={`p-6 ${noPartnersOnline ? 'bg-amber-500' : isUrgent ? 'bg-rose-600' : 'bg-indigo-600'} text-white flex items-center justify-between relative overflow-hidden shrink-0`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            {noPartnersOnline ? <AlertTriangle className="h-8 w-8 animate-pulse" /> : isUrgent ? <ShieldAlert className="h-8 w-8 animate-bounce" /> : <BellRing className="h-8 w-8 animate-shake" />}
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black uppercase tracking-tight leading-none">
                                {noPartnersOnline ? 'NO PARTNERS ONLINE' : 'INCOMING REQUEST'}
                            </h2>
                            {isMuted ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleUnmute(); }}
                                    onTouchStart={(e) => { e.stopPropagation(); handleUnmute(); }}
                                    className="mt-2 flex items-center gap-1 bg-white text-rose-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg active:scale-95 transition-all"
                                >
                                    <VolumeX size={12} />
                                    Tap to Unmute Alarm
                                </button>
                            ) : (
                                <div className="mt-1 flex items-center gap-1 text-white/60">
                                    <Volume2 size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">High Volume Alert Active</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 px-6 py-3 rounded-3xl border border-white/10 relative z-10">
                        <Clock size={20}/> 
                        <span className="text-xl font-black tabular-nums tracking-tighter">
                            {minutes}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 md:p-8 flex-1 overflow-y-auto bg-white no-scrollbar">
                    {view === 'MAIN' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            {/* Left Column: Customer & Prep */}
                            <div className="flex flex-col gap-6">
                                {noPartnersOnline && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="text-sm font-bold text-amber-900">No Delivery Partners Available</p>
                                            <p className="text-xs text-amber-700 mt-1">You can still accept this order if you expect a partner to come online soon, or you can decline it.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 md:space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Details</p>
                                        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">{order.customerName}</p>
                                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                                            <MapPin size={16} className="text-indigo-600 shrink-0" />
                                            <p className="text-sm font-bold line-clamp-2">{order.deliveryAddress.label}</p>
                                        </div>
                                        {order.distance !== undefined && (
                                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                Distance: {order.distance.toFixed(1)} KM
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div className="p-3 md:p-4 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-xl shadow-sm text-slate-400 shrink-0">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Items</p>
                                                <p className="text-sm md:text-base font-black text-slate-900">{order.items.length}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 md:p-4 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-xl shadow-sm text-slate-400 shrink-0">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Payment</p>
                                                <p className="text-sm md:text-base font-black text-slate-900">{order.paymentMode}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 bg-indigo-50 rounded-[24px] md:rounded-[32px] border border-indigo-100 space-y-3">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Set Preparation Time</p>
                                    <div className="flex items-center justify-center gap-4 md:gap-6">
                                        <button 
                                            onClick={() => setPrepTime(prev => Math.max(5, prev - 5))}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl md:text-2xl font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-90 shrink-0"
                                        >
                                            -
                                        </button>
                                        <div className="text-center min-w-[80px]">
                                            <span className="text-4xl md:text-5xl font-black text-indigo-600 tracking-tighter leading-none">{prepTime}</span>
                                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">Minutes</p>
                                        </div>
                                        <button 
                                            onClick={() => setPrepTime(prev => prev + 5)}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl md:text-2xl font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-90 shrink-0"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="flex flex-col bg-slate-50 rounded-[24px] md:rounded-[40px] p-4 md:p-6 border border-slate-100">
                                <div className="flex justify-between items-end mb-4 shrink-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</p>
                                    <p className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tighter leading-none">₹{(order.totalAmount || 0).toFixed(0)}</p>
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                    {order.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
                                                    {it.quantity}
                                                </div>
                                                <span className="font-bold text-slate-700 text-xs md:text-sm line-clamp-2">{it.name}</span>
                                            </div>
                                            <span className="font-black text-slate-400 text-xs shrink-0 ml-2">₹{it.basePrice * it.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'REJECT' && (
                        <div className="max-w-md mx-auto space-y-4 md:space-y-6 animate-scale-in py-4 md:py-10">
                            <button onClick={() => setView('MAIN')} className="text-slate-400 font-black uppercase text-[10px] flex items-center gap-2 mb-2 hover:text-indigo-600 transition-colors"><ChevronLeft size={14}/> Go Back</button>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900">Reason for Rejection</h3>
                            <div className="grid grid-cols-1 gap-2 md:gap-3">
                                {REJECTION_REASONS.map(reason => (
                                    <button 
                                        key={reason}
                                        onClick={() => setSelectedRejectReason(reason)}
                                        className={`w-full p-4 md:p-5 rounded-2xl md:rounded-3xl text-left font-bold text-sm md:text-lg transition-all ${selectedRejectReason === reason ? 'bg-rose-50 border-2 border-rose-500 text-rose-700' : 'bg-slate-50 border-2 border-transparent text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-8 bg-slate-50 shrink-0 border-t border-slate-100 flex flex-col md:flex-row items-center gap-3 md:gap-6">
                    {view === 'MAIN' ? (
                        <>
                            <button 
                                onClick={() => {
                                    if (noPartnersOnline) {
                                        setSelectedRejectReason('Delivery Partner Unavailable');
                                    }
                                    setView('REJECT');
                                }} 
                                className="w-full md:w-auto px-6 md:px-10 py-4 md:py-6 font-black text-rose-600 uppercase text-xs tracking-widest hover:bg-rose-50 rounded-2xl md:rounded-3xl transition-colors order-2 md:order-1"
                            >
                                Decline
                            </button>
                            <button onClick={handleFinalAccept} className="w-full md:flex-1 py-4 md:py-6 bg-emerald-500 text-white rounded-[24px] md:rounded-[32px] font-black uppercase tracking-widest shadow-xl md:shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg active:scale-95 transition-all order-1 md:order-2">
                                <Check size={24} strokeWidth={3} className="md:w-7 md:h-7"/> ACCEPT ORDER
                            </button>
                        </>
                    ) : view === 'REJECT' ? (
                        <button onClick={() => onReject(order.id, selectedRejectReason)} className="w-full py-4 md:py-6 bg-rose-600 text-white rounded-[24px] md:rounded-[32px] font-black text-base md:text-lg uppercase tracking-widest shadow-xl md:shadow-2xl shadow-rose-600/30 active:scale-95 transition-all">
                            CONFIRM REJECTION
                        </button>
                    ) : null}
                </div>
            </div>
            <style>{`
                @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                @keyframes shake { 0%, 100% { transform: rotate(0deg); } 20%, 60% { transform: rotate(-10deg); } 40%, 80% { transform: rotate(10deg); } }
                .animate-shake { animation: shake 0.6s infinite; }
            `}</style>
        </div>
    );
};

export default NewOrderAlertModal;
