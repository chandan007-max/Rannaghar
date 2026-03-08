import React from 'react';
import { DollarSign, Search, Filter, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const Payments: React.FC = () => {
    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">COD & Payments</h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage Cash on Delivery and Online Transactions</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <Filter size={14} /> Filter
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                        Export Report
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Online Payments</p>
                            <h3 className="text-2xl font-black text-slate-900">₹45,230</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <ArrowUpRight size={14} /> +12% from last week
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending COD Collections</p>
                            <h3 className="text-2xl font-black text-slate-900">₹12,450</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-rose-600 text-xs font-bold">
                        <ArrowDownRight size={14} /> -5% from last week
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                            <h3 className="text-2xl font-black text-slate-900">₹57,680</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <ArrowUpRight size={14} /> +8% from last week
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Recent Transactions</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all w-64"
                        />
                    </div>
                </div>
                <div className="p-8 text-center text-slate-400 font-bold text-sm">
                    Transaction list will appear here.
                </div>
            </div>
        </div>
    );
};

export default Payments;
