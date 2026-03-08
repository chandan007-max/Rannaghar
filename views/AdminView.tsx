
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useMenu } from '../context/MenuContext';
import { useOrder } from '../context/OrderContext';
import { useDeliveryPartner } from '../context/DeliveryPartnerContext';
import { useSettlement } from '../context/SettlementContext';
import { Bell, Search, User, Home, ShoppingBag, Bike, Wallet, Menu, Settings as SettingsIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOTIFICATION_SOUND } from '../assets/sounds';

// New Modular Components
import AdminSidebar, { AdminTab } from './admin/AdminSidebar';
import Dashboard from './admin/Dashboard';
import Orders from './admin/Orders';
import Kitchen from './admin/Kitchen';
import MenuManagement from './admin/MenuManagement';
import Partners from './admin/Partners';
import Settlements from './admin/Settlements';
import Settings from './admin/Settings';
import More from './admin/More';
import Payments from './admin/Payments';
import Customers from './admin/Customers';
import PrinterSetup from './admin/PrinterSetup';
import Reports from './admin/Reports';
import AdminUsers from './admin/AdminUsers';
import Logs from './admin/Logs';
import NewOrderAlertModal from '../components/NewOrderAlertModal';
import ReturnRequestPopup from '../src/components/admin/ReturnRequestPopup';

