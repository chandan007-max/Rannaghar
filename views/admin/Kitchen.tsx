
import React, { useMemo } from 'react';
import { 
  Utensils, Clock, CheckCircle2, 
  Printer, AlertCircle, ChevronRight,
  Timer, Flame, PackageCheck, X
} from 'lucide-react';
import type { Order } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import KOTPreviewModal from '../../src/components/admin/KOTPreviewModal';

const KitchenOrderCard: React.FC<{ 
    order: Order; 
    onAccept: (id: string, prepTime: number) => void;
    onMarkPreparing: (id: string) => void;
    onMarkReady: (id: string) => void;
    onHandover: (id: string) => void;
    onPrintKOT: (order: Order) => void;
    isKitchenMode: boolean;
}> = ({ order, onAccept, onMarkPreparing, onMarkReady, onHandover, onPrintKOT, isKitchenMode }) => {
    const timeSinceOrder = Math.floor((Date.now() - new Date(order.date).getTime()) / 60000);
    const isLate = timeSinceOrder > 20;

    const [showPrepTime, setShowPrepTime] = React.useState(false);
    const [selectedPrepTime, setSelectedPrepTime] = React.useState(25);
    const prepTimeOptions = [15, 20, 30, 45, 60];

    const handleAccept = () => {
        onAccept(order.id, selectedPrepTime);
        setShowPrepTime(false);
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-[32px] lg:rounded-[40px] border-2 transition-all duration-500 overflow-hidden flex flex-col h-full ${
                isLate ? 'border-rose-100 shadow-rose-50 shadow-2xl' : 'border-slate-50 shadow-xl shadow-slate-100'
            }`}
        >
            <div className={`${isKitchenMode ? 'p-6 lg:p-10' : 'p-6 lg:p-8'} space-y-6 flex-1`}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center font-black text-xl lg:text-2xl shadow-lg ${
                            order.status === 'NEW' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white'
                        }`}>
                            {order.customerName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 tracking-tighter text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                                {!isKitchenMode && (
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                        order.status === 'NEW' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                        {order.status}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock size={12} className={isLate ? 'text-rose-600' : 'text-slate-400'} />
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isLate ? 'text-rose-600' : 'text-slate-400'}`}>
                                    {timeSinceOrder} Mins Ago
                                </p>
                            </div>
                        </div>
                    </div>
                    {!isKitchenMode && (
                        <button 
                            onClick={() => onPrintKOT(order)}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all"
                        >
                            <Printer size={20} />
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Items to Prepare</p>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className={`flex justify-between items-center bg-slate-50 border border-slate-100 ${isKitchenMode ? 'p-5 rounded-3xl' : 'p-4 rounded-2xl'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-black border border-slate-100 text-rose-600">
                                        {item.quantity}
                                    </div>
                                    <p className={`${isKitchenMode ? 'text-lg' : 'text-sm'} font-black text-slate-800 uppercase tracking-tight`}>{item.name}</p>
                                </div>
                                {item.selectedVariantId && (
                                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-full uppercase tracking-widest">
                                        {item.selectedVariantId.split('-').pop()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {order.instructions && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Kitchen Note</p>
                        <p className="text-sm font-bold text-amber-900 italic">"{order.instructions}"</p>
                    </div>
                )}
            </div>

            <div className={`${isKitchenMode ? 'p-6 lg:p-10' : 'p-6 lg:p-8'} bg-slate-50/50 border-t border-slate-100`}>
                {order.status === 'NEW' && (
                    <div className="space-y-4">
                        {!showPrepTime ? (
                            <button 
                                onClick={() => setShowPrepTime(true)}
                                className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black text-xs lg:text-sm uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Flame size={20} /> Accept & Prepare
                            </button>
                        ) : (
                            <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Set Prep Time (Mins)</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {prepTimeOptions.map(time => (
                                        <button 
                                            key={time}
                                            onClick={() => setSelectedPrepTime(time)}
                                            className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                                                selectedPrepTime === time 
                                                ? 'bg-rose-600 text-white border-rose-600' 
                                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}
                                        >
                                            {time}m
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setShowPrepTime(false)}
                                        className="py-3 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={handleAccept}
                                        className="py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {['ACCEPTED', 'PREPARING'].includes(order.status) && (
                    <button 
                        onClick={() => onMarkReady(order.id)}
                        className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs lg:text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <PackageCheck size={20} /> Mark as Ready
                    </button>
                )}
                {['FOOD_READY', 'ASSIGNED', 'PARTNER_ASSIGNED', 'PARTNER_REACHED'].includes(order.status) && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3 py-2 text-emerald-600">
                            <CheckCircle2 size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Handover</span>
                        </div>
                        {order.status === 'PARTNER_REACHED' && (
                            <button 
                                onClick={() => onHandover(order.id)}
                                className="w-full py-4 bg-emerald-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <PackageCheck size={18} /> Confirm Handover
                            </button>
                        )}
                        {order.status === 'HANDOVER_CONFIRMED' && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-1">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Waiting for partner to confirm pickup</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const Kitchen: React.FC<{ 
    orders: Order[]; 
    onAccept: (id: string, prepTime: number) => void;
    onMarkPreparing: (id: string) => void;
    onMarkReady: (id: string) => void;
    onHandover: (id: string) => void;
}> = ({ orders, onAccept, onMarkPreparing, onMarkReady, onHandover }) => {
    const [isKitchenMode, setIsKitchenMode] = React.useState(false);
    const [selectedOrderForKOT, setSelectedOrderForKOT] = React.useState<Order | null>(null);
    const [isKOTModalOpen, setIsKOTModalOpen] = React.useState(false);

    const handlePrintKOT = (order: Order) => {
        setSelectedOrderForKOT(order);
        setIsKOTModalOpen(true);
    };

    const kitchenOrders = useMemo(() => {
        return orders.filter(o => 
            ['NEW', 'ACCEPTED', 'PREPARING', 'FOOD_READY', 'ASSIGNED', 'PARTNER_ASSIGNED', 'PARTNER_REACHED'].includes(o.status)
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [orders]);

    const sections = [
        { title: 'New Orders', status: 'NEW', color: 'text-rose-500' },
        { title: 'In Preparation', status: 'PREPARING', color: 'text-amber-500' },
        { title: 'Ready for Pickup', status: 'FOOD_READY', color: 'text-emerald-500' },
    ];

    return (
        <div className={`space-y-6 lg:space-y-8 animate-fade-in ${isKitchenMode ? 'fixed inset-0 z-[100] bg-slate-50 p-4 lg:p-8 overflow-y-auto' : ''}`}>
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Kitchen Control</h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time Food Preparation Flow</p>
                </div>
                <div className="flex items-center gap-3 lg:gap-6">
                    <div className="flex items-center gap-3 bg-white p-2 lg:p-4 rounded-xl lg:rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">Kitchen Mode</p>
                        <button 
                            onClick={() => setIsKitchenMode(!isKitchenMode)}
                            className={`w-10 lg:w-14 h-6 lg:h-8 rounded-full relative transition-colors ${isKitchenMode ? 'bg-rose-600' : 'bg-slate-200'}`}
                        >
                            <motion.div 
                                layout
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                animate={{ x: isKitchenMode ? (window.innerWidth > 1024 ? 24 : 16) : 4 }}
                                className="absolute top-1 w-4 lg:w-6 h-4 lg:h-6 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                    {isKitchenMode && (
                        <button 
                            onClick={() => setIsKitchenMode(false)}
                            className="p-3 bg-slate-900 text-white rounded-xl shadow-lg"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </header>

            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 ${isKitchenMode ? 'pb-20' : ''}`}>
                {sections.map(section => (
                    <div key={section.status} className="space-y-4 lg:space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h3 className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] ${section.color}`}>{section.title}</h3>
                            <span className="bg-white px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-black text-slate-400 border border-slate-100">
                                {kitchenOrders.filter(o => 
                                    section.status === 'NEW' ? o.status === 'NEW' :
                                    section.status === 'PREPARING' ? ['ACCEPTED', 'PREPARING'].includes(o.status) :
                                    ['FOOD_READY', 'ASSIGNED', 'PARTNER_ASSIGNED', 'PARTNER_REACHED'].includes(o.status)
                                ).length}
                            </span>
                        </div>
                        <div className="space-y-4 lg:space-y-6">
                            <AnimatePresence mode="popLayout">
                                {kitchenOrders.filter(o => 
                                    section.status === 'NEW' ? o.status === 'NEW' :
                                    section.status === 'PREPARING' ? ['ACCEPTED', 'PREPARING'].includes(o.status) :
                                    ['FOOD_READY', 'ASSIGNED', 'PARTNER_ASSIGNED', 'PARTNER_REACHED'].includes(o.status)
                                ).map(order => (
                                    <KitchenOrderCard 
                                        key={order.id} 
                                        order={order} 
                                        onAccept={onAccept}
                                        onMarkPreparing={onMarkPreparing}
                                        onMarkReady={onMarkReady}
                                        onHandover={onHandover}
                                        onPrintKOT={handlePrintKOT}
                                        isKitchenMode={isKitchenMode}
                                    />
                                ))}
                            </AnimatePresence>
                            {kitchenOrders.filter(o => 
                                section.status === 'NEW' ? o.status === 'NEW' :
                                section.status === 'PREPARING' ? ['ACCEPTED', 'PREPARING'].includes(o.status) :
                                ['FOOD_READY', 'ASSIGNED', 'PARTNER_ASSIGNED', 'PARTNER_REACHED'].includes(o.status)
                            ).length === 0 && (
                                <div className="py-12 text-center border-4 border-dashed border-slate-50 rounded-[32px] lg:rounded-[40px] flex flex-col items-center">
                                    <Utensils size={32} className="text-slate-100 mb-4" />
                                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Queue Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <KOTPreviewModal 
                isOpen={isKOTModalOpen}
                onClose={() => setIsKOTModalOpen(false)}
                order={selectedOrderForKOT}
            />
        </div>
    );
};

export default Kitchen;
