
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { OrderProvider } from './context/OrderContext';
import { MenuProvider } from './context/MenuContext';
import { DeliveryPartnerProvider, useDeliveryPartner } from './context/DeliveryPartnerContext';
import { SettlementProvider } from './context/SettlementContext';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import DeliveryView from './views/DeliveryView';
import AdminLoginScreen from './components/AdminLoginScreen';
import DeliveryLoginScreen from './components/DeliveryLoginScreen';
import { ShieldCheck, UtensilsCrossed, Bike, ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';

type View = 'customer' | 'admin' | 'delivery';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('customer');
  const { isAdmin } = useAuth();
  const { isAuthenticated: isDeliveryPartner } = useDeliveryPartner();
  const constraintsRef = useRef(null);

  useEffect(() => {
    // Request notification permissions for background alerts
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
        case 'admin':
            return isAdmin ? <AdminView /> : <AdminLoginScreen />;
        case 'delivery':
            return isDeliveryPartner ? <DeliveryView /> : <DeliveryLoginScreen />;
        case 'customer':
        default:
            return <CustomerView />;
    }
  };

  const views: { id: View; icon: React.ReactNode; label: string; color: string }[] = [
    { id: 'customer', icon: <UtensilsCrossed size={14} />, label: 'Customer', color: 'text-amber-600' },
    { id: 'admin', icon: <ShieldCheck size={14} />, label: 'Admin', color: 'text-indigo-600' },
    { id: 'delivery', icon: <Bike size={14} />, label: 'Delivery', color: 'text-green-600' }
  ];

  return (
    <div ref={constraintsRef} className="bg-gray-50 min-h-full h-full text-gray-800 font-sans relative overflow-hidden">
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ y: 0 }}
        whileHover={{ cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[999999] pointer-events-auto group"
      >
        <div className="flex items-center bg-white/90 backdrop-blur-xl border-2 border-indigo-100 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-1.5 rounded-full relative">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setCurrentView(v.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors z-10 ${
                currentView === v.id ? 'text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {currentView === v.id && (
                <motion.div
                  layoutId="active-view"
                  className="absolute inset-0 bg-slate-900 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className={currentView === v.id ? 'text-white' : v.color}>{v.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {v.label}
              </span>
            </button>
          ))}
          
          {/* Drag Handle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
          </div>
        </div>
      </motion.div>
      {renderView()}
    </div>
  );
};

const AppCore: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MenuProvider>
          <CartProvider>
            <DeliveryPartnerProvider>
              <OrderProvider>
                <SettlementProvider>
                    <AppContent />
                </SettlementProvider>
              </OrderProvider>
            </DeliveryPartnerProvider>
          </CartProvider>
        </MenuProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default AppCore;
