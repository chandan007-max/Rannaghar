
import React, { useMemo } from 'react';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';
import { useOrder } from '../../context/OrderContext';
import { History, MapPin, IndianRupee, Calendar, Clock, CheckCircle2, XCircle, RotateCcw, Navigation } from 'lucide-react';
import type { Order } from '../../types';

const HistoryScreen: React.FC = () => {
    const { partner } = useDeliveryPartner();
    const { orders = [] } = useOrder();

    const historyOrders = useMemo(() => {
        if (!partner || !Array.isArray(orders)) return [];
        return orders
            .filter(o => o && o.partnerId === partner.id && ['DELIVERED', 'CANCELLED', 'RETURNED_TO_RESTAURANT'].includes(o.status))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, partner]);

    if (!partner) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'CANCELLED': return <XCircle size={14} className="text-rose-500" />;
            case 'RETURNED_TO_RESTAURANT': return <RotateCcw size={14} className="text-amber-500" />;
            default: return null;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'RETURNED_TO_RESTAURANT': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="p-6 space-y-8 bg-slate-50 min-h-full pb-24 animate-fade-in">
            <div className="space-y-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gig Journey</h2>
                <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <History size={24} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 leading-tight">{historyOrders.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Gigs Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Past Gigs</h2>
                {historyOrders.length > 0 ? (
                    <div className="space-y-4">
                        {historyOrders.map((order) => (
                            <div key={order.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(order.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Earning</p>
                                        <p className="text-xl font-black text-teal-600">₹{(order.deliveryEarning || 0).toFixed(0)}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 line-clamp-1">{order.deliveryAddress?.fullAddress}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-rose-500 shrink-0">
                                            <Navigation size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{(order.distance || 0).toFixed(1)} KM Travelled</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-amber-500 shrink-0">
                                            <IndianRupee size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{order.paymentMode} Order</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[48px] border border-slate-100 shadow-sm">
                        <History size={48} className="mx-auto text-slate-100 mb-6" />
                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No history yet</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-2">Completed gigs will appear here.</p>
                    </div>
                )}
            </div>
            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default HistoryScreen;
