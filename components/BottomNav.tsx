
import React from 'react';
import { Home, ListOrdered, User, ShoppingCart, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';

type ActiveView = 'home' | 'menu' | 'cart' | 'orders' | 'account';

interface BottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ label, icon, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 relative ${
      isActive ? 'text-maroon-600' : 'text-maroon-300 hover:text-maroon-500'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    {badge !== undefined && badge > 0 && (
      <span className="absolute top-1 right-[25%] bg-mustard-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
        {badge}
      </span>
    )}
    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const { cartCount } = useCart();

  return (
    <nav className="h-20 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-around items-center z-40 px-2 rounded-t-[32px] border-t border-maroon-50">
      <NavItem
        label="Home"
        icon={<Home className="h-6 w-6" />}
        isActive={activeView === 'home'}
        onClick={() => setActiveView('home')}
      />
      <NavItem
        label="Menu"
        icon={<Utensils className="h-6 w-6" />}
        isActive={activeView === 'menu'}
        onClick={() => setActiveView('menu')}
      />
      <NavItem
        label="Orders"
        icon={<ListOrdered className="h-6 w-6" />}
        isActive={activeView === 'orders'}
        onClick={() => setActiveView('orders')}
      />
      <NavItem
        label="Cart"
        icon={<ShoppingCart className="h-6 w-6" />}
        isActive={activeView === 'cart'}
        onClick={() => setActiveView('cart')}
        badge={cartCount}
      />
      <NavItem
        label="Profile"
        icon={<User className="h-6 w-6" />}
        isActive={activeView === 'account'}
        onClick={() => setActiveView('account')}
      />
    </nav>
  );
};

export default BottomNav;
