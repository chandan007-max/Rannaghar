
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import type { Order } from '../../../types';

interface KOTPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

const KOTPreviewModal: React.FC<KOTPreviewModalProps> = ({ isOpen, onClose, order }) => {
    if (!order) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('kot-print-area');
        if (printContent) {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
            
            const pri = iframe.contentWindow;
            if (pri) {
                pri.document.open();
                pri.document.write(`
                    <html>
                        <head>
                            <title>KOT - #${order.id.slice(-6).toUpperCase()}</title>
                            <style>
                                @page { size: 80mm auto; margin: 0; }
                                body { 
                                    font-family: 'Courier New', Courier, monospace; 
                                    width: 80mm; 
                                    padding: 10mm; 
                                    margin: 0;
                                    font-size: 12px;
                                    line-height: 1.4;
                                }
                                .text-center { text-align: center; }
                                .font-bold { font-weight: bold; }
                                .text-lg { font-size: 16px; }
                                .border-t { border-top: 1px dashed #000; margin: 5px 0; }
                                .flex { display: flex; justify-content: space-between; }
                                .mt-4 { margin-top: 15px; }
                                .mb-4 { margin-bottom: 15px; }
                                .uppercase { text-transform: uppercase; }
                            </style>
                        </head>
                        <body>
                            ${printContent.innerHTML}
                            <script>
                                window.onload = () => {
                                    window.print();
                                };
                            </script>
                        </body>
                    </html>
                `);
                pri.document.close();
                
                // Remove iframe after printing
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">KOT Preview</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kitchen Order Ticket</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                            <div 
                                id="kot-print-area"
                                className="bg-white p-8 shadow-sm border border-slate-200 mx-auto w-[300px] font-mono text-sm space-y-2 text-slate-800"
                            >
                                <div className="text-center font-black text-slate-900 text-xl mb-1">RANNAGHAR</div>
                                <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">KITCHEN ORDER TICKET</div>
                                
                                <div className="border-t border-dashed border-slate-300 my-4"></div>
                                
                                <div className="flex justify-between">
                                    <span className="font-bold">Order #</span>
                                    <span className="font-black text-slate-900">{order.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Date</span>
                                    <span>{new Date(order.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Customer</span>
                                    <span className="font-black text-slate-900">{order.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Type</span>
                                    <span className="font-black text-rose-600 uppercase">{order.paymentMode}</span>
                                </div>

                                <div className="border-t border-dashed border-slate-300 my-4"></div>
                                
                                <div className="flex justify-between font-black text-slate-900 mb-2">
                                    <span>ITEM</span>
                                    <span>QTY</span>
                                </div>
                                
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between font-bold text-slate-800">
                                            <span>{item.name}</span>
                                            <span className="font-black">x{item.quantity}</span>
                                        </div>
                                        {item.selectedVariantId && (
                                            <div className="text-[10px] text-slate-500 uppercase font-bold">
                                                - {item.selectedVariantId.split('-').pop()}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="border-t border-dashed border-slate-300 my-4"></div>
                                
                                {order.instructions && (
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Kitchen Note:</p>
                                        <p className="text-xs font-bold text-slate-700 italic">"{order.instructions}"</p>
                                    </div>
                                )}

                                <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8">
                                    *** END OF TICKET ***
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest"
                            >
                                Close
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                            >
                                <Printer size={16} /> Print Ticket
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default KOTPreviewModal;
