
import React, { useState } from 'react';
import { Settlement } from '../types';
import { X, QrCode, ShieldCheck, Loader2 } from 'lucide-react';
import { RESTAURANT_NAME } from '../constants';

interface UpiSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: Settlement;
  onVerify: (settlementId: string, transactionId: string) => Promise<boolean>;
}

const UpiSettlementModal: React.FC<UpiSettlementModalProps> = ({ isOpen, onClose, settlement, onVerify }) => {
    const [transactionId, setTransactionId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (transactionId.length !== 12 || !/^\d+$/.test(transactionId)) {
            setError('Please enter a valid 12-digit UPI transaction ID.');
            return;
        }
        setError('');
        setIsVerifying(true);
        const success = await onVerify(settlement.id, transactionId);
        if (!success) {
            setError('Verification failed. Please double-check the ID or try again.');
        }
        setIsVerifying(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col transform transition-all animate-scale-in">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Settle via UPI</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="h-6 w-6" />
                    </button>
                </header>
                
                <main className="p-6 space-y-4 text-center">
                    <p className="text-gray-600">Scan the QR code or use the UPI ID to pay your pending COD amount of:</p>
                    <p className="text-4xl font-extrabold text-gray-900">₹{settlement.amount.toFixed(2)}</p>
                    
                    <div className="flex justify-center my-4">
                        <div className="p-3 bg-white border-4 border-gray-800 rounded-lg">
                            <QrCode size={128} className="text-gray-800" />
                        </div>
                    </div>
                    
                    <p className="text-sm font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">
                        UPI ID: <span className="font-mono text-indigo-600">rannaghar@okhdfcbank</span>
                    </p>
                    
                    <div className="pt-4 border-t">
                        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                            Enter 12-digit UPI Transaction ID
                        </label>
                        <input
                            id="transactionId"
                            type="tel"
                            maxLength={12}
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className={`w-full text-center text-xl tracking-[0.2em] font-semibold p-2 border-2 rounded-lg ${error ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                            placeholder="************"
                        />
                         {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                </main>
                
                <footer className="p-4 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || transactionId.length !== 12}
                        className="w-full flex justify-center items-center py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 font-semibold"
                    >
                        {isVerifying ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                        {isVerifying ? 'Verifying...' : 'Verify Payment'}
                    </button>
                </footer>
            </div>
             <style>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default UpiSettlementModal;
