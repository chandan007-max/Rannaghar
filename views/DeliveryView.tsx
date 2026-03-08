
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDeliveryPartner } from '../context/DeliveryPartnerContext';
import { useOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import DeliveryBottomNav from '../components/DeliveryBottomNav';
import DashboardScreen from './delivery/DashboardScreen';
import WalletScreen from './delivery/WalletScreen';
import FinanceScreen from './delivery/FinanceScreen';
import ProfileScreen from './delivery/ProfileScreen';
import HistoryScreen from './delivery/HistoryScreen';
import ActiveOrderScreen from './delivery/ActiveOrderScreen';
import OnboardingFlow from './delivery/OnboardingFlow';
import NewAssignmentAlertModal from '../components/NewAssignmentAlertModal';
import { Ban, LayoutDashboard, Wallet, User as UserIcon, Landmark, History } from 'lucide-react';
import { Order, DeliveryPartner } from '../types';

type DeliveryViewTab = 'dashboard' | 'wallet' | 'finance' | 'profile' | 'history';

const SuspendedScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-50 text-red-800">
        <Ban className="h-16 w-16 mb-4" />
        <h1 className="text-2xl font-bold">Account Suspended</h1>
        <p className="mt-2 text-red-700">Your account is temporarily suspended. Please contact restaurant support for more information.</p>
    </div>
);

const DeliveryView: React.FC = () => {
    const { partner, updatePartnerLocation } = useDeliveryPartner();
    const { orders = [], acceptAssignment, declineOrder } = useOrder();
    const { settings } = useSettings();
    const [activeTab, setActiveTab] = useState<DeliveryViewTab>('dashboard');
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const locationIntervalRef = useRef<number | null>(null);

    // FIX: Memoize the assignment alert with higher precision and null checks
    const alertingOrder = useMemo(() => {
        if (!Array.isArray(orders) || !partner) return null;
        return orders.find(o => 
            o &&
            o.status === 'ASSIGNED' && 
            o.partnerId === partner.id && 
            o.assignmentExpiry && 
            new Date(o.assignmentExpiry).getTime() > Date.now()
        ) || null;
    }, [orders, partner]);
    
    useEffect(() => {
        if (!Array.isArray(orders) || !partner) return;
        const currentActiveOrder = orders.find(o => {
            if (!o || o.partnerId !== partner.id || !o.status) return false;
            if (['ASSIGNED', 'FOOD_READY', 'DELIVERED', 'RETURNED_TO_RESTAURANT'].includes(o.status)) return false;
            if (o.status === 'CANCELLED' && !o.returnOtp) return false;
            return true;
        });
        setActiveOrder(currentActiveOrder || null);
    }, [orders, partner]);

    useEffect(() => {
        const startTracking = () => {
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
            locationIntervalRef.current = window.setInterval(() => {
                if (!navigator.geolocation) return;
                
                navigator.geolocation.getCurrentPosition(
                    (position) => updatePartnerLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                    (error) => {
                        if (error.code !== error.PERMISSION_DENIED) {
                            console.warn("Background Geolocation Warning:", error.message);
                        }
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }, 10000);
        };
        const stopTracking = () => {
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
        };
        if (partner?.isOnline) startTracking(); else stopTracking();
        return () => stopTracking();
    }, [partner?.isOnline, updatePartnerLocation]);

    if (!partner) return null;

    const handleAcceptOrder = (order: Order) => {
        acceptAssignment(order.id);
    };

    const handleRejectOrder = (order: Order, reason?: string) => {
        declineOrder(order.id, partner.id, reason);
    };

    if (partner.isSuspended) return <SuspendedScreen />;
    if (partner.onboardingStatus !== 'active') return <OnboardingFlow />;
    
    const renderSafeContent = () => {
        try {
            if (activeOrder) return <ActiveOrderScreen order={activeOrder} />;
            
            switch (activeTab) {
                case 'dashboard':
                    return <DashboardScreen onAcceptOrder={handleAcceptOrder} seenOrderIds={new Set()} />;
                case 'wallet':
                    return <WalletScreen />;
                case 'history':
                    return <HistoryScreen />;
                case 'finance':
                    return <FinanceScreen />;
                case 'profile':
                    return <ProfileScreen />;
                default:
                    return <DashboardScreen onAcceptOrder={handleAcceptOrder} seenOrderIds={new Set()} />;
            }
        } catch (e) {
            console.error("Delivery Tab Render Error:", e);
            return (
                <div className="p-10 text-center">
                    <p className="font-bold text-gray-500">Something went wrong loading this screen.</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Reload App</button>
                </div>
            );
        }
    };
    
    const tabDetails: Record<DeliveryViewTab, { title: string; icon: React.ReactNode }> = {
        dashboard: { title: `Hi, ${partner.name ? partner.name.split(' ')[0] : 'Partner'}!`, icon: <LayoutDashboard size={20} className="text-gray-500" /> },
        wallet: { title: 'My Wallet', icon: <Wallet size={20} className="text-gray-500" /> },
        history: { title: 'Gig History', icon: <History size={20} className="text-gray-500" /> },
        finance: { title: 'Finance & COD', icon: <Landmark size={20} className="text-gray-500" /> },
        profile: { title: 'My Profile', icon: <UserIcon size={20} className="text-gray-500" /> },
    };

    return (
        <div className="h-full flex flex-col bg-gray-100 relative">
            {alertingOrder && partner?.isOnline && (
                <div className="fixed inset-0 z-[99999] pointer-events-auto">
                    <NewAssignmentAlertModal
                        order={alertingOrder}
                        onAccept={() => handleAcceptOrder(alertingOrder)}
                        onReject={(reason) => handleRejectOrder(alertingOrder, reason)}
                    />
                </div>
            )}
            <header className="bg-white p-4 flex items-center space-x-3 sticky top-0 z-10 border-b shadow-sm">
                {tabDetails[activeTab].icon}
                <h1 className="text-xl font-black text-slate-800 tracking-tight">{tabDetails[activeTab].title}</h1>
            </header>
            <main className="flex-grow overflow-y-auto no-scrollbar">
              {renderSafeContent()}
            </main>
            <DeliveryBottomNav activeView={activeTab} setActiveView={setActiveTab} />
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default DeliveryView;
