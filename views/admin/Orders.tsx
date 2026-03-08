
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Printer, Eye, 
  MapPin, Clock, ChevronRight, 
  MoreVertical, Download, RefreshCcw,
  AlertCircle, CheckCircle2, Bike, Package,
  ShoppingBag, Phone, ChevronDown, ChevronUp,
  X, Check, Play, Pause, History, List
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import KOTPreviewModal from '../../src/components/admin/KOTPreviewModal';

const StatusTab: React.FC<{ 
    label: string; 
    count: number; 
    isActive: boolean; 
    onClick: () => void;
    color: string;
    glowColor: string;
}> = ({ label, count, isActive, onClick, color, glowColor }) => (
    <button 
        onClick={onClick}
        className={`relative flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${
            isActive 
            ? `bg-white shadow-lg ${color} border-b-4 border-current` 
            : 'bg-slate-100 text-slate-400 border-b-4 border-transparent'
        }`}
    >
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-current text-white' : 'bg-slate-200 text-slate-500'}`}>
            {count}
        </span>
        {isActive && (
            <motion.div 
                layoutId="tab-glow"
                className={`absolute inset-0 rounded-2xl ${glowColor} opacity-20 -z-10`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 0.2 }}
                transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            />
        )}
    </button>
);

const OrderTimer: React.FC<{ order: Order }> = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isOverdue, setIsOverdue] = useState(false);

    const isPrepStatus = ['ACCEPTED', 'PREPARING'].includes(order.status);

    useEffect(() => {
        if (!order.preparationEndTime || !isPrepStatus) return;

        const interval = setInterval(() => {
            const end = new Date(order.preparationEndTime!).getTime();
            const now = Date.now();
            const diff = end - now;
            setTimeLeft(Math.abs(diff));
            setIsOverdue(diff < 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [order.preparationEndTime, isPrepStatus]);

    if (!order.preparationEndTime || !isPrepStatus) return null;

    const totalTime = (order.estimatedPreparationMinutes || 25) * 60000;
    const percentLeft = isOverdue ? 0 : (timeLeft / totalTime) * 100;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const getColor = () => {
        if (isOverdue) return 'text-rose-600';
        if (percentLeft < 20) return 'text-rose-500';
        if (percentLeft < 60) return 'text-amber-500';
        return 'text-emerald-500';
    };

    return (
        <div className={`flex items-center gap-1.5 font-black tracking-tighter ${getColor()}`}>
            <Clock size={14} />
            <span className="text-sm">
                {isOverdue ? 'DELAYED ' : ''}
                {minutes}:{seconds.toString().padStart(2, '0')}
                {!isOverdue ? ' remaining' : ''}
            </span>
        </div>
    );
};

const PickupTimer: React.FC<{ order: Order }> = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isOverdue, setIsOverdue] = useState(false);

    const isPickupStatus = ['ASSIGNED', 'PARTNER_ASSIGNED'].includes(order.status);

    useEffect(() => {
        if (!order.estimatedPickupTime || !isPickupStatus) return;

        const interval = setInterval(() => {
            const end = new Date(order.estimatedPickupTime!).getTime();
            const now = Date.now();
            const diff = end - now;
            setTimeLeft(Math.abs(diff));
            setIsOverdue(diff < 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [order.estimatedPickupTime, isPickupStatus]);

    if (!order.estimatedPickupTime || !isPickupStatus) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const getColor = () => {
        if (isOverdue) return 'text-rose-600';
        if (minutes < 2) return 'text-amber-500';
        return 'text-emerald-500';
    };

    return (
        <div className={`flex flex-col gap-0.5 ${getColor()}`}>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Rider Pickup Time</span>
            <div className="flex items-center gap-1 font-black tracking-tighter">
                <Clock size={12} />
                <span className="text-xs">
                    {isOverdue ? 'DELAYED ' : ''}
                    {minutes}:{seconds.toString().padStart(2, '0')}
                    {!isOverdue ? ' remaining' : ''}
                </span>
            </div>
        </div>
    );
};

const DeliveryTimer: React.FC<{ order: Order }> = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isOverdue, setIsOverdue] = useState(false);

    const isDeliveryStatus = ['ACCEPTED', 'PREPARING', 'FOOD_READY', 'ASSIGNED', 'PARTNER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status);

    useEffect(() => {
        if (!order.estimatedDeliveryTime || !isDeliveryStatus) return;

        const interval = setInterval(() => {
            const end = new Date(order.estimatedDeliveryTime!).getTime();
            const now = Date.now();
            const diff = end - now;
            setTimeLeft(Math.abs(diff));
            setIsOverdue(diff < 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [order.estimatedDeliveryTime, isDeliveryStatus]);

    if (!order.estimatedDeliveryTime || !isDeliveryStatus) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const getColor = () => {
        if (isOverdue) return 'text-rose-600';
        if (minutes < 5) return 'text-amber-500';
        return 'text-emerald-500';
    };

    // Calculate travel time from total time minus prep time
    const prepTime = order.estimatedPreparationMinutes || 0;
    const totalMinutes = Math.floor((new Date(order.estimatedDeliveryTime).getTime() - new Date(order.date).getTime()) / 60000);
    const travelTime = Math.max(0, totalMinutes - prepTime);

    return (
        <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Prep Time: {prepTime} min</span>
                <span>Travel Time: {travelTime} min</span>
            </div>
        </div>
    );
};

const ArchiveTimer: React.FC<{ order: Order }> = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!order.archiveAt || order.isArchived) return;

        const interval = setInterval(() => {
            const end = new Date(order.archiveAt!).getTime();
            const now = Date.now();
            const diff = Math.max(0, end - now);
            setTimeLeft(diff);
        }, 1000);

        return () => clearInterval(interval);
    }, [order.archiveAt, order.isArchived]);

    if (!order.archiveAt || order.isArchived) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            Moving to history in {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
    );
};

const OrderTimeline: React.FC<{ order: Order }> = ({ order }) => {
    const steps = [
        { status: 'NEW', label: 'Order Placed' },
        { status: 'ACCEPTED', label: 'Accepted' },
        { status: 'PREPARING', label: 'Preparing' },
        { status: 'FOOD_READY', label: 'Ready' },
        { status: 'PARTNER_ASSIGNED', label: 'Partner Assigned' },
        { status: 'PARTNER_REACHED', label: 'Reached' },
        { status: 'HANDOVER_CONFIRMED', label: 'Handover' },
        { status: 'PICKED_UP', label: 'Picked Up' },
        { status: 'DELIVERED', label: 'Delivered' },
    ];

    return (
        <div className="space-y-4 py-4">
            {steps.map((step, idx) => {
                const timestamp = order.statusTimestamps[step.status as OrderStatus];
                const isCompleted = !!timestamp;
                const isLast = idx === steps.length - 1;

                return (
                    <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`} />
                            {!isLast && <div className={`w-0.5 flex-1 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                        </div>
                        <div className="pb-4">
                            <p className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                {step.label}
                            </p>
                            {timestamp && (
                                <p className="text-[10px] font-bold text-slate-400">
                                    {new Date(timestamp).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const Orders: React.FC<{ 
    orders: Order[]; 
    onAccept: (id: string, prepTime: number) => void;
    onReject: (id: string) => void;
    onMarkPreparing: (id: string) => void;
    onMarkReady: (id: string) => void;
    onDispatch: (id: string) => void;
    onHandover: (id: string) => void;
    onApproveReturn: (id: string) => void;
    onRejectReturn: (id: string) => void;
    onCompleteReturn: (id: string, otp: string) => { success: boolean; errorMsg?: string };
    onToggleHold: (id: string) => void;
}> = ({ 
    orders, onAccept, onReject, onMarkPreparing, onMarkReady, 
    onDispatch, onHandover, onApproveReturn, onRejectReturn, 
    onCompleteReturn, onToggleHold 
}) => {
    const [activeTab, setActiveTab] = useState('Preparing');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isKOTModalOpen, setIsKOTModalOpen] = useState(false);
    const [isHistoryView, setIsHistoryView] = useState(false);

    const tabs = [
        { label: 'Preparing', statuses: ['NEW', 'ACCEPTED', 'PREPARING'], color: 'text-amber-600', glow: 'bg-amber-400' },
        { label: 'Ready', statuses: ['FOOD_READY', 'ASSIGNED'], color: 'text-blue-600', glow: 'bg-blue-400' },
        { label: 'Pickup', statuses: ['PARTNER_ASSIGNED', 'PARTNER_REACHED', 'HANDOVER_CONFIRMED'], color: 'text-purple-600', glow: 'bg-purple-400' },
        { label: 'Out', statuses: ['PICKED_UP', 'OUT_FOR_DELIVERY'], color: 'text-sky-600', glow: 'bg-sky-400' },
        { label: 'Delivered', statuses: ['DELIVERED'], color: 'text-emerald-600', glow: 'bg-emerald-400' },
        { label: 'Cancelled', statuses: ['CANCELLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED_TO_RESTAURANT'], color: 'text-rose-600', glow: 'bg-rose-400' },
    ];

    const counts = useMemo(() => {
        const c: Record<string, number> = {};
        tabs.forEach(t => {
            c[t.label] = orders.filter(o => !o.isArchived && t.statuses.includes(o.status)).length;
        });
        return c;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        let result = orders;

        if (isHistoryView) {
            result = result.filter(o => o.isArchived);
        } else {
            const tab = tabs.find(t => t.label === activeTab);
            if (tab) {
                result = result.filter(o => !o.isArchived && tab.statuses.includes(o.status));
            }
        }

        if (searchQuery) {
            result = result.filter(o => 
                o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sorting: Overdue first, then remaining time, then newest
        return result.sort((a, b) => {
            if (!isHistoryView) {
                const now = Date.now();
                const aEnd = a.preparationEndTime ? new Date(a.preparationEndTime).getTime() : Infinity;
                const bEnd = b.preparationEndTime ? new Date(b.preparationEndTime).getTime() : Infinity;
                
                const aOverdue = aEnd < now;
                const bOverdue = bEnd < now;

                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                
                if (aEnd !== bEnd) return aEnd - bEnd;
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [orders, activeTab, searchQuery, isHistoryView]);

    return (
        <div className="pb-24 space-y-6">
            <header className="flex justify-between items-center px-4 pt-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                        {isHistoryView ? 'Order History' : 'Live Dashboard'}
                    </h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {isHistoryView ? 'Archived records' : 'Real-time kitchen control'}
                    </p>
                </div>
                <button 
                    onClick={() => setIsHistoryView(!isHistoryView)}
                    className={`p-3 rounded-2xl transition-all ${isHistoryView ? 'bg-rose-600 text-white' : 'bg-white border border-slate-100 text-slate-400'}`}
                >
                    {isHistoryView ? <List size={20} /> : <History size={20} />}
                </button>
            </header>

            {!isHistoryView && (
                <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
                    {tabs.map(t => (
                        <StatusTab 
                            key={t.label}
                            label={t.label}
                            count={counts[t.label]}
                            isActive={activeTab === t.label}
                            onClick={() => setActiveTab(t.label)}
                            color={t.color}
                            glowColor={t.glow}
                        />
                    ))}
                </div>
            )}

            <div className="px-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by ID or Name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:border-rose-600 outline-none transition-all font-bold text-sm"
                    />
                </div>
            </div>

            <div className="px-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => (
                        <motion.div 
                            key={order.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`bg-white rounded-[32px] border-2 overflow-hidden shadow-sm ${
                                order.status === 'NEW'
                                ? 'border-blue-500 shadow-blue-100 animate-pulse'
                                : order.preparationEndTime && new Date(order.preparationEndTime).getTime() < Date.now() && ['ACCEPTED', 'PREPARING'].includes(order.status)
                                ? 'border-rose-500 shadow-rose-100' 
                                : 'border-slate-100 shadow-slate-100'
                            }`}
                        >
                            <div className="p-5 space-y-4" onClick={() => setSelectedOrder(order)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-base font-black text-slate-900 tracking-tighter uppercase">#{order.id.slice(-6)}</span>
                                            <span className="text-[10px] font-black text-slate-400">|</span>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">₹{order.totalAmount} {order.paymentMode}</span>
                                        </div>
                                        <OrderTimer order={order} />
                                        <PickupTimer order={order} />
                                        <DeliveryTimer order={order} />
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                                        (order.status === 'CANCELLED' || order.status === 'RETURNED_TO_RESTAURANT') ? 'bg-rose-50 text-rose-600' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {order.status === 'DELIVERED' ? <CheckCircle2 size={20} /> :
                                         (order.status === 'CANCELLED' || order.status === 'RETURNED_TO_RESTAURANT') ? <X size={20} /> :
                                         <Package size={20} />}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900">{order.customerName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed truncate">{order.deliveryAddress.fullAddress}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{order.customerPhone}</p>
                                </div>

                                {order.instructions && (
                                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Kitchen Note</p>
                                        <p className="text-[11px] font-bold text-amber-800 italic">"{order.instructions}"</p>
                                    </div>
                                )}

                                <div className="py-3 border-y border-slate-50 space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Items ({order.items.length})</p>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-[11px] font-bold">
                                            <span className="text-slate-600">• {item.name} ×{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.status === 'PREPARING' && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onToggleHold(order.id); }}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${
                                                order.isHeld ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {order.isHeld ? <Play size={14} /> : <Pause size={14} />}
                                            {order.isHeld ? 'Resume' : 'Hold'}
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsKOTModalOpen(true); }}
                                            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Printer size={14} /> KOT
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onMarkReady(order.id); }}
                                            className="flex-[1.5] py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100"
                                        >
                                            Mark Ready
                                        </button>
                                    </div>
                                )}

                                {order.status === 'FOOD_READY' && (
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            Print Bill
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDispatch(order.id); }}
                                            className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                                        >
                                            Assign Partner
                                        </button>
                                    </div>
                                )}

                                {['PARTNER_ASSIGNED', 'PARTNER_REACHED', 'HANDOVER_CONFIRMED'].includes(order.status) && (
                                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                                    <Bike size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-purple-900">{order.partnerDetails?.name}</p>
                                                    <p className="text-[8px] font-bold text-purple-400 uppercase tracking-widest">{order.partnerDetails?.vehicleNumber}</p>
                                                </div>
                                            </div>
                                            <a href={`tel:${order.partnerDetails?.phone}`} className="text-purple-600">
                                                <Phone size={16} />
                                            </a>
                                        </div>
                                        <button 
                                            disabled={order.status === 'HANDOVER_CONFIRMED'}
                                            onClick={(e) => { e.stopPropagation(); onHandover(order.id); }}
                                            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                order.status === 'HANDOVER_CONFIRMED' 
                                                ? 'bg-purple-100 text-purple-400' 
                                                : 'bg-purple-600 text-white shadow-lg shadow-purple-100'
                                            }`}
                                        >
                                            {order.status === 'HANDOVER_CONFIRMED' ? 'Waiting for Pickup' : 'Handover Food'}
                                        </button>
                                    </div>
                                )}

                                {['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-sky-50 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                            <MapPin size={14} /> Live Track
                                        </button>
                                        <a href={`tel:${order.partnerDetails?.phone}`} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Phone size={14} /> Call
                                        </a>
                                    </div>
                                )}

                                {order.status === 'RETURN_REQUESTED' && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRejectReturn(order.id); }}
                                            className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onApproveReturn(order.id); }}
                                            className="flex-[2] py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100"
                                        >
                                            Approve Return
                                        </button>
                                    </div>
                                )}

                                {order.status === 'RETURN_APPROVED' && (
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-black uppercase tracking-widest text-orange-600">
                                            Return Approved
                                        </p>
                                        <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl inline-block">
                                            <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Return OTP</p>
                                            <p className="text-xl font-black text-orange-600 tracking-widest">{order.returnOtp}</p>
                                        </div>
                                    </div>
                                )}

                                {(order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'RETURNED_TO_RESTAURANT') && (
                                    <div className="text-center space-y-2">
                                        <p className={`text-sm font-black uppercase tracking-widest ${order.status === 'DELIVERED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {order.status === 'DELIVERED' ? 'Delivered Successfully' : order.status === 'RETURNED_TO_RESTAURANT' ? 'Returned to Restaurant' : 'Order Cancelled'}
                                        </p>
                                        {order.status === 'CANCELLED' && order.returnOtp && (
                                            <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl inline-block">
                                                <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Return OTP</p>
                                                <p className="text-xl font-black text-rose-600 tracking-widest">{order.returnOtp}</p>
                                            </div>
                                        )}
                                        {!order.isArchived && <ArchiveTimer order={order} />}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                            <ShoppingBag size={32} />
                        </div>
                        <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">No orders found</p>
                    </div>
                )}
            </div>

            {/* Order Detail Overlay */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed inset-0 bg-white z-[1000] flex flex-col"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-slate-50">
                            <button onClick={() => setSelectedOrder(null)} className="p-2 -ml-2 text-slate-400">
                                <X size={24} />
                            </button>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Order Details</h3>
                            <div className="flex gap-2">
                                {!['DELIVERED', 'CANCELLED', 'RETURNED_TO_RESTAURANT'].includes(selectedOrder.status) && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to cancel this order?')) {
                                                onReject(selectedOrder.id);
                                                setSelectedOrder(null);
                                            }
                                        }} 
                                        className="p-2 text-rose-600 bg-rose-50 rounded-xl"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <button onClick={() => setIsKOTModalOpen(true)} className="p-2 text-slate-600 bg-slate-100 rounded-xl">
                                    <Printer size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">#{selectedOrder.id.slice(-6)}</h4>
                                    <div className="mt-2 flex gap-4">
                                        <OrderTimer order={selectedOrder} />
                                        <PickupTimer order={selectedOrder} />
                                        <DeliveryTimer order={selectedOrder} />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-rose-600 tracking-tighter">₹{selectedOrder.totalAmount}</p>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedOrder.paymentMode}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[32px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lifecycle Timeline</p>
                                <OrderTimeline order={selectedOrder} />
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</p>
                                <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-2">
                                    <p className="text-sm font-black text-slate-900">{selectedOrder.customerName}</p>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{selectedOrder.deliveryAddress.fullAddress}</p>
                                    <a href={`tel:${selectedOrder.customerPhone}`} className="inline-flex items-center gap-2 text-rose-600 text-xs font-black uppercase tracking-widest mt-2">
                                        <Phone size={14} /> {selectedOrder.customerPhone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <KOTPreviewModal 
                isOpen={isKOTModalOpen}
                onClose={() => setIsKOTModalOpen(false)}
                order={selectedOrder || undefined}
            />
        </div>
    );
};

export default Orders;
