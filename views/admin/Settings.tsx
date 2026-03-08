
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  MapPin, DollarSign, Clock, Zap, 
  Smartphone, Globe, Database, Save,
  Lock, Percent, Truck, ChevronDown, 
  Printer, Package, CreditCard, PlayCircle,
  Plus, Trash2, Store, FileText
} from 'lucide-react';
import type { AdminSettings, DeliveryZone, TimeSlot, DayTiming } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const AccordionSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => (
    <div className="border-b border-slate-50 last:border-none">
        <button 
            onClick={onToggle}
            className="w-full py-6 flex items-center justify-between group"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                }`}>
                    {icon}
                </div>
                <h3 className={`text-sm font-black uppercase tracking-widest transition-all ${
                    isOpen ? 'text-slate-900' : 'text-slate-400'
                }`}>
                    {title}
                </h3>
            </div>
            <ChevronDown 
                size={18} 
                className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} 
            />
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <div className="pb-8 space-y-6">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const Settings: React.FC<{ settings: AdminSettings; onUpdate: (s: Partial<AdminSettings>) => void }> = ({ settings, onUpdate }) => {
    const [openSection, setOpenSection] = useState<string | null>('profile');

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="p-6 pt-12 space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Settings</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure App Behavior</p>
                    </div>
                    <button 
                        onClick={() => alert('Settings Saved Successfully!')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                    >
                        Save All
                    </button>
                </div>
            </header>

            <div className="px-6">
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm px-6">
                    {/* Restaurant Profile */}
                    <AccordionSection 
                        title="Restaurant Profile" 
                        icon={<Store size={20} />} 
                        isOpen={openSection === 'profile'} 
                        onToggle={() => toggleSection('profile')}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Restaurant Name</label>
                                <input 
                                    type="text" 
                                    value={settings.restaurantProfile?.name || ''}
                                    onChange={(e) => onUpdate({ restaurantProfile: { ...settings.restaurantProfile!, name: e.target.value } })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    placeholder="Rannaghar"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Address</label>
                                <textarea 
                                    value={settings.restaurantProfile?.address || ''}
                                    onChange={(e) => onUpdate({ restaurantProfile: { ...settings.restaurantProfile!, address: e.target.value } })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20 h-24 resize-none"
                                    placeholder="123, Street Name, City"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">GSTIN (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={settings.restaurantProfile?.gstin || ''}
                                        onChange={(e) => onUpdate({ restaurantProfile: { ...settings.restaurantProfile!, gstin: e.target.value } })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">FSSAI No.</label>
                                    <input 
                                        type="text" 
                                        value={settings.restaurantProfile?.fssai || ''}
                                        onChange={(e) => onUpdate({ restaurantProfile: { ...settings.restaurantProfile!, fssai: e.target.value } })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Delivery & Pricing */}
                    <AccordionSection 
                        title="Delivery & Pricing" 
                        icon={<Truck size={20} />} 
                        isOpen={openSection === 'delivery'} 
                        onToggle={() => toggleSection('delivery')}
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Base Charge (₹)</label>
                                    <input 
                                        type="number" 
                                        value={settings.deliveryBaseCharge}
                                        onChange={(e) => onUpdate({ deliveryBaseCharge: Number(e.target.value) })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Per KM Rate (₹)</label>
                                    <input 
                                        type="number" 
                                        value={settings.deliveryPerKmRate}
                                        onChange={(e) => onUpdate({ deliveryPerKmRate: Number(e.target.value) })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Zones</h4>
                                    <button 
                                        onClick={() => {
                                            const newZone: DeliveryZone = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                name: 'New Zone',
                                                radiusKm: 5,
                                                charge: 40,
                                                minOrderValue: 200
                                            };
                                            onUpdate({ deliveryZones: [...(settings.deliveryZones || []), newZone] });
                                        }}
                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                                    >
                                        + Add Zone
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {settings.deliveryZones.map((zone, idx) => (
                                        <div key={zone.id} className="p-4 bg-slate-50 rounded-2xl space-y-3 relative">
                                            <button 
                                                onClick={() => {
                                                    const newZones = settings.deliveryZones.filter(z => z.id !== zone.id);
                                                    onUpdate({ deliveryZones: newZones });
                                                }}
                                                className="absolute top-2 right-2 p-2 text-slate-300 hover:text-rose-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <input 
                                                type="text" 
                                                value={zone.name}
                                                onChange={(e) => {
                                                    const newZones = [...settings.deliveryZones];
                                                    newZones[idx] = { ...zone, name: e.target.value };
                                                    onUpdate({ deliveryZones: newZones });
                                                }}
                                                className="bg-transparent border-none font-black text-slate-900 text-xs outline-none w-full"
                                            />
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Radius</label>
                                                    <input type="number" value={zone.radiusKm} onChange={e => {
                                                        const newZones = [...settings.deliveryZones];
                                                        newZones[idx] = { ...zone, radiusKm: Number(e.target.value) };
                                                        onUpdate({ deliveryZones: newZones });
                                                    }} className="w-full bg-white p-2 rounded-lg text-[10px] font-bold outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fee</label>
                                                    <input type="number" value={zone.charge} onChange={e => {
                                                        const newZones = [...settings.deliveryZones];
                                                        newZones[idx] = { ...zone, charge: Number(e.target.value) };
                                                        onUpdate({ deliveryZones: newZones });
                                                    }} className="w-full bg-white p-2 rounded-lg text-[10px] font-bold outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Min Order</label>
                                                    <input type="number" value={zone.minOrderValue} onChange={e => {
                                                        const newZones = [...settings.deliveryZones];
                                                        newZones[idx] = { ...zone, minOrderValue: Number(e.target.value) };
                                                        onUpdate({ deliveryZones: newZones });
                                                    }} className="w-full bg-white p-2 rounded-lg text-[10px] font-bold outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Packaging Settings */}
                    <AccordionSection 
                        title="Packaging Settings" 
                        icon={<Package size={20} />} 
                        isOpen={openSection === 'packaging'} 
                        onToggle={() => toggleSection('packaging')}
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global Packaging Charge (₹)</label>
                            <input 
                                type="number" 
                                value={settings.packagingCharge}
                                onChange={(e) => onUpdate({ packagingCharge: Number(e.target.value) })}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                            />
                            <p className="text-[9px] font-bold text-slate-400 px-1">This charge applies to all orders unless overridden at item level.</p>
                        </div>
                    </AccordionSection>

                    {/* Restaurant Timing */}
                    <AccordionSection 
                        title="Restaurant Timing" 
                        icon={<Clock size={20} />} 
                        isOpen={openSection === 'timing'} 
                        onToggle={() => toggleSection('timing')}
                    >
                        <div className="space-y-4">
                            {days.map(day => {
                                const dayData = settings.timing?.[day] || { day, slots: [{ open: '09:00', close: '23:00' }], isOpen: true };
                                return (
                                    <div key={day} className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{day}</h4>
                                            <button 
                                                onClick={() => {
                                                    const newTiming = { ...settings.timing };
                                                    newTiming[day] = { ...dayData, isOpen: !dayData.isOpen };
                                                    onUpdate({ timing: newTiming });
                                                }}
                                                className={`w-10 h-6 rounded-full relative transition-colors ${dayData.isOpen ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            >
                                                <motion.div 
                                                    layout
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    animate={{ x: dayData.isOpen ? 18 : 4 }}
                                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                                />
                                            </button>
                                        </div>
                                        {dayData.isOpen && (
                                            <div className="space-y-2">
                                                {dayData.slots.map((slot, sIdx) => (
                                                    <div key={sIdx} className="flex items-center gap-2">
                                                        <input 
                                                            type="time" 
                                                            value={slot.open}
                                                            onChange={e => {
                                                                const newTiming = { ...settings.timing };
                                                                const newSlots = [...dayData.slots];
                                                                newSlots[sIdx] = { ...slot, open: e.target.value };
                                                                newTiming[day] = { ...dayData, slots: newSlots };
                                                                onUpdate({ timing: newTiming });
                                                            }}
                                                            className="flex-1 bg-white p-2 rounded-lg text-[10px] font-bold outline-none"
                                                        />
                                                        <span className="text-slate-300 text-[10px]">to</span>
                                                        <input 
                                                            type="time" 
                                                            value={slot.close}
                                                            onChange={e => {
                                                                const newTiming = { ...settings.timing };
                                                                const newSlots = [...dayData.slots];
                                                                newSlots[sIdx] = { ...slot, close: e.target.value };
                                                                newTiming[day] = { ...dayData, slots: newSlots };
                                                                onUpdate({ timing: newTiming });
                                                            }}
                                                            className="flex-1 bg-white p-2 rounded-lg text-[10px] font-bold outline-none"
                                                        />
                                                        {dayData.slots.length > 1 && (
                                                            <button 
                                                                onClick={() => {
                                                                    const newTiming = { ...settings.timing };
                                                                    newTiming[day] = { ...dayData, slots: dayData.slots.filter((_, i) => i !== sIdx) };
                                                                    onUpdate({ timing: newTiming });
                                                                }}
                                                                className="text-rose-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button 
                                                    onClick={() => {
                                                        const newTiming = { ...settings.timing };
                                                        newTiming[day] = { ...dayData, slots: [...dayData.slots, { open: '18:00', close: '22:00' }] };
                                                        onUpdate({ timing: newTiming });
                                                    }}
                                                    className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2"
                                                >
                                                    + Add Slot
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </AccordionSection>

                    {/* Bill Setup */}
                    <AccordionSection 
                        title="Bill Setup" 
                        icon={<FileText size={20} />} 
                        isOpen={openSection === 'bill'} 
                        onToggle={() => toggleSection('bill')}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bill Header Text</label>
                                <input 
                                    type="text" 
                                    value={settings.billSetup?.headerText || ''}
                                    onChange={(e) => onUpdate({ billSetup: { ...settings.billSetup!, headerText: e.target.value } })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    placeholder="Welcome to Rannaghar"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bill Footer Text</label>
                                <input 
                                    type="text" 
                                    value={settings.billSetup?.footerText || ''}
                                    onChange={(e) => onUpdate({ billSetup: { ...settings.billSetup!, footerText: e.target.value } })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    placeholder="Thank you, Visit Again!"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Show GSTIN on Bill</span>
                                <button 
                                    onClick={() => onUpdate({ billSetup: { ...settings.billSetup!, showGst: !settings.billSetup?.showGst } })}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${settings.billSetup?.showGst ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                    <motion.div 
                                        layout
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        animate={{ x: settings.billSetup?.showGst ? 18 : 4 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* COD & Finance */}
                    <AccordionSection 
                        title="COD & Finance" 
                        icon={<CreditCard size={20} />} 
                        isOpen={openSection === 'finance'} 
                        onToggle={() => toggleSection('finance')}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Max COD Limit (₹)</label>
                                <input 
                                    type="number" 
                                    value={settings.maxCodLimit}
                                    onChange={(e) => onUpdate({ maxCodLimit: Number(e.target.value) })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Platform Commission (%)</label>
                                <input 
                                    type="number" 
                                    value={settings.platformCommissionPercent}
                                    onChange={(e) => onUpdate({ platformCommissionPercent: Number(e.target.value) })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                />
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Printer Setup */}
                    <AccordionSection 
                        title="Printer Setup" 
                        icon={<Printer size={20} />} 
                        isOpen={openSection === 'printer'} 
                        onToggle={() => toggleSection('printer')}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Printer Type</label>
                                <select 
                                    value={settings.printerConfig?.type || 'Bluetooth'}
                                    onChange={e => onUpdate({ printerConfig: { ...settings.printerConfig!, type: e.target.value as any } })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20 appearance-none"
                                >
                                    <option value="Bluetooth">Bluetooth Thermal</option>
                                    <option value="USB">USB Thermal</option>
                                    <option value="Network">Network/WiFi</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Paper Size</label>
                                <div className="flex gap-2">
                                    {['58mm', '80mm'].map(size => (
                                        <button 
                                            key={size}
                                            onClick={() => onUpdate({ printerConfig: { ...settings.printerConfig!, paperWidth: size as any } })}
                                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                settings.printerConfig?.paperWidth === size 
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                                                : 'bg-white text-slate-400 border-slate-100'
                                            }`}
                                        >
                                            {size === '58mm' ? '2 Inch' : '3 Inch'} ({size})
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Auto-Print KOT</span>
                                    <button 
                                        onClick={() => onUpdate({ printerConfig: { ...settings.printerConfig!, autoPrintKOT: !settings.printerConfig?.autoPrintKOT } })}
                                        className={`w-10 h-6 rounded-full relative transition-colors ${settings.printerConfig?.autoPrintKOT ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <motion.div 
                                            layout
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            animate={{ x: settings.printerConfig?.autoPrintKOT ? 18 : 4 }}
                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>
                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                    Test Print
                                </button>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Order Workflow */}
                    <AccordionSection 
                        title="Order Workflow" 
                        icon={<PlayCircle size={20} />} 
                        isOpen={openSection === 'workflow'} 
                        onToggle={() => toggleSection('workflow')}
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Auto-Assign Rider</p>
                                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Assign nearest rider automatically</p>
                                </div>
                                <button 
                                    onClick={() => onUpdate({ autoAssignEnabled: !settings.autoAssignEnabled })}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${settings.autoAssignEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <motion.div 
                                        layout
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        animate={{ x: settings.autoAssignEnabled ? 18 : 4 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Order Timeout (m)</label>
                                    <input 
                                        type="number" 
                                        value={settings.orderTimeoutMinutes}
                                        onChange={(e) => onUpdate({ orderTimeoutMinutes: Number(e.target.value) })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign Timeout (m)</label>
                                    <input 
                                        type="number" 
                                        value={settings.assignmentTimeoutMinutes}
                                        onChange={(e) => onUpdate({ assignmentTimeoutMinutes: Number(e.target.value) })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Advanced Controls */}
                    <AccordionSection 
                        title="Advanced Controls" 
                        icon={<Zap size={20} />} 
                        isOpen={openSection === 'advanced'} 
                        onToggle={() => toggleSection('advanced')}
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <div>
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Global Pause</p>
                                    <p className="text-[8px] font-bold text-rose-400 mt-1 uppercase">Stop all incoming orders</p>
                                </div>
                                <button 
                                    onClick={() => onUpdate({ isAppOnline: !settings.isAppOnline })}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${settings.isAppOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                >
                                    <motion.div 
                                        layout
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        animate={{ x: settings.isAppOnline ? 18 : 4 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>
                            <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100">
                                Clear App Cache
                            </button>
                            <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100">
                                Export Business Data
                            </button>
                        </div>
                    </AccordionSection>
                </div>
            </div>
        </div>
    );
};

export default Settings;
