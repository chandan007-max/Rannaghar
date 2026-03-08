
import React, { useState, useMemo } from 'react';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';
import { useSettlement } from '../../context/SettlementContext';
import { useSettings } from '../../context/SettingsContext';
import { 
  Landmark, ArrowUp, QrCode, Receipt, 
  BadgeInfo, AlertTriangle, CheckCircle, 
  Clock, X, Upload, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FinanceScreen: React.FC = () => {
  const { partner, completeCodSettlement } = useDeliveryPartner();
  const { 
    createCodSettlement, 
    verifySettlementOtp, 
    getPartnerPendingCodSettlement, 
    createUpiSettlement 
  } = useSettlement();
  const { settings } = useSettings();
  
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmittingUpi, setIsSubmittingUpi] = useState(false);
  
  if (!partner) return null;

  const activeCodSettlement = getPartnerPendingCodSettlement(partner.id);
  const codLimit = settings.maxCodLimit || 3000;
  const isLimitExceeded = partner.codCollected >= codLimit;

  const handleUpiSubmit = async () => {
    if (!utrNumber) return;
    setIsSubmittingUpi(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    createUpiSettlement(partner.id, partner.codCollected, utrNumber);
    setIsSubmittingUpi(false);
    setIsUpiModalOpen(false);
    setUtrNumber('');
  };

  return (
    <div className="p-5 space-y-6 bg-slate-50 min-h-full pb-24">
      {/* COD Limit Warning */}
      {isLimitExceeded && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3"
        >
          <AlertTriangle className="text-rose-500 shrink-0" size={20} />
          <div>
            <p className="text-sm font-black text-rose-900 uppercase tracking-tight">COD Limit Exceeded!</p>
            <p className="text-[11px] text-rose-700 font-medium mt-1">
              You have collected ₹{partner.codCollected.toFixed(0)}. Please settle COD to continue receiving COD orders.
            </p>
          </div>
        </motion.div>
      )}

      {/* COD Status Card */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">COD Collection</h3>
            <BadgeInfo size={18} className="text-slate-300" />
        </div>
        
        <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash in Hand</p>
            <p className="text-4xl font-black text-slate-900">₹{partner.codCollected.toFixed(0)}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${isLimitExceeded ? 'bg-rose-500' : 'bg-teal-500'}`}
                        style={{ width: `${Math.min(100, (partner.codCollected / codLimit) * 100)}%` }}
                    />
                </div>
                <span className="text-[10px] font-bold text-slate-400">Limit: ₹{codLimit}</span>
            </div>
        </div>

        {!activeCodSettlement ? (
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setIsUpiModalOpen(true)}
                    disabled={partner.codCollected <= 0}
                    className="py-4 px-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                >
                    <QrCode size={20}/>
                    Online Transfer
                </button>
                <button 
                    onClick={() => createCodSettlement(partner.id, partner.codCollected)}
                    disabled={partner.codCollected <= 0}
                    className="py-4 px-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase flex flex-col items-center justify-center gap-2 disabled:opacity-50 text-center"
                >
                    <Landmark size={20}/>
                    Request Cash Settlement
                </button>
            </div>
        ) : (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Settlement {activeCodSettlement.status}</span>
                    </div>
                    <span className="text-xs font-black">₹{activeCodSettlement.amount.toFixed(0)}</span>
                </div>

                {activeCodSettlement.method === 'Cash' && activeCodSettlement.status === 'AwaitingOTP' ? (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-center text-slate-500 uppercase">Enter OTP from Admin</p>
                        <input 
                            type="tel" 
                            maxLength={6} 
                            value={enteredOtp} 
                            onChange={e => setEnteredOtp(e.target.value)} 
                            className="w-full text-center text-2xl tracking-[0.5em] font-black p-3 bg-white border-2 rounded-2xl focus:border-indigo-500 outline-none" 
                        />
                        <button 
                            onClick={() => verifySettlementOtp(activeCodSettlement.id, enteredOtp) && completeCodSettlement({...activeCodSettlement, status: 'Completed'})} 
                            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black shadow-lg"
                        >
                            Verify Handover
                        </button>
                    </div>
                ) : activeCodSettlement.method === 'Cash' ? (
                    <div className="text-center py-2">
                        <p className="text-xs font-bold text-slate-600">Waiting for Admin to generate OTP</p>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-xs font-bold text-slate-600">Awaiting Admin approval for UPI transfer</p>
                        <p className="text-[10px] text-slate-400 mt-1">UTR: {activeCodSettlement.transactionId}</p>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* COD Ledger */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs px-1">COD Ledger</h3>
        <div className="space-y-3">
            {partner.codLedger.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
                    <Receipt size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No COD orders yet</p>
                </div>
            ) : (
                [...partner.codLedger].reverse().map(entry => (
                    <div key={entry.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${entry.status === 'Settled' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
                                <Receipt size={16}/>
                            </div>
                            <div>
                                <p className="text-xs font-black">{entry.orderId}</p>
                                <p className="text-[9px] text-slate-400 font-bold">{new Date(entry.date).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900">₹{entry.amount.toFixed(0)}</p>
                            <span className={`text-[9px] font-black uppercase ${entry.status === 'Settled' ? 'text-teal-500' : 'text-amber-500'}`}>
                                {entry.status}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Online Settlement Modal */}
      <AnimatePresence>
        {isUpiModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsUpiModalOpen(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Online Transfer</h2>
                        <button onClick={() => setIsUpiModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Transfer Amount</p>
                            <p className="text-2xl font-black text-indigo-900">₹{partner.codCollected.toFixed(0)}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UTR / Transaction ID</label>
                                <input 
                                    type="text"
                                    value={utrNumber}
                                    onChange={e => setUtrNumber(e.target.value)}
                                    placeholder="Enter 12-digit UTR"
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold transition-all mt-1"
                                />
                            </div>

                            <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl text-center space-y-2">
                                <Upload size={24} className="mx-auto text-slate-300" />
                                <p className="text-xs font-bold text-slate-500">Upload Payment Screenshot</p>
                                <p className="text-[10px] text-slate-400">Max size 5MB (JPG, PNG)</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleUpiSubmit}
                            disabled={!utrNumber || isSubmittingUpi}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmittingUpi ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit for Approval
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceScreen;
