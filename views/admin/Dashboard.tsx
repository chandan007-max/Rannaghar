
import React, { useMemo } from 'react';
import { 
  TrendingUp, ShoppingBag, CheckCircle, 
  DollarSign, Wallet, Users, Activity,
  ArrowUpRight, ArrowDownRight, MapPin
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  Cell, PieChart, Pie 
} from 'recharts';
import { motion } from 'framer-motion';

const KPICard: React.FC<{ title: string; value: string | number; trend?: number; icon: React.ReactNode; color: string; onClick?: () => void }> = ({ title, value, trend, icon, color, onClick }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 group hover:shadow-md transition-all duration-300 cursor-pointer"
    >
        <div className="flex justify-between items-start">
            <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-current/10`}>
                {icon}
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </motion.div>
);

const Dashboard: React.FC<{ 
    stats: any; 
    orders: any[]; 
    partners: any[];
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    onHandover: (id: string) => void;
    settings: any;
    updateSettings: (s: any) => void;
    onTabChange?: (tab: any) => void;
}> = ({ stats, orders, partners, onAccept, onReject, onHandover, settings, updateSettings, onTabChange }) => {
    const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    const todayOrders = useMemo(() => orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()), [orders]);
    const activeOrdersCount = useMemo(() => orders.filter(o => !['DELIVERED', 'CANCELLED', 'RETURNED_TO_RESTAURANT'].includes(o.status)).length, [orders]);
    
    const quickStats = useMemo(() => ({
        new: orders.filter(o => o.status === 'NEW').length,
        live: orders.filter(o => ['ACCEPTED', 'PREPARING', 'FOOD_READY', 'ASSIGNED', 'PARTNER_ASSIGNED', 'PARTNER_REACHED'].includes(o.status)).length,
        out: orders.filter(o => ['HANDOVER_CONFIRMED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'RETURN_REQUESTED', 'RETURN_APPROVED'].includes(o.status)).length,
        completed: todayOrders.filter(o => ['DELIVERED', 'RETURNED_TO_RESTAURANT'].includes(o.status)).length,
        cancelled: todayOrders.filter(o => o.status === 'CANCELLED').length,
    }), [orders, todayOrders]);

    return (
        <div className="space-y-6 pb-24">
            {/* Top Section: Status & Primary Stats */}
            <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${settings.isAppOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                            {settings.isAppOnline ? 'Restaurant Open' : 'Restaurant Closed'}
                        </span>
                    </div>
                    <button 
                        onClick={() => updateSettings({ isAppOnline: !settings.isAppOnline })}
                        className={`w-14 h-8 rounded-full relative transition-colors duration-500 shadow-inner ${settings.isAppOnline ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                        <motion.div 
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            animate={{ x: settings.isAppOnline ? 28 : 4 }}
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                        />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Today Sales</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">₹{stats.totalSales}</p>
                    </div>
                    <div className="text-center border-x border-slate-50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">{todayOrders.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
                        <p className="text-xl font-black text-rose-600 tracking-tighter">{activeOrdersCount}</p>
                    </div>
                </div>
            </div>

            {/* Middle Section: Quick Cards */}
            <div className="grid grid-cols-2 gap-4">
                <KPICard 
                    title="New Orders" 
                    value={quickStats.new} 
                    icon={<ShoppingBag size={20}/>} 
                    color="bg-rose-600 text-white" 
                    onClick={() => onTabChange?.('orders')}
                />
                <KPICard 
                    title="Live Orders" 
                    value={quickStats.live} 
                    icon={<Activity size={20}/>} 
                    color="bg-amber-500 text-white" 
                    onClick={() => onTabChange?.('orders')}
                />
                <KPICard 
                    title="Out for Delivery" 
                    value={quickStats.out} 
                    icon={<MapPin size={20}/>} 
                    color="bg-indigo-600 text-white" 
                    onClick={() => onTabChange?.('orders')}
                />
                <div className="grid grid-rows-2 gap-4">
                    <motion.div 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onTabChange?.('orders')}
                        className="bg-emerald-50 p-4 rounded-[24px] border border-emerald-100 flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Completed</span>
                        <span className="text-lg font-black text-emerald-700">{quickStats.completed}</span>
                    </motion.div>
                    <motion.div 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onTabChange?.('orders')}
                        className="bg-rose-50 p-4 rounded-[24px] border border-rose-100 flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest">Cancelled</span>
                        <span className="text-lg font-black text-rose-700">{quickStats.cancelled}</span>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Section: Weekly Summary Graph */}
            <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Weekly Summary</h3>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Sales performance</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <TrendingUp size={18}/>
                    </div>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} 
                                dy={10}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '20px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                                    fontSize: '10px', 
                                    fontWeight: 900,
                                    padding: '12px'
                                }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="sales" 
                                stroke="#6366f1" 
                                strokeWidth={4} 
                                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
