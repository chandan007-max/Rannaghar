
import React, { useState } from 'react';
import { useDeliveryPartner } from '../context/DeliveryPartnerContext';
import { Phone, KeyRound, LogIn, Info, Bike, Zap } from 'lucide-react';
import { RANNAGHAR_LOGO } from '../assets/logo';

const DeliveryLoginScreen: React.FC = () => {
    const { login } = useDeliveryPartner();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [stayLoggedIn, setStayLoggedIn] = useState(true);

    const handleSendOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (phone.length >= 10) {
            setOtpSent(true);
            setError('');
        } else {
            setError("Please enter a valid 10-digit phone number.");
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone && otp) {
            const success = login(phone, otp);
            if (!success) {
                setError("Invalid OTP. For this demo, please use 777777.");
            }
        }
    };

    const handleDemoPartnerLogin = () => {
        login("9999999999", "777777");
    };

    return (
    <div className="h-full overflow-y-auto no-scrollbar container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-full bg-white">
      <header className="mb-8 text-center mt-auto">
        <img src={RANNAGHAR_LOGO} alt="Rannaghar Delivery Portal" className="w-56 mx-auto mb-2" />
        <p className="text-lg text-gray-500">Delivery Partner Portal</p>
      </header>
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100 mb-auto">
        <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Partner Login</h2>
                
                {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}
                
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
                        disabled={otpSent}
                    />
                </div>

                {otpSent && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-start text-left space-x-3 text-sm text-indigo-700 bg-indigo-100 p-3 rounded-lg">
                            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <p><strong>Demo Only:</strong> No real SMS is sent. Please use the OTP <strong className="font-mono">777777</strong> to log in.</p>
                        </div>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
                            />
                        </div>
                    </div>
                )}

                {!otpSent ? (
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        Send OTP
                    </button>
                ) : (
                    <>
                        <div className="flex items-center">
                            <input
                                id="stayLoggedInDelivery"
                                type="checkbox"
                                checked={stayLoggedIn}
                                onChange={(e) => setStayLoggedIn(e.target.checked)}
                                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <label htmlFor="stayLoggedInDelivery" className="ml-2 block text-sm text-gray-900">
                                Stay signed in
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={!otp}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition"
                        >
                            <LogIn className="h-5 w-5 mr-2" />
                            Login
                        </button>
                    </>
                )}
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Quick Access</span></div>
            </div>

            <button 
                onClick={handleDemoPartnerLogin}
                className="w-full flex justify-center items-center py-3 px-4 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors font-black text-sm uppercase tracking-widest"
            >
                <Zap size={16} className="mr-2 fill-indigo-600" />
                Quick Demo Partner
            </button>
        </div>
         <style>{`
            @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </div>
    );
};

export default DeliveryLoginScreen;
