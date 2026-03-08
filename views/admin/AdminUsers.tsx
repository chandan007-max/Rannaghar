import React from 'react';
import { ShieldCheck, Plus, Search, MoreVertical, User } from 'lucide-react';

const AdminUsers: React.FC = () => {
    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Admin Users</h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage Roles and Permissions</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-2">
                        <Plus size={14} /> Add User
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">System Administrators</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Login</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                                            SA
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">Super Admin</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">admin@rannaghar.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-600 border-indigo-100">
                                        Owner
                                    </span>
                                </td>
                                <td className="p-4 text-sm font-bold text-slate-600">Just now</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                                        Active
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black">
                                            KM
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">Kitchen Manager</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">kitchen@rannaghar.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-100">
                                        Kitchen Staff
                                    </span>
                                </td>
                                <td className="p-4 text-sm font-bold text-slate-600">2 hours ago</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                                        Active
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
