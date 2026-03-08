
import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, Utensils, 
  Bike, Wallet, DollarSign, Users, 
  Printer, BarChart3, Settings, 
  ShieldCheck, FileText, LogOut,
  ChevronRight, Menu
} from 'lucide-react';
import { motion } from 'framer-motion';

export type AdminTab = 
  | 'dashboard' 
  | 'orders' 
  | 'kitchen' 
  | 'menu'
  | 'partners' 
  | 'settlements' 
  | 'payments' 
  | 'customers' 
  | 'printer' 
  | 'reports' 
  | 'settings' 
  | 'users' 
  | 'logs';

interface SidebarItemProps {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: (id: AdminTab) => void;
  collapsed: boolean;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ id, label, icon, active, onClick, collapsed, badge }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${
      active 
        ? 'bg-rose-600 text-white shadow-xl shadow-rose-100' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    {!collapsed && (
      <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
        {label}
      </span>
    )}
    {badge !== undefined && badge > 0 && (
      <div className={`absolute ${collapsed ? 'top-2 right-2' : 'right-4'} bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm`}>
        {badge}
      </div>
    )}
    {active && !collapsed && (
      <motion.div 
        layoutId="active-indicator"
        className="ml-auto"
      >
        <ChevronRight size={16} className="opacity-50" />
      </motion.div>
    )}
    {active && collapsed && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-600 rounded-r-full"></div>
    )}
  </button>
);

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  pendingPartnersCount?: number;
  newOrdersCount?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  pendingPartnersCount = 0,
  newOrdersCount = 0
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} />, badge: newOrdersCount },
    { id: 'kitchen', label: 'Kitchen (KOT)', icon: <Utensils size={20} /> },
    { id: 'menu', label: 'Menu Management', icon: <Utensils size={20} /> },
    { id: 'partners', label: 'Delivery Partners', icon: <Bike size={20} />, badge: pendingPartnersCount },
    { id: 'settlements', label: 'Settlements', icon: <Wallet size={20} /> },
    { id: 'payments', label: 'COD & Payments', icon: <DollarSign size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'printer', label: 'Printer Setup', icon: <Printer size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    { id: 'users', label: 'Admin Users', icon: <ShieldCheck size={20} /> },
    { id: 'logs', label: 'Logs & Audit', icon: <FileText size={20} /> },
  ];

  return (
    <aside 
      className={`bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 transition-all duration-500 z-50 ${
        collapsed ? 'w-24' : 'w-72'
      }`}
    >
      <div className="p-8 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-lg">R</div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">Rannaghar</h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-lg mx-auto">R</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            active={activeTab === item.id}
            onClick={onTabChange}
            collapsed={collapsed}
            badge={item.badge}
          />
        ))}
      </div>

      <div className="p-4 border-t border-slate-50 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all group"
        >
          <Menu size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Collapse Menu</span>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group"
        >
          <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>}
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
