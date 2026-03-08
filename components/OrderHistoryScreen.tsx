
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useDeliveryPartner } from '../context/DeliveryPartnerContext';
import { Order, OrderStatus } from '../types';
import { 
  CircleCheckBig, Bike, MessageSquarePlus, Phone, Utensils, 
  Clock, MapPin, Receipt, History, Activity, Package
} from 'lucide-react';
import { ReviewModal } from './ReviewModal';
import LiveTrackingMap from './LiveTrackingMap';

const ONGOING_STATUSES: OrderStatus[] = [
  'NEW', 'ACCEPTED', 'PREPARING', 'FOOD_READY', 'ASSIGNED', 
  'PARTNER_ASSIGNED', 'PARTNER_REACHED', 'HANDOVER_CONFIRMED', 'PICKED_UP', 'OUT_FOR_DELIVERY',
  'RETURN_REQUESTED', 'RETURN_APPROVED'
];

const COMPLETED_STATUSES: OrderStatus[] = ['DELIVERED', 'RETURNED_TO_RESTAURANT', 'CANCELLED'];

const ORDER_STAGES = [
  { key: 'NEW', label: 'Order Placed', icon: Receipt },
  { key: 'PREPARING', label: 'Preparing Food', icon: Utensils },
  { key: 'FOOD_READY', label: 'Food Ready', icon: Package },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Bike },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', icon: CircleCheckBig },
];

