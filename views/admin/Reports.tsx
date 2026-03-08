import React from 'react';
import { BarChart3, Calendar, Download, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

const Reports: React.FC = () => {
    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Reports</h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Analytics and Performance Metrics</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <Calendar size={14} /> Last 30 Days
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                            <h3 className="text-2xl font-black text-slate-900">₹1,24,500</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <TrendingUp size={14} /> +15% vs last month
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
                            <h3 className="text-2xl font-black text-slate-900">842</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <TrendingUp size={14} /> +8% vs last month
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Order Value</p>
                            <h3 className="text-2xl font-black text-slate-900">₹147.80</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <TrendingUp size={14} /> +2% vs last month
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Sales Overview</h3>
                    <div className="h-64 flex items-end gap-2">
                        {/* Placeholder for chart */}
                        {[40, 60, 30, 80, 50, 90, 70].map((height, i) => (
                            <div key={i} className="flex-1 bg-indigo-100 rounded-t-xl relative group">
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-xl transition-all duration-500 group-hover:bg-indigo-500"
                                    style={{ height: `${height}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Top Selling Items</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Chicken Biryani', sales: 145, revenue: 29000 },
                            { name: 'Paneer Butter Masala', sales: 120, revenue: 24000 },
                            { name: 'Garlic Naan', sales: 350, revenue: 14000 },
                            { name: 'Tandoori Chicken', sales: 95, revenue: 28500 },
                            { name: 'Gulab Jamun', sales: 210, revenue: 10500 },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm">{item.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.sales} orders</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-sm">₹{item.revenue}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
