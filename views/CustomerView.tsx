
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import LoginScreen from '../components/LoginScreen';
import MenuScreen from '../components/MenuScreen';
import HomeScreen from '../components/HomeScreen';
import CartScreen from '../components/CartScreen';
import OrderHistoryScreen from '../components/OrderHistoryScreen';
import AccountScreen from '../components/AccountScreen';
import BottomNav from '../components/BottomNav';
import OrderSuccessScreen from '../components/OrderSuccessScreen';
import { RANNAGHAR_LOGO } from '../assets/logo';
import { WifiOff, Loader2 } from 'lucide-react';

type ActiveView = 'home' | 'menu' | 'cart' | 'orders' | 'account';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-full bg-white animate-fade-in">
      <div className="relative">
        <img src={RANNAGHAR_LOGO} alt="Rannaghar Logo" className="w-64 mb-6 animate-pulse" />
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <p className="text-maroon-700 font-bold tracking-[0.3em] uppercase text-xs mb-4">Traditional Bengali Kitchen</p>
          <Loader2 className="animate-spin text-maroon-600" size={24} />
        </div>
      </div>
    </div>
  );
};

const OfflineScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-full text-center p-4 bg-gray-50">
        <WifiOff className="h-20 w-20 text-gray-400 mb-6" />
        <img src={RANNAGHAR_LOGO} alt="Rannaghar is Offline" className="w-56 mx-auto mb-4 opacity-50"/>
        <p className="text-lg text-gray-500">We're not accepting orders at the moment. Please check back later!</p>
    </div>
);


const CustomerView: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [successfulOrderId, setSuccessfulOrderId] = useState<string | null>(null);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleOrderSuccess = (orderId: string) => {
    setSuccessfulOrderId(orderId);
  };

  const handleTrackOrder = (orderId: string) => {
    setSuccessfulOrderId(null);
    setActiveView('orders');
    setHighlightOrderId(orderId);
  };

  const handleGoHome = () => {
    setSuccessfulOrderId(null);
    setActiveView('home');
    setSelectedCategoryId(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setActiveView('menu');
  };

  const handleBackToMenu = () => {
    setActiveView('menu');
  };

  const handleViewCart = () => {
    setActiveView('cart');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!settings.isAppOnline) {
      return <OfflineScreen />;
  }

  if (successfulOrderId) {
    return <OrderSuccessScreen orderId={successfulOrderId} onTrackOrder={handleTrackOrder} onGoHome={handleGoHome} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full overflow-y-auto no-scrollbar bg-white">
        <LoginScreen />
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeScreen onCategoryClick={handleCategoryClick} />;
      case 'menu':
        return <MenuScreen onOrderSuccess={handleOrderSuccess} initialCategoryId={selectedCategoryId} onViewCart={handleViewCart} />;
      case 'cart':
        return <CartScreen onOrderSuccess={handleOrderSuccess} onBackToMenu={handleBackToMenu} />;
      case 'orders':
        return <OrderHistoryScreen highlightOrderId={highlightOrderId} onHighlightSeen={() => setHighlightOrderId(null)} />;
      case 'account':
        return <AccountScreen onNavigateToOrders={() => setActiveView('orders')} />;
      default:
        return <HomeScreen onCategoryClick={handleCategoryClick} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <main className="flex-grow overflow-y-auto no-scrollbar scroll-smooth">
        {renderView()}
      </main>
      <div className="shrink-0">
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .text-maroon-700 { color: #7f1d1d; }
        .text-maroon-600 { color: #991b1b; }
      `}</style>
    </div>
  );
};

export default CustomerView;
