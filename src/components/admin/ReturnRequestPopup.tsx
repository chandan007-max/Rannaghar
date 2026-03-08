
import React, { useEffect } from 'react';
import { 
  AlertCircle, Phone, MapPin, 
  Check, X, User, ShoppingBag,
  MessageSquare, Bike
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../../../types';

interface ReturnRequestPopupProps {
  order: Order;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}

const ReturnRequestPopup: React.FC<ReturnRequestPopupProps> = ({ order, onApprove, onReject, onClose }) => {
  // Sound effect - High volume alarm
  useEffect(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'); // Loud alert sound
    audio.loop = true;
    audio.volume = 1.0;
    audio.play().catch(e => {
      const ignoredErrors = ['AbortError', 'NotAllowedError', 'NotSupportedError'];
      if (!ignoredErrors.includes(e.name)) {
        console.log('Audio play blocked:', e);
      }
    });
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl border-4 border-orange-500/20"
      >
        {/* Header - Urgent Alert */}
        <div className="bg-orange-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-white"
          />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Delivery Issue Reported</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Return Requested by Partner</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Reason Section */}
          <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100 flex gap-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Reason for Return</p>
              <p className="text-sm font-black text-slate-900 leading-tight">
                {order.returnDetails?.reason || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Partner & Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Bike size={10} /> Partner
                </p>
                <p className="text-sm font-black text-slate-900">{order.partnerDetails?.name || 'Assigned Partner'}</p>
                <a href={`tel:${order.partnerDetails?.phone}`} className="flex items-center gap-2 text-xs font-bold text-rose-600">
                    <Phone size={12} /> {order.partnerDetails?.phone}
                </a>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={10} /> Customer
                </p>
                <p className="text-sm font-black text-slate-900">{order.customerName}</p>
                <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 text-xs font-bold text-rose-600">
                    <Phone size={12} /> {order.customerPhone}
                </a>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                    <p className="text-lg font-black text-slate-900 tracking-tighter">#{order.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                    <p className="text-lg font-black text-rose-600 tracking-tighter">₹{order.totalAmount.toFixed(0)}</p>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} /> Delivery Address
                </p>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">{order.customerAddress}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Items</p>
            <div className="flex flex-wrap gap-2">
                {order.items.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                        {item.quantity}x {item.name}
                    </span>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              onClick={() => onReject(order.id)}
              className="py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-rose-600 hover:border-rose-100 transition-all"
            >
              Reject Return
            </button>
            <button 
              onClick={() => onApprove(order.id)}
              className="py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check size={16} /> Approve Return
            </button>
          </div>

          <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest">
            Call the customer to verify before approving cancellation
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReturnRequestPopup;
