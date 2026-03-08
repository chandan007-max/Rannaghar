import React from 'react';
import { FileText, Search, Filter, Clock, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const Logs: React.FC = () => {
    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Logs & Audit</h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">System Activity and Security Logs</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <Filter size={14} /> Filter
                    </button>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
                        Export Logs
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Activity Stream</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all w-64"
                        />
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CheckCircle2 size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-black text-slate-900 text-sm">Order Delivered</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> 2 mins ago</span>
                                </div>
                                <p className="text-xs font-bold text-slate-500">Order #10045 was successfully delivered by partner John.</p>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-amber-100 text-amber-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <AlertTriangle size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-black text-slate-900 text-sm">Partner Delayed</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> 15 mins ago</span>
                                </div>
                                <p className="text-xs font-bold text-slate-500">Partner Mike is running 10 minutes late for order #10044.</p>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Info size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-black text-slate-900 text-sm">Menu Updated</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> 1 hour ago</span>
                                </div>
                                <p className="text-xs font-bold text-slate-500">Super Admin updated the price of "Paneer Tikka".</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logs;
