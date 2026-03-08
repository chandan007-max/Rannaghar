
import React, { useState } from 'react';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';
import { DeliveryPartner, OnboardingStatus } from '../../types';
import { 
  User, Camera, FileText, Landmark, ShieldCheck, Check, 
  LogOut, Loader2, Clock, Bike, UploadCloud, MapPin, 
  CreditCard, AlertCircle, ChevronRight, ChevronLeft,
  Smartphone, Image as ImageIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-8 overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-rose-600 h-full rounded-full"
            />
        </div>
    );
};

const StepHeader: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{title}</h2>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest leading-relaxed">{description}</p>
    </div>
);

const OnboardingFlow: React.FC = () => {
    const { partner, logout, updatePartnerOnboarding, submitForReview } = useDeliveryPartner();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!partner) return null;

    // Local form states
    const [personalData, setPersonalData] = useState({
        name: partner.name || '',
        dob: partner.dob || '',
        address: partner.address || '',
        city: partner.city || '',
        emergencyContact: partner.emergencyContact || '',
    });

    const [docsData, setDocsData] = useState({
        profilePhoto: partner.profilePhoto || '',
        governmentIdType: partner.documents.governmentIdType || 'Aadhaar',
        governmentIdNumber: partner.documents.governmentIdNumber || '',
        governmentIdFront: partner.documents.governmentIdFront || '',
        governmentIdBack: partner.documents.governmentIdBack || '',
        licenseNumber: partner.documents.licenseNumber || '',
        licenseExpiry: partner.documents.licenseExpiry || '',
        licenseFront: partner.documents.licenseFront || '',
        licenseBack: partner.documents.licenseBack || '',
        vehicleNumber: partner.vehicleNumber || '',
        vehicleType: partner.vehicleType || 'Bike',
        rcDocument: partner.documents.rcDocument || '',
        insuranceCertificate: partner.documents.insuranceCertificate || '',
    });

    const [bankData, setBankData] = useState({
        accountHolderName: partner.paymentDetails.accountHolderName || '',
        bankName: partner.paymentDetails.bankName || '',
        accountNumber: partner.paymentDetails.accountNumber || '',
        ifsc: partner.paymentDetails.ifsc || '',
        upiId: partner.paymentDetails.upiId || '',
    });

    const handleUpdate = async (data: any) => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        updatePartnerOnboarding(data);
        setIsSubmitting(false);
        setStep(prev => prev + 1);
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Personal Details
                return (
                    <div className="space-y-6">
                        <StepHeader title="Personal Details" description="Tell us a bit about yourself to get started." />
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={personalData.name} 
                                    onChange={e => setPersonalData({...personalData, name: e.target.value})}
                                    placeholder="Enter your full name"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                <input 
                                    type="date" 
                                    value={personalData.dob} 
                                    onChange={e => setPersonalData({...personalData, dob: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                    <input 
                                        type="text" 
                                        value={personalData.city} 
                                        onChange={e => setPersonalData({...personalData, city: e.target.value})}
                                        placeholder="City"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact</label>
                                    <input 
                                        type="tel" 
                                        value={personalData.emergencyContact} 
                                        onChange={e => setPersonalData({...personalData, emergencyContact: e.target.value})}
                                        placeholder="Mobile Number"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                                <textarea 
                                    value={personalData.address} 
                                    onChange={e => setPersonalData({...personalData, address: e.target.value})}
                                    placeholder="Enter your complete address"
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all resize-none"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => handleUpdate(personalData)}
                            disabled={!personalData.name || !personalData.dob || !personalData.address || isSubmitting}
                            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ChevronRight size={18} /></>}
                        </button>
                    </div>
                );

            case 2: // Photo Upload
                return (
                    <div className="space-y-6">
                        <StepHeader title="Live Selfie" description="Take a clear photo of your face. No masks or sunglasses." />
                        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            {docsData.profilePhoto ? (
                                <div className="relative">
                                    <img src={docsData.profilePhoto} className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl" />
                                    <button 
                                        onClick={() => setDocsData({...docsData, profilePhoto: ''})}
                                        className="absolute -top-2 -right-2 p-2 bg-rose-600 text-white rounded-full shadow-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setDocsData({...docsData, profilePhoto: 'https://picsum.photos/seed/partner/400/400'})}
                                    className="flex flex-col items-center gap-4 text-slate-400"
                                >
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Camera size={40} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tap to Capture</span>
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                            <button 
                                onClick={() => handleUpdate({ profilePhoto: docsData.profilePhoto })}
                                disabled={!docsData.profilePhoto || isSubmitting}
                                className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                );

            case 3: // Government ID
                return (
                    <div className="space-y-6">
                        <StepHeader title="Government ID" description="Upload your Aadhaar or Voter ID card." />
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {['Aadhaar', 'Voter ID'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setDocsData({...docsData, governmentIdType: type as any})}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${docsData.governmentIdType === type ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-400 border-slate-100'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{docsData.governmentIdType} Number</label>
                                <input 
                                    type="text" 
                                    value={docsData.governmentIdNumber} 
                                    onChange={e => setDocsData({...docsData, governmentIdNumber: e.target.value})}
                                    placeholder={`Enter ${docsData.governmentIdType} Number`}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setDocsData({...docsData, governmentIdFront: 'front.jpg'})}
                                    className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all ${docsData.governmentIdFront ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                >
                                    {docsData.governmentIdFront ? <Check size={24} /> : <UploadCloud size={24} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">Front Side</span>
                                </button>
                                <button 
                                    onClick={() => setDocsData({...docsData, governmentIdBack: 'back.jpg'})}
                                    className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all ${docsData.governmentIdBack ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                >
                                    {docsData.governmentIdBack ? <Check size={24} /> : <UploadCloud size={24} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">Back Side</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                            <button 
                                onClick={() => handleUpdate({ documents: { ...partner.documents, governmentIdType: docsData.governmentIdType, governmentIdNumber: docsData.governmentIdNumber, governmentIdFront: docsData.governmentIdFront, governmentIdBack: docsData.governmentIdBack } })}
                                disabled={!docsData.governmentIdNumber || !docsData.governmentIdFront || !docsData.governmentIdBack || isSubmitting}
                                className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                );

            case 4: // Driving License
                return (
                    <div className="space-y-6">
                        <StepHeader title="Driving License" description="Your license must be valid and clearly visible." />
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License Number</label>
                                <input 
                                    type="text" 
                                    value={docsData.licenseNumber} 
                                    onChange={e => setDocsData({...docsData, licenseNumber: e.target.value})}
                                    placeholder="Enter DL Number"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                <input 
                                    type="date" 
                                    value={docsData.licenseExpiry} 
                                    onChange={e => setDocsData({...docsData, licenseExpiry: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setDocsData({...docsData, licenseFront: 'dl_front.jpg'})}
                                    className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all ${docsData.licenseFront ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                >
                                    {docsData.licenseFront ? <Check size={24} /> : <UploadCloud size={24} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">DL Front</span>
                                </button>
                                <button 
                                    onClick={() => setDocsData({...docsData, licenseBack: 'dl_back.jpg'})}
                                    className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all ${docsData.licenseBack ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                >
                                    {docsData.licenseBack ? <Check size={24} /> : <UploadCloud size={24} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">DL Back</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(3)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                            <button 
                                onClick={() => handleUpdate({ documents: { ...partner.documents, licenseNumber: docsData.licenseNumber, licenseExpiry: docsData.licenseExpiry, licenseFront: docsData.licenseFront, licenseBack: docsData.licenseBack } })}
                                disabled={!docsData.licenseNumber || !docsData.licenseExpiry || !docsData.licenseFront || isSubmitting}
                                className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                );

            case 5: // Vehicle Documents
                return (
                    <div className="space-y-6">
                        <StepHeader title="Vehicle Info" description="Registration certificate and vehicle details." />
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {['Bike', 'Scooter'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setDocsData({...docsData, vehicleType: type as any})}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${docsData.vehicleType === type ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-400 border-slate-100'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Number</label>
                                <input 
                                    type="text" 
                                    value={docsData.vehicleNumber} 
                                    onChange={e => setDocsData({...docsData, vehicleNumber: e.target.value.toUpperCase()})}
                                    placeholder="e.g. WB01AB1234"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <button 
                                onClick={() => setDocsData({...docsData, rcDocument: 'rc.jpg'})}
                                className={`w-full flex flex-col items-center gap-2 p-8 rounded-2xl border-2 border-dashed transition-all ${docsData.rcDocument ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                            >
                                {docsData.rcDocument ? <Check size={32} /> : <UploadCloud size={32} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">Upload Vehicle RC</span>
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(4)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                            <button 
                                onClick={() => handleUpdate({ vehicleNumber: docsData.vehicleNumber, vehicleType: docsData.vehicleType, documents: { ...partner.documents, rcDocument: docsData.rcDocument } })}
                                disabled={!docsData.vehicleNumber || !docsData.rcDocument || isSubmitting}
                                className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                );

            case 6: // Bank Details
                return (
                    <div className="space-y-6">
                        <StepHeader title="Bank Details" description="For your weekly settlement and payouts." />
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                                <input 
                                    type="text" 
                                    value={bankData.accountHolderName} 
                                    onChange={e => setBankData({...bankData, accountHolderName: e.target.value})}
                                    placeholder="As per bank records"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                <input 
                                    type="text" 
                                    value={bankData.bankName} 
                                    onChange={e => setBankData({...bankData, bankName: e.target.value})}
                                    placeholder="e.g. HDFC Bank"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                <input 
                                    type="text" 
                                    value={bankData.accountNumber} 
                                    onChange={e => setBankData({...bankData, accountNumber: e.target.value})}
                                    placeholder="Enter Account Number"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                    <input 
                                        type="text" 
                                        value={bankData.ifsc} 
                                        onChange={e => setBankData({...bankData, ifsc: e.target.value.toUpperCase()})}
                                        placeholder="IFSC"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UPI ID (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={bankData.upiId} 
                                        onChange={e => setBankData({...bankData, upiId: e.target.value})}
                                        placeholder="e.g. name@upi"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-rose-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(5)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                            <button 
                                onClick={() => handleUpdate({ paymentDetails: { ...partner.paymentDetails, ...bankData } })}
                                disabled={!bankData.accountNumber || !bankData.ifsc || isSubmitting}
                                className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                );

            case 7: // Final Review
                return (
                    <div className="space-y-6">
                        <StepHeader title="Review & Submit" description="Please verify all details before final submission." />
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <img src={partner.profilePhoto} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{partner.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{partner.phone}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vehicle</p>
                                        <p className="text-[10px] font-bold text-slate-900">{partner.vehicleNumber} ({partner.vehicleType})</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">City</p>
                                        <p className="text-[10px] font-bold text-slate-900">{partner.city}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                    <ShieldCheck size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Documents Uploaded</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Govt ID', 'License', 'Vehicle RC'].map(doc => (
                                        <div key={doc} className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                                            <Check size={10} /> {doc}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                                    By submitting, you agree that all provided information is true. Fraudulent documents will lead to permanent blacklisting.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(6)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                            <button 
                                onClick={() => {
                                    setIsSubmitting(true);
                                    setTimeout(() => {
                                        submitForReview(partner.id);
                                        setIsSubmitting(false);
                                    }, 1500);
                                }}
                                disabled={isSubmitting}
                                className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Submit for Review <Check size={18} /></>}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (partner.onboardingStatus === 'under_review') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[70vh]">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 relative">
                    <Clock size={48} />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full"
                    />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Under Review</h2>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed max-w-xs">
                    Your application is being verified by our team. This usually takes 24-48 hours. We'll notify you once approved.
                </p>
                <button onClick={logout} className="mt-12 text-rose-600 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <LogOut size={14} /> Logout
                </button>
            </div>
        );
    }

    if (partner.onboardingStatus === 'rejected') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[70vh]">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Application Rejected</h2>
                <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-100 max-w-xs">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Reason</p>
                    <p className="text-xs font-bold text-rose-800 leading-relaxed">
                        {partner.rejectionReason || "Documents were not clear. Please re-upload your Driving License."}
                    </p>
                </div>
                <button 
                    onClick={() => {
                        updatePartnerOnboarding({ onboardingStatus: 'pending_docs' });
                        setStep(1);
                    }} 
                    className="mt-8 py-4 px-8 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200"
                >
                    Re-upload Documents
                </button>
                <button onClick={logout} className="mt-6 text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <LogOut size={14} /> Logout
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                        <Bike size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Onboarding</h1>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Step {step} of 7</p>
                    </div>
                </div>
                <button onClick={logout} className="p-3 bg-slate-50 text-slate-400 rounded-xl">
                    <LogOut size={20} />
                </button>
            </header>

            <main className="flex-1 px-6 pb-12">
                <ProgressBar currentStep={step} totalSteps={7} />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </main>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default OnboardingFlow;
