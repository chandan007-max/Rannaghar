
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, Clock, MapPin, Phone, 
  Check, X, Minus, Plus, 
  AlertTriangle, ShoppingBag, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../../../types';

interface NewOrderPopupProps {
  order: Order;
  onAccept: (id: string, prepMinutes: number) => void;
  onReject: (id: string, reason: string) => void;
}

const NewOrderPopup: React.FC<NewOrderPopupProps> = ({ order, onAccept, onReject }) => {
  const [prepTime, setPrepTime] = useState(25);
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState('Busy');

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onReject(order.id, 'Auto Rejected - Timeout');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, order.id, onReject]);

  // Sound effect
  useEffect(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.loop = true;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustPrepTime = (delta: number) => {
    setPrepTime(prev => {
      const next = prev + delta;
      return Math.min(90, Math.max(5, next));
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col"
    >
      {/* Top Section: Timer & Status */}
      <div className="bg-rose-600 p-6 pt-12 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">New Order</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Action Required</p>
          </div>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2">
          <Clock size={16} />
          <span className="font-black text-lg tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Card Layout */}
        <div className="bg-slate-50 p-6 rounded-[32px] space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">#{order.id.slice(-6).toUpperCase()}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
              <h3 className="text-2xl font-black text-rose-600 tracking-tighter">₹{order.totalAmount.toFixed(0)}</h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
              <p className="font-black text-slate-900">{order.customerName}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              order.paymentMode === 'COD' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {order.paymentMode}
            </div>
          </div>

          {/* Items Preview */}
          <div className="space-y-3 pt-4 border-t border-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Preview</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm font-black text-slate-800">{item.quantity}x {item.name}</span>
                  <span className="text-sm font-bold text-slate-400">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preparation Time Selector */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Set Preparation Time</p>
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-[32px]">
            <button 
              onClick={() => adjustPrepTime(-5)}
              className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-900 shadow-sm active:scale-90 transition-all"
            >
              <Minus size={24} />
            </button>
            <div className="text-center">
              <span className="text-4xl font-black text-slate-900 tabular-nums">{prepTime}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mins</span>
            </div>
            <button 
              onClick={() => adjustPrepTime(5)}
              className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-900 shadow-sm active:scale-90 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="p-6 grid grid-cols-2 gap-4 bg-white border-t border-slate-50">
        <button 
          onClick={() => setShowRejectConfirm(true)}
          className="py-5 bg-slate-100 text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
        >
          Reject (Red)
        </button>
        <button 
          onClick={() => onAccept(order.id, prepTime)}
          className="py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Check size={20} /> Accept (Green)
        </button>
      </div>

      {/* Reject Confirmation Overlay */}
      <AnimatePresence>
        {showRejectConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1001] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8 space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Reject Order?</h3>
                <p className="text-xs font-bold text-slate-400 mt-2">Select a reason</p>
              </div>
              
              <div className="space-y-2">
                {['Busy', 'Out of Stock', 'Closing Soon', 'Kitchen Issue'].map(reason => (
                  <button 
                    key={reason}
                    onClick={() => setRejectReason(reason)}
                    className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                      rejectReason === reason ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => setShowRejectConfirm(false)}
                  className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  Back
                </button>
                <button 
                  onClick={() => onReject(order.id, rejectReason)}
                  className="py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NewOrderPopup;
