
import React from 'react';
import { LayoutDashboard, Wallet, User, Landmark, History } from 'lucide-react';

type ActiveView = 'dashboard' | 'wallet' | 'finance' | 'profile' | 'history';

interface DeliveryBottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

const DeliveryBottomNav: React.FC<DeliveryBottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center z-40">
      <NavItem
        label="Home"
        icon={<LayoutDashboard className="h-5 w-5" />}
        isActive={activeView === 'dashboard'}
        onClick={() => setActiveView('dashboard')}
      />
      <NavItem
        label="Wallet"
        icon={<Wallet className="h-5 w-5" />}
        isActive={activeView === 'wallet'}
        onClick={() => setActiveView('wallet')}
      />
      <NavItem
        label="History"
        icon={<History className="h-5 w-5" />}
        isActive={activeView === 'history'}
        onClick={() => setActiveView('history')}
      />
      <NavItem
        label="Finance"
        icon={<Landmark className="h-5 w-5" />}
        isActive={activeView === 'finance'}
        onClick={() => setActiveView('finance')}
      />
      <NavItem
        label="Profile"
        icon={<User className="h-5 w-5" />}
        isActive={activeView === 'profile'}
        onClick={() => setActiveView('profile')}
      />
    </nav>
  );
};

export default DeliveryBottomNav;
