
import React from 'react';
import { 
  Settings, Users, Printer, 
  ShieldCheck, FileText, ChevronRight,
  LogOut, Bell, Moon, Globe,
  HelpCircle, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const MoreItem: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    subtitle: string; 
    onClick?: () => void;
    danger?: boolean;
}> = ({ icon, title, subtitle, onClick, danger }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${danger ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                {icon}
            </div>
            <div className="text-left">
                <h4 className={`font-black text-sm uppercase tracking-tight ${danger ? 'text-rose-600' : 'text-slate-900'}`}>{title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-300" />
    </button>
);

const More: React.FC = () => {
    const sections = [
        {
            title: 'Management',
            items: [
                { icon: <Users size={20} />, title: 'Customers', subtitle: 'User Database & History' },
                { icon: <Printer size={20} />, title: 'Printer Setup', subtitle: 'Thermal & Cloud Printing' },
                { icon: <ShieldCheck size={20} />, title: 'Admin Roles', subtitle: 'Permissions & Access' },
            ]
        },
        {
            title: 'System',
            items: [
                { icon: <FileText size={20} />, title: 'Logs & Audit', subtitle: 'Activity Tracking' },
                { icon: <Settings size={20} />, title: 'Settings', subtitle: 'App Configurations' },
                { icon: <Bell size={20} />, title: 'Notifications', subtitle: 'Alert Preferences' },
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: <HelpCircle size={20} />, title: 'Help Center', subtitle: 'FAQs & Documentation' },
                { icon: <Info size={20} />, title: 'About App', subtitle: 'Version 2.4.0 (Stable)' },
            ]
        }
    ];

    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            <header>
                <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">More</h2>
                <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Advanced Controls & Settings</p>
            </header>

            <div className="space-y-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                        <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{section.title}</h3>
                        <div className="space-y-3">
                            {section.items.map((item, i) => (
                                <MoreItem key={i} {...item} />
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-4">
                    <MoreItem 
                        icon={<LogOut size={20} />} 
                        title="Logout" 
                        subtitle="End Current Session" 
                        danger 
                    />
                </div>
            </div>

            <div className="text-center pt-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Rannaghar Enterprise</p>
                <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest mt-1">Crafted for Excellence</p>
            </div>
        </div>
    );
};

export default More;