const Countdown: React.FC<{ order: Order }> = ({ order }) => {
    const targetTime = order.estimatedDeliveryTime;
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
    
    // Calculate total estimated minutes
    const totalMinutes = Math.floor((new Date(targetTime).getTime() - new Date(order.date).getTime()) / 60000);

    return (
        <div className="flex flex-col gap-4 bg-indigo-50 p-5 rounded-[32px] border border-indigo-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Estimated Delivery Time</p>
                    <p className="text-sm font-black text-slate-900">{totalMinutes} Minutes</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                    <Clock size={24} />
                </div>
            </div>
            
            <div className="pt-4 border-t border-indigo-100/50">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Arriving In</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                        {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                    </span>
                    {timeLeft.minutes === 0 && timeLeft.seconds === 0 && (
                        <span className="text-xs font-bold text-indigo-600 ml-2">Arriving Now</span>
                    )}
                </div>
            </div>
        </div>
    )
}

const OrderStatusTimeline: React.FC<{ order: Order }> = ({ order }) => {
    const getStageIndex = (status: Order['status']) => {
        switch (status) {
            case 'NEW': return 0;
            case 'ACCEPTED':
            case 'PREPARING': return 1;
            case 'FOOD_READY': return 2;
            case 'ASSIGNED': 
            case 'PARTNER_ASSIGNED':
            case 'PARTNER_REACHED': 
            case 'HANDOVER_CONFIRMED': 
            case 'PICKED_UP': 
                return 3;
            case 'OUT_FOR_DELIVERY': 
                return 4;
            case 'DELIVERED': 
                return 5;
            default: return -1;
        }
    };

    const currentStageIndex = getStageIndex(order.status);
    
    const getTimestampForStage = (stageKey: string) => {
        if (!order.statusTimestamps) return null;
        
        // Map stage keys to the most relevant status that would trigger it
        let relevantStatus: OrderStatus | undefined;
        switch (stageKey) {
            case 'NEW': relevantStatus = 'NEW'; break;
            case 'PREPARING': relevantStatus = 'PREPARING'; break;
            case 'FOOD_READY': relevantStatus = 'FOOD_READY'; break;
            case 'PICKED_UP': relevantStatus = 'PICKED_UP'; break;
            case 'OUT_FOR_DELIVERY': relevantStatus = 'OUT_FOR_DELIVERY'; break;
            case 'DELIVERED': relevantStatus = 'DELIVERED'; break;
        }
        
        if (relevantStatus && order.statusTimestamps[relevantStatus]) {
            const date = new Date(order.statusTimestamps[relevantStatus]!);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return null;
    };

    return (
        <div className="relative flex justify-between items-start pt-2 pb-6 px-2">
            {/* Background Line */}
            <div className="absolute top-[22px] left-8 right-8 h-0.5 bg-slate-100 -z-0"></div>
            
            {ORDER_STAGES.map((stage, index) => {
                const isPast = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const Icon = stage.icon;
                const timestamp = getTimestampForStage(stage.key);

                return (
                    <div key={stage.key} className="flex flex-col items-center gap-2 relative z-10 w-12">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isPast || isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-300'}`}>
                           {isPast ? <CircleCheckBig size={14}/> : <Icon size={14} className={isCurrent ? 'animate-pulse' : ''} />}
                        </div>
                        <div className="flex flex-col items-center">
                            <p className={`text-[7px] font-black uppercase tracking-tighter text-center leading-tight ${isPast || isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {stage.label}
                            </p>
                            {timestamp && (
                                <p className="text-[6px] font-bold text-slate-400 mt-0.5 tracking-wider">
                                    {timestamp}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const OTPCountdown: React.FC<{ generatedAt: string | undefined }> = ({ generatedAt }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!generatedAt) return;

        const calculateTime = () => {
            const expiry = new Date(generatedAt).getTime() + 60 * 60000;
            const now = Date.now();
            const diff = (expiry - now) / 60000;
            return Math.max(0, Math.ceil(diff));
        };

        setTimeLeft(calculateTime());
        const interval = setInterval(() => setTimeLeft(calculateTime()), 30000);
        return () => clearInterval(interval);
    }, [generatedAt]);

    if (timeLeft === null || !generatedAt) return null;

    return (
        <p className="text-[9px] font-bold mt-4 uppercase opacity-60">
            {timeLeft === 0 ? "OTP Expired" : `Valid for next ${timeLeft} minutes`}
        </p>
    );
}

const OrderCard: React.FC<{ order: Order; isHighlighted: boolean; onHighlightSeen: () => void; }> = ({ order, isHighlighted, onHighlightSeen }) => {
  const { allPartners } = useDeliveryPartner();
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const isOngoing = ONGOING_STATUSES.includes(order.status);
  const [isExpanded, setIsExpanded] = useState(isHighlighted || isOngoing);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const partner = order.partnerId ? allPartners[order.partnerId] : undefined;
  const partnerLocation = partner?.currentLocation;
  
  useEffect(() => {
    if (isHighlighted) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onHighlightSeen();
    }
  }, [isHighlighted, onHighlightSeen]);

  useEffect(() => {
    if (isOngoing) {
        setIsExpanded(true);
    }
  }, [isOngoing]);

  const getStatusStyle = (status: Order['status']) => {
    if (status === 'DELIVERED') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (['CANCELLED', 'RETURNED_TO_RESTAURANT', 'RETURN_REQUESTED', 'RETURN_APPROVED'].includes(status)) return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-indigo-50 text-indigo-600 border-indigo-100';
  };

  const itemPrice = (item: any) => ((item.basePrice || 0) + (item.variants?.[0]?.price || 0)) * item.quantity;

  return (
    <>
      <div 
        ref={cardRef} 
        className={`bg-white rounded-[40px] border transition-all duration-300 overflow-hidden ${isHighlighted || isExpanded ? 'border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-100 shadow-xl shadow-slate-200/50'}`}
      >
        <div 
          onClick={() => !isOngoing && setIsExpanded(!isExpanded)}
          className={`p-8 transition-transform ${!isOngoing ? 'cursor-pointer active:scale-[0.98]' : ''}`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-3xl border flex items-center justify-center font-black text-xl shrink-0 ${getStatusStyle(order.status)}`}>
                        {order.items[0]?.name.charAt(0) || 'R'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 tracking-tighter">#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(order.status)}`}>{order.status}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'} • ₹{order.totalAmount.toFixed(0)}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{new Date(order.date).toLocaleDateString()}</p>
                    <p className="text-xs font-black text-slate-900">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-8 pt-8 border-t border-slate-50 space-y-8 animate-slide-up">
                    
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</p>
                        <div className="space-y-2">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black border border-slate-100">{item.quantity}</span>
                                        <p className="text-xs font-black text-slate-800">{item.name}</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">₹{itemPrice(item)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Status</p>
                         </div>
                         {isOngoing && order.estimatedDeliveryTime && <Countdown order={order} />}
                         <OrderStatusTimeline order={order} />
                    </div>

                    {order.partnerDetails && (
                        <div className="bg-slate-900 p-6 rounded-[32px] text-white flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5">
                                    <Bike size={24}/>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Delivery Partner</p>
                                    <p className="text-sm font-black text-white">{order.partnerDetails.name}</p>
                                </div>
                            </div>
                            <a href={`tel:${order.partnerDetails.phone}`} className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-colors">
                                <Phone size={20}/>
                            </a>
                        </div>
                    )}

                    {(order.status === 'OUT_FOR_DELIVERY' || order.status === 'PICKED_UP') && order.deliveryOtp && (
                        <div className="space-y-6">
                            {order.status === 'OUT_FOR_DELIVERY' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                                <Bike size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Delivery Partner</p>
                                                <p className="text-sm font-black text-slate-900 leading-none">{partner?.name || 'Assigning Partner...'}</p>
                                            </div>
                                        </div>
                                        {partner?.phone && (
                                            <a href={`tel:${partner.phone}`} className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                                <Phone size={18} />
                                            </a>
                                        )}
                                    </div>
                                    <LiveTrackingMap 
                                        customerLocation={order.deliveryAddress?.location} 
                                        orderDistance={order.distance || 0}
                                        partnerLocation={partnerLocation}
                                    />
                                </div>
                            )}
                            <div className="bg-amber-500 p-8 rounded-[32px] text-white text-center shadow-xl shadow-amber-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Delivery Verification Code</p>
                                <div className="flex items-center justify-center gap-4">
                                    <p className="text-6xl font-black tracking-[0.4em] pl-[0.4em]">{order.deliveryOtp}</p>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(order.deliveryOtp!);
                                            alert('OTP Copied!');
                                        }}
                                        className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-colors"
                                    >
                                        <Receipt size={20} />
                                    </button>
                                </div>
                                <p className="text-[10px] font-black mt-6 bg-white/20 py-2 px-4 rounded-full inline-block">
                                    Do not share OTP before receiving order
                                </p>
                                <OTPCountdown generatedAt={order.otpGeneratedAt} />
                                <p className="text-[9px] font-bold mt-4 uppercase opacity-60">Share this ONLY with the rider upon arrival</p>
                            </div>
                        </div>
                    )}

                    {order.status === 'RETURN_REQUESTED' && (
                        <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 text-center">
                            <p className="text-rose-600 font-black text-xs uppercase tracking-widest">Return Requested</p>
                            <p className="text-[10px] font-bold text-rose-400 mt-1">Our team is reviewing the return request.</p>
                        </div>
                    )}

                    {order.status === 'RETURN_APPROVED' && (
                        <div className="bg-rose-500 p-6 rounded-[32px] text-white text-center shadow-xl shadow-rose-100">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Return Approved</p>
                            <p className="text-xs font-bold mt-1">The order is being returned to the restaurant.</p>
                        </div>
                    )}

                    {!isOngoing && order.status === 'DELIVERED' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setReviewModalOpen(true); }}
                            className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquarePlus size={18} /> Rate Your Meal
                        </button>
                    )}

                    {isOngoing && (
                         <a 
                            href="tel:9647166166" 
                            className="w-full py-4 border-2 border-slate-100 rounded-[24px] text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                        >
                            <Phone size={14}/> Contact Restaurant Support
                        </a>
                    )}
                </div>
            )}
        </div>
      </div>
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        order={order}
      />
    </>
  );
};

