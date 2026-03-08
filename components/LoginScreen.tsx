
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Geolocation as GeoType, Address } from '../types';
import { MapPin, User, Phone, Home, Loader2, CheckCircle, KeyRound, LogIn, UserPlus, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import { RANNAGHAR_LOGO } from '../assets/logo';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [mockOtpMessage, setMockOtpMessage] = useState('');

    const handleSendOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (phone.length >= 10) {
            setOtpSent(true);
            setMockOtpMessage('123456');
        } else {
            alert("Please enter a valid 10-digit phone number.");
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone && otp) {
            if (otp !== '123456') {
                alert("Invalid OTP. For this demo, please use 123456.");
                return;
            }
            const mockAddress: Address = {
              id: 'addr-mock-1',
              label: 'Home',
              fullAddress: 'Sea Beach Road, Old Digha, WB',
              location: { latitude: 21.6253, longitude: 87.5255 },
            };
            login({
                name: "Returning User",
                phone: phone,
                addresses: [mockAddress],
                primaryAddressId: mockAddress.id,
            });
        }
    };

    const handleDemoCustomerLogin = () => {
        const demoAddress: Address = {
            id: 'addr-demo-customer',
            label: 'Demo Home',
            fullAddress: 'Guest House, New Digha, West Bengal',
            location: { latitude: 21.6234, longitude: 87.5098 },
        };
        login({
            name: "Demo Customer",
            phone: "9876543210",
            addresses: [demoAddress],
            primaryAddressId: demoAddress.id,
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-black text-maroon-900 tracking-tighter">Welcome back</h2>
                <p className="text-sm font-bold text-maroon-400 mt-1 uppercase tracking-widest">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-maroon-600">
                             <Phone className="h-5 w-5 text-maroon-300"/>
                        </div>
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-maroon-50 border border-maroon-100 rounded-[20px] font-bold text-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-500/10 focus:border-maroon-500 transition-all outline-none"
                            disabled={otpSent}
                        />
                    </div>

                    {otpSent && (
                        <div className="animate-scale-in space-y-4">
                            <div className="bg-maroon-700 p-4 rounded-2xl flex items-center gap-3 text-white shadow-xl shadow-maroon-100">
                                <KeyRound size={20} className="shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Demo OTP Code</p>
                                    <p className="text-lg font-black tracking-[0.3em]">{mockOtpMessage}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="w-full text-center py-4 bg-maroon-50 border border-maroon-100 rounded-[20px] font-black text-xl tracking-[0.5em] text-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-500/10 focus:border-maroon-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {!otpSent ? (
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full py-5 bg-maroon-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-maroon-100 hover:bg-maroon-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Send Verification Code <ChevronRight size={18}/>
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!otp}
                        className="w-full py-5 bg-mustard-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-mustard-100 hover:bg-mustard-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Establish Connection <LogIn size={18} />
                    </button>
                )}
            </form>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-maroon-100"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="bg-white px-4 text-maroon-300">Fast Access</span></div>
            </div>

            <button 
                onClick={handleDemoCustomerLogin}
                className="w-full py-4 bg-maroon-50 border-2 border-dashed border-maroon-200 text-maroon-600 rounded-[24px] hover:bg-maroon-100 hover:border-maroon-300 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
            >
                <Zap size={16} className="fill-maroon-600" />
                Initialize Demo Session
            </button>
        </div>
    );
};