const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('orders');
    const [dismissedReturnOrderIds, setDismissedReturnOrderIds] = useState<Set<string>>(new Set());
    const { adminLogout } = useAuth();
    const { settings, updateSettings } = useSettings();
    const { menu, categories, toggleItemAvailability, deleteMenuItem } = useMenu();
    const { 
        orders = [], acceptOrder, rejectOrder, markOrderReady, 
        handoverOrder, autoAssignOrder, approveReturn, rejectReturn, reassignOrder,
        markOrderPreparing, completeReturn, toggleHold
    } = useOrder();
    const { allPartners, toggleSuspension } = useDeliveryPartner();
    const pendingPartnersCount = useMemo(() => 
        Object.values(allPartners).filter(p => p.onboardingStatus === 'under_review').length,
    [allPartners]);

    const { 
        settlements, approveWeeklySettlement, runManualWeeklySettlement,
        approveUpiSettlement, rejectSettlement, generateSettlementOtp,
        createCodSettlement
    } = useSettlement();

    const newOrdersCount = useMemo(() => orders.filter(o => o.isNew && o.status === 'NEW').length, [orders]);
    const newOrder = useMemo(() => orders.find(o => o.isNew && o.status === 'NEW'), [orders]);
    const returnRequestOrder = useMemo(() => orders.find(o => o.status === 'RETURN_REQUESTED' && !dismissedReturnOrderIds.has(o.id)), [orders, dismissedReturnOrderIds]);

    // Notification Logic
    const prevOrdersRef = useRef(orders);
    const prevSettlementsRef = useRef(settlements);
    const prevPartnersRef = useRef(allPartners);
    const [notification, setNotification] = useState<{ title: string; message: string; type: 'info' | 'success' | 'warning' } | null>(null);

    const playNotificationSound = () => {
        try {
            const audio = new Audio(NOTIFICATION_SOUND);
            audio.play().catch(e => {
                const ignoredErrors = ['AbortError', 'NotAllowedError', 'NotSupportedError'];
                if (!ignoredErrors.includes(e.name)) {
                    console.warn("Audio play failed:", e);
                }
            });
        } catch (e) {
            console.warn("Audio creation failed:", e);
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        // Check for Rider Reached
        const prevOrders = prevOrdersRef.current;
        const newReachedOrders = orders.filter(o => o.status === 'PARTNER_REACHED' && !prevOrders.find(po => po.id === o.id && po.status === 'PARTNER_REACHED'));
        
        if (newReachedOrders.length > 0) {
            playNotificationSound();
            setNotification({
                title: 'Rider Arrived',
                message: `Rider has reached the restaurant for Order #${newReachedOrders[0].id.slice(-6).toUpperCase()}`,
                type: 'info'
            });
        }
        prevOrdersRef.current = orders;
    }, [orders]);

    useEffect(() => {
        // Check for COD Settlement Request
        const prevSettlements = prevSettlementsRef.current;
        const newCodSettlements = settlements.filter(s => s.type === 'COD_DEPOSIT' && (s.status === 'Pending' || s.status === 'Pending Approval') && !prevSettlements.find(ps => ps.id === s.id && (ps.status === 'Pending' || ps.status === 'Pending Approval')));
        
        if (newCodSettlements.length > 0) {
            playNotificationSound();
            setNotification({
                title: 'COD Settlement Request',
                message: `Partner requested COD deposit of ₹${newCodSettlements[0].amount}`,
                type: 'warning'
            });
        }
        prevSettlementsRef.current = settlements;
    }, [settlements]);

    useEffect(() => {
        // Check for Rider Onboarding Request
        const prevPartners = prevPartnersRef.current;
        const newPendingPartners = Object.values(allPartners).filter(p => p.onboardingStatus === 'under_review' && (!prevPartners[p.id] || prevPartners[p.id].onboardingStatus !== 'under_review'));
        
        if (newPendingPartners.length > 0) {
            playNotificationSound();
            setNotification({
                title: 'New Rider Onboarding',
                message: `${newPendingPartners[0].name} has submitted onboarding details for review.`,
                type: 'info'
            });
        }
        prevPartnersRef.current = allPartners;
    }, [allPartners]);

    const stats = useMemo(() => {
        const todayStr = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.date).toDateString() === todayStr);
        const totalSales = todayOrders.reduce((sum, o) => sum + (o.status === 'DELIVERED' ? o.totalAmount : 0), 0);
        const activeCount = orders.filter(o => !['DELIVERED', 'CANCELLED', 'RETURNED_TO_RESTAURANT'].includes(o.status)).length;
        return { totalSales, activeCount };
    }, [orders]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <Dashboard 
                        stats={stats} 
                        orders={orders} 
                        partners={Object.values(allPartners)} 
                        onAccept={(id) => acceptOrder(id, 25)}
                        onReject={(id) => rejectOrder(id, 'Busy')}
                        onHandover={handoverOrder}
                        settings={settings}
                        updateSettings={updateSettings}
                    />
                );
            case 'orders':
                return (
                    <Orders 
                        orders={orders} 
                        onAccept={(id, prepTime) => acceptOrder(id, prepTime)} 
                        onReject={(id) => rejectOrder(id, 'Busy')}
                        onMarkPreparing={markOrderPreparing}
                        onMarkReady={markOrderReady}
                        onDispatch={autoAssignOrder}
                        onHandover={handoverOrder}
                        onApproveReturn={approveReturn}
                        onRejectReturn={rejectReturn}
                        onCompleteReturn={completeReturn}
                        onToggleHold={toggleHold}
                    />
                );
            case 'kitchen':
                return (
                    <Kitchen 
                        orders={orders} 
                        onAccept={(id, prepTime) => acceptOrder(id, prepTime)}
                        onMarkPreparing={markOrderPreparing}
                        onMarkReady={markOrderReady}
                        onHandover={handoverOrder}
                    />
                );
            case 'menu':
                return <MenuManagement />;
            case 'partners':
                return <Partners partners={Object.values(allPartners)} onToggleSuspension={toggleSuspension} />;
            case 'settlements':
                return (
                    <Settlements 
                        settlements={settlements} 
                        partners={Object.values(allPartners)} 
                        onApprove={(id) => {
                            const s = settlements.find(x => x.id === id);
                            if (s?.type === 'COD_DEPOSIT') approveUpiSettlement(id);
                            else approveWeeklySettlement(id);
                        }}
                        onReject={rejectSettlement}
                        onGenerateOtp={generateSettlementOtp}
                        onRunPayouts={runManualWeeklySettlement}
                        onInitiateCod={createCodSettlement}
                    />
                );
            case 'payments':
                return <Payments />;
            case 'customers':
                return <Customers />;
            case 'printer':
                return <PrinterSetup />;
            case 'reports':
                return <Reports />;
            case 'users':
                return <AdminUsers />;
            case 'logs':
                return <Logs />;
            case 'settings':
                return <Settings settings={settings} onUpdate={updateSettings} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Module Under Development</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">The {activeTab} module is being prepared for launch.</p>
                    </div>
                );
        }
    };

    const navItems: { id: AdminTab; label: string; icon: any }[] = [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'menu', label: 'Menu', icon: Menu },
        { id: 'partners', label: 'Partners', icon: Bike },
        { id: 'settlements', label: 'Finance', icon: Wallet },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AdminSidebar 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                    onLogout={adminLogout} 
                    pendingPartnersCount={pendingPartnersCount}
                    newOrdersCount={newOrdersCount}
                />
            </div>
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {/* Global Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -50, x: '-50%' }}
                            className="fixed top-20 left-1/2 z-[9999] w-11/12 max-w-md"
                        >
                            <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-4 ${
                                notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                                notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                                'bg-indigo-50 border-indigo-200 text-indigo-900'
                            }`}>
                                <div className={`p-2 rounded-xl shrink-0 ${
                                    notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                    notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-indigo-100 text-indigo-600'
                                }`}>
                                    <Bell size={20} />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <h4 className="text-sm font-black uppercase tracking-widest">{notification.title}</h4>
                                    <p className="text-xs font-bold mt-1 opacity-80 leading-relaxed">{notification.message}</p>
                                </div>
                                <button onClick={() => setNotification(null)} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Header */}
                <header className="h-16 lg:h-24 bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between shrink-0 z-40 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                            <span className="font-black text-sm lg:text-xl">R</span>
                        </div>
                        <h1 className="text-lg lg:text-2xl font-black text-slate-900 tracking-tighter uppercase">Rannaghar</h1>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <button 
                            onClick={() => updateSettings({ isAppOnline: !settings.isAppOnline })}
                            className={`p-2.5 rounded-xl transition-all sm:hidden border-2 ${
                                settings.isAppOnline 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-lg shadow-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-200 shadow-lg shadow-rose-100'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-full mx-auto ${settings.isAppOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        </button>
                        <button className="relative p-2 lg:p-3 bg-slate-50 text-slate-400 rounded-xl lg:rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 lg:h-10 w-[1px] bg-slate-100"></div>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 leading-none">Super Admin</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${settings.isAppOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {settings.isAppOnline ? 'Live' : 'Offline'}
                                    </p>
                                    <button 
                                        onClick={() => updateSettings({ isAppOnline: !settings.isAppOnline })}
                                        className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${settings.isAppOnline ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <motion.div 
                                            layout
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            animate={{ x: settings.isAppOnline ? 26 : 4 }}
                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar pb-24 lg:pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center gap-1 transition-all relative ${isActive ? 'text-rose-600' : 'text-slate-400'}`}
                            >
                                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-rose-50' : ''}`}>
                                    <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                                </div>
                                {item.id === 'partners' && pendingPartnersCount > 0 && (
                                    <div className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full border border-white">
                                        {pendingPartnersCount}
                                    </div>
                                )}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <AnimatePresence>
                {newOrder && (
                    <NewOrderAlertModal 
                        order={newOrder} 
                        onAccept={acceptOrder} 
                        onReject={rejectOrder} 
                        onlinePartnersCount={Object.values(allPartners).filter(p => p.isOnline).length}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {returnRequestOrder && (
                    <ReturnRequestPopup 
                        order={returnRequestOrder} 
                        onApprove={approveReturn} 
                        onReject={rejectReturn}
                        onClose={() => setDismissedReturnOrderIds(prev => new Set(prev).add(returnRequestOrder.id))}
                    />
                )}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { font-family: 'Inter', sans-serif; }
            `}</style>
        </div>
    );
};

export default AdminView;