const OrderHistoryScreen: React.FC<{ highlightOrderId: string | null; onHighlightSeen: () => void; }> = ({ highlightOrderId, onHighlightSeen }) => {
  const { orders = [] } = useOrder();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');

  const filteredOrders = useMemo(() => {
      if (!user) return [];
      return orders.filter(o => 
          o.customerPhone === user.phone && (
          activeTab === 'ongoing' 
          ? ONGOING_STATUSES.includes(o.status) 
          : COMPLETED_STATUSES.includes(o.status)
          )
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, activeTab, user]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
        <header className="space-y-6">
            <div className="border-l-4 border-indigo-600 pl-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">My Orders</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Order Journey & Archives</p>
            </div>

            <div className="bg-slate-100 p-1.5 rounded-[32px] flex items-center border border-slate-200 shadow-sm overflow-hidden">
                <button 
                    onClick={() => setActiveTab('ongoing')}
                    className={`flex-1 py-4 px-6 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'ongoing' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Activity size={16}/> Ongoing
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 px-6 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <History size={16}/> History
                </button>
            </div>
        </header>

        <div className="space-y-6">
            {filteredOrders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[48px] border-4 border-dashed border-slate-50 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                        {activeTab === 'ongoing' ? <Utensils size={40} /> : <Receipt size={40} />}
                    </div>
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">
                        {activeTab === 'ongoing' ? 'No active orders' : 'Your history is clear'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">
                        {activeTab === 'ongoing' ? 'Start your flavor journey today!' : 'Past delights will appear here.'}
                    </p>
                </div>
            ) : (
                filteredOrders.map((order) => (
                    <OrderCard 
                        key={order.id} 
                        order={order} 
                        isHighlighted={order.id === highlightOrderId}
                        onHighlightSeen={onHighlightSeen}
                    />
                ))
            )}
        </div>
        <style>{`
            .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default OrderHistoryScreen;
