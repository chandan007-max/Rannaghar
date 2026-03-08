
import React, { useMemo, useState } from 'react';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';
import { useOrder } from '../../context/OrderContext';
import { useSettings } from '../../context/SettingsContext';
import { Bike, Clock, AlertTriangle, TrendingUp, Wallet, Star, Package, MapPin, IndianRupee, CheckCircle, Activity, LayoutDashboard } from 'lucide-react';
import type { Order } from '../../types';
import NewAssignmentAlertModal from '../../components/NewAssignmentAlertModal';
import { AnimatePresence } from 'framer-motion';

interface DashboardScreenProps {
    onAcceptOrder: (order: Order) => void;
    seenOrderIds: Set<string>;
}

const StatBox: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-[28px] shadow-sm flex flex-col justify-between border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
        <div className={`p-3 rounded-2xl w-fit ${color} mb-4 shadow-sm`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
        </div>
    </div>
);


const DashboardScreen: React.FC<DashboardScreenProps> = ({ onAcceptOrder, seenOrderIds }) => {
  const { partner, toggleOnlineStatus } = useDeliveryPartner();
  const { orders = [], acceptAssignment, declineOrder } = useOrder();
  const { settings } = useSettings();
  const [activePopupOrder, setActivePopupOrder] = useState<Order | null>(null);

  // Check for assigned orders that need a popup
  React.useEffect(() => {
    if (!partner || !partner.isOnline) return;
    
    const assignedOrder = orders.find(o => 
      o.status === 'ASSIGNED' && 
      o.partnerId === partner.id && 
      !seenOrderIds.has(o.id)
    );

    if (assignedOrder && (!activePopupOrder || activePopupOrder.id !== assignedOrder.id)) {
      setActivePopupOrder(assignedOrder);
    } else if (!assignedOrder && activePopupOrder) {
      setActivePopupOrder(null);
    }
  }, [orders, partner, seenOrderIds, activePopupOrder]);

  const handleAccept = (id: string) => {
    acceptAssignment(id);
    setActivePopupOrder(null);
  };

  const handleReject = (id: string, reason: string) => {
    if (partner) {
      declineOrder(id, partner.id);
    }
    setActivePopupOrder(null);
  };

  const stats = useMemo(() => {
    if (!partner || !Array.isArray(orders)) return { todayEarnings: 0, completedCount: 0, activeCount: 0, pendingPayout: 0 };
    
    const todayStr = new Date().toDateString();
    
    const todayEarnings = orders
        .filter(o => {
            if (!o || o.partnerId !== partner.id || o.status !== 'DELIVERED') return false;
            const deliveredAt = o.statusTimestamps?.DELIVERED;
            if (!deliveredAt) return false;
            return new Date(deliveredAt).toDateString() === todayStr;
        })
        .reduce((sum, o) => sum + (o.deliveryEarning || 0), 0);
        
    const completedCount = orders.filter(o => o && o.partnerId === partner.id && o.status === 'DELIVERED').length;
    
    const activeCount = orders.filter(o => o && o.partnerId === partner.id && o.status && !['DELIVERED', 'Rejected', 'CANCELLED', 'RETURNED_TO_RESTAURANT'].includes(o.status)).length;
    
    const pendingPayout = partner.pendingEarnings || 0;

    return { todayEarnings, completedCount, activeCount, pendingPayout };
  }, [orders, partner]);

  const availableOrders = useMemo(() => {
    if (!Array.isArray(orders) || !partner) return [];
    return orders.filter(order => {
        if (!order) return false;
        
        // Filter out orders this partner has already declined
        if (order.declinedPartnerIds?.includes(partner.id)) return false;

        // Show orders that are FOOD_READY (available for anyone) 
        // OR ASSIGNED to the current partner (waiting for their action)
        const isReady = order.status === 'FOOD_READY';
        const isAssignedToMe = order.status === 'ASSIGNED' && order.partnerId === partner.id;
        
        return (isReady || isAssignedToMe) && !seenOrderIds.has(order.id);
    });
  }, [orders, seenOrderIds, partner]);

  if (!partner) return null;
  
  const pendingDeposit = partner.codCollected || 0;
  const hasExceededCodLimit = pendingDeposit >= (settings.maxCodLimit || 3000);

  const OnlineToggle: React.FC = () => (
    <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-slate-50">
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${partner.isOnline && !hasExceededCodLimit ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`}></div>
        <div>
            <p className={`font-black text-lg ${partner.isOnline && !hasExceededCodLimit ? 'text-teal-600' : 'text-slate-900'}`}>
            {partner.isOnline && !hasExceededCodLimit ? "Online & Ready" : "System Offline"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {partner.isOnline && !hasExceededCodLimit ? "Waiting for new gigs" : "Go online to see orders"}
            </p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={!!(partner.isOnline && !hasExceededCodLimit)} onChange={toggleOnlineStatus} disabled={hasExceededCodLimit} />
        <div className="w-14 h-8 bg-slate-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500 peer-disabled:bg-slate-50"></div>
      </label>
    </div>
  );

  const AvailableOrderCard: React.FC<{order: Order}> = ({ order }) => {
    const earning = settings.partnerEarningModel === 'percentage' 
        ? (order.deliveryCharge || 0) * (settings.partnerEarningValue / 100)
        : settings.partnerEarningValue;

    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incoming Gig</p>
                    <p className="font-black text-slate-900 text-lg">#{order.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Payable</p>
                    <p className="text-2xl font-black text-teal-600">₹{earning.toFixed(0)}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-600">{(order.distance || 0).toFixed(1)} KM Away</span>
                </div>
                <div className="flex items-center gap-2">
                    <IndianRupee size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-600">{order.paymentMode || 'N/A'}</span>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Drop Location</p>
                 <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed">{order.deliveryAddress?.fullAddress || 'Address not provided'}</p>
            </div>

            <button onClick={() => onAcceptOrder(order)} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95">
                Accept Gig Now
            </button>
        </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-full pb-24">
      <AnimatePresence>
        {activePopupOrder && (
          <NewAssignmentAlertModal 
            order={activePopupOrder}
            onAccept={() => handleAccept(activePopupOrder.id)}
            onReject={() => handleReject(activePopupOrder.id, 'Declined by partner')}
          />
        )}
      </AnimatePresence>

      <OnlineToggle />

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Performance Summary</h2>
        <div className="grid grid-cols-2 gap-4">
            <StatBox title="Today Earnings" value={`₹${stats.todayEarnings.toFixed(0)}`} icon={<TrendingUp size={20} className="text-teal-600" />} color="bg-teal-50" />
            <StatBox title="Pending Payout" value={`₹${stats.pendingPayout.toFixed(0)}`} icon={<Wallet size={20} className="text-indigo-600" />} color="bg-indigo-50" />
            <StatBox title="Completed Orders" value={stats.completedCount} icon={<CheckCircle size={20} className="text-amber-600" />} color="bg-amber-50" />
            <StatBox title="Average Rating" value={(partner.rating || 0).toFixed(1)} icon={<Star size={20} className="text-orange-500 fill-orange-500" />} color="bg-orange-50" />
            <div className="col-span-2">
                 <StatBox title="Active Orders Count" value={stats.activeCount} icon={<Activity size={20} className="text-rose-600" />} color="bg-rose-50" />
            </div>
        </div>
      </div>

       {hasExceededCodLimit && (
          <div className="bg-rose-600 text-white p-6 rounded-[32px] flex items-start gap-4 shadow-xl shadow-rose-100">
            <AlertTriangle className="h-8 w-8 text-rose-200 shrink-0 mt-1 animate-pulse"/>
            <div>
                <p className="font-black text-lg uppercase leading-none">Limit Reached</p>
                <p className="text-xs font-bold opacity-80 mt-2 leading-relaxed">Please deposit ₹{pendingDeposit.toFixed(0)} to Admin. You cannot accept more orders until settled.</p>
            </div>
          </div>
      )}
      
      {partner.isOnline && !hasExceededCodLimit ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live available gigs</h2>
          </div>
          {availableOrders.length > 0 ? (
            <div className="space-y-6">
              {availableOrders.map(order => <AvailableOrderCard key={order.id} order={order} />)}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[48px] border border-slate-100 shadow-sm">
                <Clock size={48} className="mx-auto text-slate-100 mb-6"/>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Scanning for gigs</p>
                <p className="text-[10px] font-bold text-slate-300 mt-2">Checking nearby deliveries...</p>
            </div>
          )}
        </div>
      ) : (
         <div className="text-center py-24 bg-white rounded-[48px] border border-slate-100 shadow-sm opacity-50">
            <Bike size={48} className="mx-auto text-slate-100 mb-6 grayscale"/>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Currently Offline</p>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
