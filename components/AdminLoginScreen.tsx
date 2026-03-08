
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, LogIn, Loader2, Send, ShieldAlert, ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import { RANNAGHAR_LOGO } from '../assets/logo';

type View = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

const AdminLoginScreen: React.FC = () => {
  const { adminLogin, sendPasswordResetOtp, resetAdminPassword } = useAuth();
  const [view, setView] = useState<View>('LOGIN');
  const [email, setEmail] = useState('rannaghardigha@gmail.com');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await adminLogin(email, password);
    if (!success) {
      setTimeout(() => {
        setError('The credentials provided do not match our administrative records.');
        setIsLoading(false);
      }, 800);
    } else {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    await adminLogin('rannaghardigha@gmail.com', 'admin123');
    setIsLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const mockOtp = await sendPasswordResetOtp(email);
      setMessage(`For demo purposes, your recovery OTP is: ${mockOtp}`);
      setView('RESET_PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Verification system unavailable.');
    }
    setIsLoading(false);
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await resetAdminPassword(otp, newPassword);
    if (success) {
      setMessage('Administrative password has been successfully updated.');
      setView('LOGIN');
      setPassword('');
      setNewPassword('');
      setOtp('');
    } else {
      setError('The OTP provided is invalid or has expired.');
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#0F172A] flex flex-col items-center justify-center p-8 relative overflow-x-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
      
      <div className="w-full max-w-md relative z-10 animate-scale-in my-auto">
        <div className="text-center mb-12">
            <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-600/40 mx-auto mb-6">R</div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Admin Control Portal</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Authorized Access Only</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[48px] border border-slate-800 shadow-2xl">
            {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl flex items-center gap-3"><ShieldAlert size={16}/> {error}</div>}
            {message && <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-2xl flex items-center gap-3"><ShieldCheck size={16}/> {message}</div>}

            {view === 'LOGIN' ? (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type="email" value={email} readOnly className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-3xl text-slate-400 font-bold text-sm cursor-not-allowed" />
                        </div>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-3xl text-white font-bold text-sm focus:border-indigo-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Recover Credentials</button>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={20} /> Establish Connection</>}
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                        <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em]"><span className="bg-[#121a2b] px-4 text-slate-600">Secure Environment</span></div>
                    </div>

                    <button onClick={handleDemoLogin} className="w-full py-4 border-2 border-dashed border-slate-800 text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Zap size={14} className="fill-current" /> Initialize Sandbox
                    </button>
                </form>
            ) : view === 'FORGOT_PASSWORD' ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <p className="text-center text-slate-400 text-sm font-medium">Please verify your administrative email address to proceed with recovery.</p>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-3xl text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Transmit OTP</>}
                    </button>
                    <button type="button" onClick={() => setView('LOGIN')} className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                        <ArrowLeft size={14}/> Back to Interface
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type="text" placeholder="6-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-3xl text-white font-black tracking-widest text-center" />
                        </div>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type="password" placeholder="New Secure Passkey" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-3xl text-white font-bold text-sm" />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Finalize Update'}
                    </button>
                    <button type="button" onClick={() => setView('LOGIN')} className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Cancel Request</button>
                </form>
            )}
        </div>
        
        <p className="text-center mt-12 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Rannaghar Logistics • v4.2.0-stable
        </p>
      </div>

      <style>{`
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminLoginScreen;
