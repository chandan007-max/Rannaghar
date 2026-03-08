
import React, { useState } from 'react';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';
import { useOrder } from '../../context/OrderContext';
import { ShoppingBag, Utensils, Navigation, ShieldCheck, CircleCheckBig, Clock, User, Phone, Package, Handshake, CornerUpLeft, ChevronRight, CheckCircle, AlertTriangle, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../../types';
import { useEffect } from 'react';

const RESTAURANT_LOCATION = { latitude: 21.6253, longitude: 87.5255 };
const RESTAURANT_ADDRESS = "Rannaghar Restaurant, Digha, West Bengal";

const Countdown: React.FC<{ targetTime: string | undefined, label: string, subtext?: string }> = ({ targetTime, label, subtext }) => {
    const [timeLeft, setTimeLeft] = useState<{ minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        if (!targetTime) return;

        const calculateTimeLeft = () => {
            const target = new Date(targetTime).getTime();
            const now = new Date().getTime();
            const diff = target - now;
            
            if (diff <= 0) return { minutes: 0, seconds: 0 };
            
            return {
                minutes: Math.floor(diff / 60000),
                seconds: Math.floor((diff % 60000) / 1000)
            };
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(interval);
    }, [targetTime]);

    if (!timeLeft || !targetTime) return null;

    const formatTime = (time: number) => time.toString().padStart(2, '0');

    return (
        <div className="flex flex-col items-center justify-center bg-slate-900 text-white p-4 rounded-3xl shadow-lg mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter">
                    {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </span>
            </div>
            {timeLeft.minutes === 0 && timeLeft.seconds === 0 && (
                <span className="text-xs font-bold text-rose-400 mt-1 uppercase tracking-widest">Time Up</span>
            )}
            {subtext && (
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 pt-2 border-t border-slate-800 w-full text-center">{subtext}</p>
            )}
        </div>
    );
};

interface ActiveOrderScreenProps {
    order: Order;
}

const ActiveOrderScreen: React.FC<ActiveOrderScreenProps> = ({ order }) => {
    const { recordDeliveryCompletion, recordDeliveryReturn } = useDeliveryPartner();
    const { partnerReached, pickupOrder, startDelivery, completeDelivery, requestReturn, completeReturn } = useOrder();
    const [enteredOtp, setEnteredOtp] = useState('');
    const [otpError, setOtpError] = useState<string | null>(null);
    const [pickupOtp, setPickupOtp] = useState('');
    const [pickupOtpError, setPickupOtpError] = useState<string | null>(null);
    const [returnOtp, setReturnOtp] = useState('');
    const [returnOtpError, setReturnOtpError] = useState<string | null>(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    
    const handleVerifyOtp = () => {
        const result = completeDelivery(order.id, enteredOtp);
        if (result.success) {
            recordDeliveryCompletion(order);
            setOtpError(null);
        } else {
            setOtpError(result.errorMsg || 'Invalid OTP');
        }
    };

    const handleVerifyPickupOtp = () => {
        const result = pickupOrder(order.id);
        if (result.success) {
            setPickupOtpError(null);
        } else {
            setPickupOtpError(result.errorMsg || 'Failed to confirm pickup');
        }
    };

    const handleVerifyReturnOtp = () => {
        const result = completeReturn(order.id, returnOtp);
        if (result.success) {
            const returnCharge = (order.deliveryEarning || 0) * 0.5;
            recordDeliveryReturn({...order, returnDetails: { ...order.returnDetails!, returnCharge }});
            setReturnOtpError(null);
        } else {
            setReturnOtpError(result.errorMsg || 'Invalid Return OTP');
        }
    };

    const RETURN_REASONS = [
        "Customer phone not reachable",
        "Customer denied to accept order",
        "Wrong delivery address",
        "Address locked / No one at home",
        "Order damaged during transit",
        "Other issues"
    ];

    const handleReturnRequest = (reason: string) => {
        requestReturn(order.id, reason);
        setShowReturnModal(false);
    };

    const renderActions = () => {
        const getCustomerEtaText = () => {
            if (!order.estimatedDeliveryTime) return undefined;
            const diff = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
            const mins = Math.max(0, Math.floor(diff / 60000));
            return `Customer Delivery ETA: ${mins} minutes`;
        };

        switch (order.status) {
            case 'PARTNER_ASSIGNED':
                return (
                    <div className="space-y-4">
                        <Countdown targetTime={order.estimatedPickupTime} label="Pickup In" subtext={getCustomerEtaText()} />
                        <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-3">
                            <Navigation className="text-indigo-600 animate-pulse"/>
                            <p className="text-xs font-bold text-indigo-900 leading-tight">Head to the restaurant to pick up the order.</p>
                        </div>
                        <button onClick={() => partnerReached(order.id)} className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black text-lg tracking-widest uppercase shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                            ✅ REACHED RESTAURANT <ChevronRight/>
                        </button>
                    </div>
                );
            case 'PARTNER_REACHED':
                return (
                    <div className="bg-teal-50 text-teal-700 p-8 rounded-[32px] border-4 border-dashed border-teal-200 text-center animate-pulse flex flex-col items-center">
                        <Handshake className="mb-4" size={48} />
                        <p className="font-black text-xl leading-none">WAITING FOR HANDOVER</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">Restaurant is marking handover</p>
                    </div>
                );
            case 'HANDOVER_CONFIRMED':
                return (
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                         <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3">
                            <Package className="text-green-600"/>
                            <p className="text-xs font-bold text-green-900 leading-tight">Restaurant has handed over the order. Confirm pickup to proceed.</p>
                        </div>
                        {pickupOtpError && <p className="text-rose-600 text-xs font-black uppercase mt-2 text-center flex items-center justify-center gap-1"><AlertTriangle size={12}/> {pickupOtpError}</p>}
                        <button onClick={handleVerifyPickupOtp} className="w-full py-6 bg-amber-500 text-white rounded-[24px] font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                            📦 CONFIRM PICKUP
                        </button>
                    </div>
                );
            case 'PICKED_UP':
            case 'OUT_FOR_DELIVERY':
                return (
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <Countdown targetTime={order.estimatedDeliveryTime} label="Deliver Within" />
                        <div className="text-center space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ask Customer for 4-Digit OTP</p>
                            <input 
                                type="tel" 
                                maxLength={4} 
                                value={enteredOtp} 
                                onChange={e => setEnteredOtp(e.target.value)} 
                                disabled={order.otpAttempts !== undefined && order.otpAttempts >= 3}
                                className={`w-full text-center text-5xl tracking-[0.5em] pl-[0.5em] font-black p-6 border-4 rounded-[32px] ${otpError ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50 focus:border-indigo-500 outline-none'} ${(order.otpAttempts !== undefined && order.otpAttempts >= 3) ? 'opacity-50 grayscale' : ''}`} 
                                placeholder="0000" 
                            />
                            {otpError && <p className="text-rose-600 text-xs font-black uppercase mt-2 flex items-center justify-center gap-1"><AlertTriangle size={12}/> {otpError}</p>}
                            {order.otpAttempts !== undefined && order.otpAttempts > 0 && order.otpAttempts < 3 && (
                                <p className="text-amber-600 text-[10px] font-black uppercase mt-1">Attempts: {order.otpAttempts}/3</p>
                            )}
                        </div>
                        <button 
                            onClick={handleVerifyOtp} 
                            disabled={order.otpAttempts !== undefined && order.otpAttempts >= 3}
                            className={`w-full py-6 bg-teal-600 text-white rounded-[24px] font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${(order.otpAttempts !== undefined && order.otpAttempts >= 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ShieldCheck size={28}/> MARK AS DELIVERED
                        </button>
                    </div>
                );
            case 'RETURN_REQUESTED':
                return (
                    <div className="bg-rose-50 text-rose-700 p-8 rounded-[32px] border-4 border-dashed border-rose-200 text-center animate-pulse flex flex-col items-center">
                        <AlertTriangle className="mb-4" size={48} />
                        <p className="font-black text-xl leading-none uppercase">Return Pending Approval</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">Admin is reviewing your request</p>
                    </div>
                );
            case 'RETURN_APPROVED':
                return (
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div className="bg-rose-50 p-4 rounded-2xl flex items-center gap-3">
                            <CornerUpLeft className="text-rose-600"/>
                            <p className="text-xs font-bold text-rose-900 leading-tight">Return Approved. Go back to Rannaghar and enter Return OTP.</p>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ask Restaurant for Return OTP</p>
                            <input 
                                type="tel" 
                                maxLength={4} 
                                value={returnOtp} 
                                onChange={e => setReturnOtp(e.target.value)} 
                                className={`w-full text-center text-5xl tracking-[0.5em] pl-[0.5em] font-black p-6 border-4 rounded-[32px] ${returnOtpError ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50 focus:border-indigo-500 outline-none'}`} 
                                placeholder="0000" 
                            />
                            {returnOtpError && <p className="text-rose-600 text-xs font-black uppercase mt-2 flex items-center justify-center gap-1"><AlertTriangle size={12}/> {returnOtpError}</p>}
                        </div>
                        <button onClick={handleVerifyReturnOtp} className="w-full py-6 bg-rose-600 text-white rounded-[24px] font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                            <ShieldCheck size={28}/> CONFIRM RETURN HANDOVER
                        </button>
                    </div>
                );
            case 'CANCELLED':
                if (order.returnOtp) {
                    return (
                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            <div className="bg-rose-50 p-4 rounded-2xl flex items-center gap-3">
                                <CornerUpLeft className="text-rose-600"/>
                                <p className="text-xs font-bold text-rose-900 leading-tight">Order Cancelled. Return food to restaurant.</p>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ask Restaurant for Return OTP</p>
                                <input 
                                    type="tel" 
                                    maxLength={4} 
                                    value={returnOtp} 
                                    onChange={e => setReturnOtp(e.target.value)} 
                                    className={`w-full text-center text-5xl tracking-[0.5em] pl-[0.5em] font-black p-6 border-4 rounded-[32px] ${returnOtpError ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50 focus:border-indigo-500 outline-none'}`} 
                                    placeholder="0000" 
                                />
                                {returnOtpError && <p className="text-rose-600 text-xs font-black uppercase mt-2 flex items-center justify-center gap-1"><AlertTriangle size={12}/> {returnOtpError}</p>}
                            </div>
                            <button onClick={handleVerifyReturnOtp} className="w-full py-6 bg-rose-600 text-white rounded-[24px] font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                                <ShieldCheck size={28}/> CONFIRM RETURN HANDOVER
                            </button>
                        </div>
                    );
                }
                return null;
            default: return null;
        }
    }

    const isReturnPhase = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'CANCELLED'].includes(order.status);
    const isPickupPhase = ['PARTNER_ASSIGNED', 'PARTNER_REACHED', 'HANDOVER_CONFIRMED'].includes(order.status);
    const targetLocation = (isPickupPhase || isReturnPhase) ? RESTAURANT_LOCATION : order.deliveryAddress?.location || RESTAURANT_LOCATION;
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLocation.latitude},${targetLocation.longitude}`;
    
    return (
        <div className="bg-white min-h-full flex flex-col">
            <header className="bg-slate-900 text-white p-8 pt-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                <h1 className="text-2xl font-black tracking-[0.2em] uppercase leading-none">
                    {isReturnPhase ? "RETURN TO RESTAURANT" : isPickupPhase ? "RESTAURANT PICKUP" : "CUSTOMER DROP-OFF"}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">#{order.id.slice(-6).toUpperCase()} • {order.status}</p>
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-[28px] border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode</p>
                        <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900 text-lg">{order.paymentMode}</p>
                            {order.paymentMode === 'COD' && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black rounded-full uppercase tracking-widest">Collect ₹{order.totalAmount.toFixed(0)}</span>
                            )}
                        </div>
                    </div>
                    <div className="bg-teal-50 p-5 rounded-[28px] border border-teal-100">
                        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">Earning</p>
                        <p className="font-black text-teal-700 text-lg">₹{(order.deliveryEarning || 0).toFixed(0)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm space-y-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-2xl ${(isPickupPhase || isReturnPhase) ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'} shrink-0`}>
                            {(isPickupPhase || isReturnPhase) ? <Utensils size={24}/> : <User size={24}/>}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{(isPickupPhase || isReturnPhase) ? 'Restaurant' : 'Delivery Point'}</p>
                            <p className="font-black text-slate-900 text-lg leading-tight">{(isPickupPhase || isReturnPhase) ? RESTAURANT_ADDRESS : order.deliveryAddress?.fullAddress}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                                {(isPickupPhase || isReturnPhase) ? (
                                    <a href="tel:9876543210" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-slate-200">
                                        <Phone size={12}/> Call Restaurant
                                    </a>
                                ) : (
                                    <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-teal-100">
                                        <Phone size={12}/> Call {order.customerName}
                                    </a>
                                )}
                                
                                {order.status === 'OUT_FOR_DELIVERY' && (
                                    <button 
                                        onClick={() => setShowReturnModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-rose-100"
                                    >
                                        <AlertTriangle size={12}/> Report Issue
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Details Section */}
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})</p>
                    </div>
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-rose-600 border border-slate-100">
                                        {item.quantity}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="p-8 bg-slate-50 rounded-t-[48px] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] space-y-6 border-t border-slate-100">
                 <a 
                    href={gmapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex justify-center items-center py-5 bg-slate-800 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    <Navigation size={18} className="mr-2"/> OPEN GOOGLE MAPS
                </a>
                {renderActions()}
            </footer>

            <AnimatePresence>
                {showReturnModal && (
                    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center p-0 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReturnModal(false)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            <div className="p-8 bg-rose-600 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter">Report Delivery Issue</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">Select a reason to request return</p>
                                </div>
                                <button onClick={() => setShowReturnModal(false)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                                    <X size={20}/>
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto no-scrollbar space-y-3">
                                {RETURN_REASONS.map((reason, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleReturnRequest(reason)}
                                        className="w-full p-5 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-3xl text-left transition-all group flex items-center justify-between"
                                    >
                                        <span className="font-bold text-slate-700 group-hover:text-rose-700">{reason}</span>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-400" />
                                    </button>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <HelpCircle className="text-amber-600 shrink-0" size={18} />
                                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-wide">
                                        Note: Requesting a return will require Admin approval. You will need to return the items to the restaurant.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActiveOrderScreen;