const SignUp: React.FC = () => {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<GeoType | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation unavailable on this device.');
            return;
        }

        setIsGettingLocation(true);
        setLocationError('');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsGettingLocation(false);
            },
            (error) => {
                let errorMessage = 'Check browser permissions and try again.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location access denied by user.';
                }
                setLocationError(errorMessage);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone && address && location) {
            const newAddress: Address = {
                id: `addr-${Date.now()}`,
                label: 'Home',
                fullAddress: address,
                location: location,
            };
            login({ name, phone, addresses: [newAddress], primaryAddressId: newAddress.id });
        } else if (!location) {
            alert('Precision delivery requires pinning your location.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
             <div className="text-center mb-4">
                <h2 className="text-3xl font-black text-maroon-900 tracking-tighter">Join us</h2>
                <p className="text-sm font-bold text-maroon-400 mt-1 uppercase tracking-widest">Create your flavor profile</p>
            </div>
            
            <div className="space-y-4">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-maroon-300 group-focus-within:text-maroon-600 transition-colors"/>
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-12 pr-4 py-4 bg-maroon-50 border border-maroon-100 rounded-[20px] font-bold text-maroon-900 outline-none focus:bg-white focus:border-maroon-500 transition-all" />
                </div>
                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-maroon-300 group-focus-within:text-maroon-600 transition-colors"/>
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full pl-12 pr-4 py-4 bg-maroon-50 border border-maroon-100 rounded-[20px] font-bold text-maroon-900 outline-none focus:bg-white focus:border-maroon-500 transition-all" />
                </div>
                <div className="relative group">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-maroon-300 group-focus-within:text-maroon-600 transition-colors"/>
                    <input type="text" placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full pl-12 pr-4 py-4 bg-maroon-50 border border-maroon-100 rounded-[20px] font-bold text-maroon-900 outline-none focus:bg-white focus:border-maroon-500 transition-all" />
                </div>
                
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isGettingLocation || !!location}
                        className={`w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 transition-all ${location ? 'bg-mustard-500 text-white shadow-mustard-100' : 'bg-maroon-50 text-maroon-600 border-2 border-maroon-100 shadow-maroon-50'}`}
                    >
                        {isGettingLocation ? <Loader2 className="animate-spin" size={16}/> : location ? <CheckCircle size={16}/> : <MapPin size={16}/>}
                        {isGettingLocation ? 'Acquiring Signal...' : location ? 'Signal Locked' : 'Pin Accurate GPS Location'}
                    </button>
                    {locationError && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-2xl border border-rose-100 text-[10px] font-black uppercase">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{locationError}</span>
                            <button type="button" onClick={handleGetLocation} className="ml-auto text-rose-600 underline">Retry</button>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-5 bg-maroon-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-maroon-100 hover:bg-maroon-700 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
            >
                <UserPlus size={18}/> Finalize Account
            </button>
        </form>
    );
};

const LoginScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10 animate-fade-in min-h-full flex flex-col justify-center bg-white">
       <div className="text-center mb-10">
          <img src={RANNAGHAR_LOGO} alt="Rannaghar" className="w-48 mx-auto mb-2" />
          <p className="text-[10px] font-black text-maroon-400 uppercase tracking-[0.3em]">Authentic Bengali Delicacies</p>
       </div>

       <div className="flex bg-maroon-50 p-1.5 rounded-[28px] mb-10 border border-maroon-100 shadow-inner">
          <button 
              onClick={() => setIsLoginView(true)} 
              className={`flex-1 py-3 px-6 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${isLoginView ? 'bg-white text-maroon-600 shadow-xl' : 'text-maroon-300'}`}
          >
              Login
          </button>
          <button 
              onClick={() => setIsLoginView(false)} 
              className={`flex-1 py-3 px-6 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${!isLoginView ? 'bg-white text-maroon-600 shadow-xl' : 'text-maroon-300'}`}
          >
              Register
          </button>
      </div>
      <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-maroon-100/20 border border-maroon-50">
          {isLoginView ? <Login /> : <SignUp />}
      </div>
       <style>{`
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .text-maroon-900 { color: #450a0a; }
        .text-maroon-700 { color: #7f1d1d; }
        .text-maroon-600 { color: #991b1b; }
        .text-maroon-400 { color: #f87171; }
        .text-maroon-300 { color: #fca5a5; }
        .bg-maroon-700 { background-color: #7f1d1d; }
        .bg-maroon-600 { background-color: #991b1b; }
        .bg-maroon-100 { background-color: #fee2e2; }
        .bg-maroon-50 { background-color: #fef2f2; }
        .border-maroon-500 { border-color: #ef4444; }
        .border-maroon-200 { border-color: #fecaca; }
        .border-maroon-100 { border-color: #fee2e2; }
        .border-maroon-50 { border-color: #fef2f2; }
        .focus\\:ring-maroon-500\\/10 { --tw-ring-color: rgba(239, 68, 68, 0.1); }
        .focus\\:border-maroon-500 { border-color: #ef4444; }
        .bg-mustard-500 { background-color: #eab308; }
        .bg-mustard-600 { background-color: #ca8a04; }
        .text-mustard-500 { color: #eab308; }
        .shadow-maroon-100 { --tw-shadow-color: #fee2e2; --tw-shadow: var(--tw-shadow-colored); }
        .shadow-mustard-100 { --tw-shadow-color: #fef9c3; --tw-shadow: var(--tw-shadow-colored); }
      `}</style>
    </div>
  );
};

export default LoginScreen;
