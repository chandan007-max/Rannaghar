import React, { useState, useEffect } from 'react';
import { Printer, Settings, CheckCircle2, AlertCircle, RefreshCw, Search, Bluetooth, Usb, Globe, Trash2, Plus } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import type { PrinterConfig } from '../../types';

const PrinterSetup: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [isScanning, setIsScanning] = useState(false);
    const [discoveredDevices, setDiscoveredDevices] = useState<{ id: string; name: string; type: 'Bluetooth' | 'USB' }[]>([]);
    const [showDiscovery, setShowDiscovery] = useState(false);

    const printer = settings.printerConfig;

    const handleScan = () => {
        setIsScanning(true);
        setShowDiscovery(true);
        setDiscoveredDevices([]);
        
        // Simulate discovery
        setTimeout(() => {
            setDiscoveredDevices([
                { id: 'BT-01', name: 'RPP02N (Bluetooth)', type: 'Bluetooth' },
                { id: 'BT-02', name: 'Thermal-58 (Bluetooth)', type: 'Bluetooth' },
                { id: 'USB-01', name: 'Epson TM-T82III', type: 'USB' }
            ]);
            setIsScanning(false);
        }, 2000);
    };

    const connectPrinter = (device: { id: string; name: string; type: 'Bluetooth' | 'USB' }) => {
        const newConfig: PrinterConfig = {
            id: device.id,
            name: device.name,
            type: device.type as any,
            paperWidth: '80mm',
            isConnected: true,
            autoPrintKOT: true,
            autoPrintBill: false,
            kotCopies: 1,
            invoiceCopies: 1
        };
        updateSettings({ printerConfig: newConfig });
        setShowDiscovery(false);
    };

    const disconnectPrinter = () => {
        updateSettings({ printerConfig: undefined });
    };

    const updatePrinterConfig = (updates: Partial<PrinterConfig>) => {
        if (printer) {
            updateSettings({ printerConfig: { ...printer, ...updates } });
        }
    };

    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Printer Setup</h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure Thermal Receipt Printers (2" / 3")</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                        Scan for Printers
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Configuration */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${printer?.isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Printer size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{printer?.name || 'No Printer Connected'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {printer?.isConnected ? (
                                            <>
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Connected via {printer.type}</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disconnected</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {printer && (
                                <button 
                                    onClick={disconnectPrinter}
                                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    title="Disconnect Printer"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        {printer ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Paper Width</label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <button 
                                            onClick={() => updatePrinterConfig({ paperWidth: '58mm' })}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${printer.paperWidth === '58mm' ? 'border-rose-600 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400'}`}
                                        >
                                            2" (58mm)
                                        </button>
                                        <button 
                                            onClick={() => updatePrinterConfig({ paperWidth: '80mm' })}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${printer.paperWidth === '80mm' ? 'border-rose-600 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400'}`}
                                        >
                                            3" (80mm)
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Connection Type</label>
                                    <div className="flex items-center gap-3 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        {printer.type === 'Bluetooth' ? <Bluetooth size={16} className="text-blue-500" /> : <Usb size={16} className="text-slate-600" />}
                                        <span className="text-xs font-bold text-slate-700">{printer.type} Interface</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 md:col-span-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mt-4">Automation</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-sm">Auto-Print KOT</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Print on Acceptance</p>
                                            </div>
                                            <button 
                                                onClick={() => updatePrinterConfig({ autoPrintKOT: !printer.autoPrintKOT })}
                                                className={`w-10 h-6 rounded-full relative transition-all ${printer.autoPrintKOT ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${printer.autoPrintKOT ? 'right-1' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-sm">Auto-Print Bill</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Print on Food Ready</p>
                                            </div>
                                            <button 
                                                onClick={() => updatePrinterConfig({ autoPrintBill: !printer.autoPrintBill })}
                                                className={`w-10 h-6 rounded-full relative transition-all ${printer.autoPrintBill ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${printer.autoPrintBill ? 'right-1' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="md:col-span-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 mt-4 active:scale-[0.98] transition-all"
                                >
                                    Print Test Page
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                                    <Printer size={40} />
                                </div>
                                <p className="text-slate-400 font-bold">No printer configured yet.</p>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Scan for nearby Bluetooth or USB printers</p>
                            </div>
                        )}
                    </div>

                    {/* Discovery Modal/Section */}
                    {showDiscovery && (
                        <div className="bg-white p-8 rounded-[32px] border-2 border-rose-100 shadow-xl animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Search className="text-rose-600" size={24} />
                                    <h3 className="text-xl font-black text-slate-900">Discovered Devices</h3>
                                </div>
                                <button onClick={() => setShowDiscovery(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest">Close</button>
                            </div>
                            
                            {isScanning ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <RefreshCw className="text-rose-600 animate-spin mb-4" size={32} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Searching for devices...</p>
                                </div>
                            ) : discoveredDevices.length > 0 ? (
                                <div className="space-y-3">
                                    {discoveredDevices.map(device => (
                                        <button 
                                            key={device.id}
                                            onClick={() => connectPrinter(device)}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-rose-600 shadow-sm">
                                                    {device.type === 'Bluetooth' ? <Bluetooth size={20} /> : <Usb size={20} />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-slate-900">{device.name}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{device.type} Device • {device.id}</p>
                                                </div>
                                            </div>
                                            <div className="bg-rose-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Connect</div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 font-bold">No devices found</p>
                                    <button onClick={handleScan} className="text-rose-600 font-black text-[10px] uppercase tracking-widest mt-2">Try Again</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Receipt Preview */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-fit sticky top-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="text-rose-600" size={24} />
                        <h3 className="text-xl font-black text-slate-900">Receipt Preview</h3>
                    </div>
                    <div className={`bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono text-sm space-y-2 text-slate-600 mx-auto transition-all duration-500 ${printer?.paperWidth === '58mm' ? 'max-w-[200px]' : 'max-w-full'}`}>
                        <div className="text-center font-bold text-slate-900 text-lg mb-2 tracking-tighter">RANNAGHAR</div>
                        <div className="text-center text-[10px] leading-tight mb-4">123 Food Street, Kolkata<br/>Tel: +91 70011 28520</div>
                        <div className="border-t border-dashed border-slate-300 my-2"></div>
                        <div className="flex justify-between text-[11px]"><span>Order #</span><span>10045</span></div>
                        <div className="flex justify-between text-[11px]"><span>Date</span><span>01/03/2026 14:30</span></div>
                        <div className="border-t border-dashed border-slate-300 my-2"></div>
                        <div className="flex justify-between font-bold text-slate-900 text-[11px]"><span>Item</span><span>Amt</span></div>
                        <div className="flex justify-between text-[11px]"><span>2x Shorshe Ilish</span><span>₹900</span></div>
                        <div className="flex justify-between text-[11px]"><span>1x Kosha Mangsho</span><span>₹550</span></div>
                        <div className="border-t border-dashed border-slate-300 my-2"></div>
                        <div className="flex justify-between text-[11px]"><span>Subtotal</span><span>₹1450</span></div>
                        <div className="flex justify-between text-[11px]"><span>Delivery</span><span>₹30</span></div>
                        <div className="flex justify-between font-bold text-slate-900 text-base mt-2"><span>Total</span><span>₹1480</span></div>
                        <div className="border-t border-dashed border-slate-300 my-2"></div>
                        <div className="text-center text-[10px] mt-4 font-bold">Thank you for your order!</div>
                        <div className="text-center text-[8px] mt-1 opacity-50 italic">Powered by Rannaghar</div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mt-4 italic">
                        Previewing {printer?.paperWidth || '80mm'} layout
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrinterSetup;
