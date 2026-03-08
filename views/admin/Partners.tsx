
import React, { useState, useMemo } from 'react';
import { 
  Users, Bike, Star, Phone, 
  ShieldCheck, Ban, MoreVertical, 
  Search, Plus, MapPin, Activity,
  FileText, Landmark, History, AlertTriangle,
  MessageSquare, X, ExternalLink, TrendingUp,
  Wallet, Clock, Edit2, ChevronRight, XCircle
} from 'lucide-react';
import type { DeliveryPartner } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';

const PartnerCard: React.FC<{ 
    partner: DeliveryPartner; 
    onToggleSuspension: (id: string) => void;
    onViewDetails: (partner: DeliveryPartner) => void;
}> = ({ partner, onViewDetails }) => {
    const isPending = partner.onboardingStatus === 'under_review';
    const isRejected = partner.onboardingStatus === 'rejected';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-[32px] border shadow-sm space-y-4 group transition-all duration-500 cursor-pointer ${
                isPending 
                ? 'bg-amber-50/30 border-amber-100 hover:border-amber-300' 
                : 'bg-white border-slate-100 hover:border-rose-100'
            }`}
            onClick={() => onViewDetails(partner)}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                            <img 
                                src={partner.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} 
                                className="w-full h-full object-cover" 
                                alt="" 
                            />
                        </div>
                        {!isPending && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${partner.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-base leading-none">{partner.name || 'New Applicant'}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star size={10} fill="currentColor" />
                                <span className="text-[10px] font-black">{partner.rating || 'N/A'}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{partner.vehicleType || 'Bike'}</span>
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    isPending 
                    ? 'bg-amber-100 text-amber-700 border-amber-200' 
                    : isRejected
                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                    : partner.isOnline 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                    {isPending ? 'Pending Review' : isRejected ? 'Rejected' : partner.isOnline ? 'Active' : 'Offline'}
                </div>
            </div>

            {isPending ? (
                <div className="bg-white/60 p-4 rounded-2xl border border-amber-100/50">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <FileText size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Documents Submitted</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-tight">This partner has submitted their documents and is waiting for approval.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Orders Today</p>
                        <p className="font-black text-slate-900 text-sm">12</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Earnings</p>
                        <p className="font-black text-emerald-600 text-sm">₹840</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Bike size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{partner.vehicleNumber || 'No Vehicle Info'}</span>
                </div>
                {isPending ? (
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
                        Review Now
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <a href={`tel:${partner.phone}`} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-rose-600 transition-colors" onClick={e => e.stopPropagation()}>
                            <Phone size={14} />
                        </a>
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-rose-600 transition-colors" onClick={e => e.stopPropagation()}>
                            <MessageSquare size={14} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const PartnerDetailSheet: React.FC<{ 
    partner: DeliveryPartner; 
    onClose: () => void;
    onToggleSuspension: (id: string) => void;
    onEdit: (partner: DeliveryPartner) => void;
}> = ({ partner, onClose, onToggleSuspension, onEdit }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center"
            onClick={onClose}
        >
            <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-full max-w-lg rounded-t-[40px] p-8 space-y-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-2"></div>
                
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[32px] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                            <img 
                                src={partner.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} 
                                className="w-full h-full object-cover" 
                                alt="" 
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{partner.name}</h3>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-sm font-black">{partner.rating}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    partner.isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                    {partner.isOnline ? 'Active Now' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onEdit(partner)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-600 transition-colors">
                            <Edit2 size={20} />
                        </button>
                        <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                        <TrendingUp size={20} className="mx-auto mb-2 text-rose-600" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                        <p className="font-black text-slate-900">142</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                        <Wallet size={20} className="mx-auto mb-2 text-emerald-600" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Wallet</p>
                        <p className="font-black text-slate-900">₹{partner.negativeWalletBalance.toFixed(0)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                        <Landmark size={20} className="mx-auto mb-2 text-indigo-600" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">COD</p>
                        <p className="font-black text-slate-900">₹{partner.codCollected.toFixed(0)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 flex items-center justify-center gap-3">
                        <MapPin size={18} /> Track Live Location
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <a href={`tel:${partner.phone}`} className="py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                            <Phone size={18} /> Call Partner
                        </a>
                        <button 
                            onClick={() => onToggleSuspension(partner.id)}
                            className={`py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border-2 transition-all ${
                                partner.isSuspended 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                : 'bg-white border-rose-100 text-rose-600'
                            }`}
                        >
                            <Ban size={18} /> {partner.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Partners: React.FC<{ 
    partners: DeliveryPartner[]; 
    onToggleSuspension: (id: string) => void;
}> = ({ partners, onToggleSuspension }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'Active' | 'Offline' | 'Blocked'>('Active');
    const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
    const { approvePartner, rejectPartner, setAllPartners, updatePartnerDetails } = useDeliveryPartner();

    const [newPartnerForm, setNewPartnerForm] = useState({
        name: '',
        phone: '',
        vehicleType: 'Bike' as 'Bike' | 'Scooter',
        vehicleNumber: ''
    });

    const handleAddPartner = () => {
        if (!newPartnerForm.name || !newPartnerForm.phone) {
            alert("Please enter name and phone");
            return;
        }

        const newPartner: DeliveryPartner = {
            id: `partner-${newPartnerForm.phone.slice(-4)}`,
            phone: newPartnerForm.phone,
            name: newPartnerForm.name,
            address: "",
            profilePhoto: "",
            emergencyContact: "",
            vehicleNumber: newPartnerForm.vehicleNumber,
            vehicleType: newPartnerForm.vehicleType,
            documents: {},
            paymentDetails: { type: 'upi' },
            policyAgreed: false,
            onboardingStatus: 'pending_docs',
            isOnline: false,
            codCollected: 0,
            codLedger: [],
            negativeWalletBalance: 0,
            pendingEarnings: 0,
            lifetimeEarnings: 0,
            rating: 4.5,
            settlementHistory: [],
            penalties: [],
            incentives: [],
            isSuspended: false,
            createdAt: new Date().toISOString(),
        };

        setAllPartners(prev => ({ ...prev, [newPartner.phone]: newPartner }));
        setIsAddModalOpen(false);
        setNewPartnerForm({ name: '', phone: '', vehicleType: 'Bike', vehicleNumber: '' });
    };

    const handleUpdatePartner = () => {
        if (!editingPartner) return;
        updatePartnerDetails(editingPartner.phone, editingPartner);
        setEditingPartner(null);
        setSelectedPartner(null);
    };

    const filteredPartners = useMemo(() => {
        let result = partners;
        if (filter === 'Active') result = partners.filter(p => p.isOnline && !p.isSuspended && p.onboardingStatus === 'active');
        else if (filter === 'Offline') result = partners.filter(p => !p.isOnline && !p.isSuspended && p.onboardingStatus === 'active');
        else if (filter === 'Blocked') result = partners.filter(p => p.isSuspended);

        if (searchQuery) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.phone.includes(searchQuery)
            );
        }
        return result;
    }, [partners, filter, searchQuery]);

    const handleApprove = (id: string) => {
        approvePartner(id);
        setSelectedPartner(null);
    };

    const handleReject = (id: string) => {
        const reason = prompt("Enter rejection reason:");
        if (reason) {
            rejectPartner(id, reason);
            setSelectedPartner(null);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="p-6 pt-12 space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Partners</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {filteredPartners.length} {filter} Fleet
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or phone..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[24px] text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                    />
                </div>

                {/* Segmented Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {(['Active', 'Offline', 'Blocked'] as const).map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-400'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {/* Partners List */}
            <div className="px-6 space-y-4">
                {filteredPartners.map(partner => (
                    <motion.div 
                        key={partner.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedPartner(partner)}
                        className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex gap-4 items-center"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-[24px] bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                                <img 
                                    src={partner.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                />
                            </div>
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                partner.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                            }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="font-black text-slate-900 text-sm truncate">{partner.name}</h4>
                                {partner.codCollected > 0 && (
                                    <div className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-widest">
                                        COD: ₹{partner.codCollected.toFixed(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{partner.vehicleNumber}</p>
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{partner.vehicleType}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={10} fill="currentColor" />
                                    <span className="text-[10px] font-black">{partner.rating}</span>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${partner.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {partner.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                    </motion.div>
                ))}

                {filteredPartners.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Users size={40} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No {filter.toLowerCase()} partners found.</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-28 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center z-40"
            >
                <Plus size={32} />
            </motion.button>

            {/* Partner Detail View (Full Screen Modal) */}
            <AnimatePresence>
                {selectedPartner && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-white flex flex-col"
                    >
                        <div className="p-6 pt-12 flex justify-between items-center border-b border-slate-50">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Partner Details</h3>
                            <button onClick={() => setSelectedPartner(null)} className="p-2 text-slate-400">
                                <XCircle size={28} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-[32px] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                                    <img 
                                        src={selectedPartner.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPartner.name}`} 
                                        className="w-full h-full object-cover" 
                                        alt="" 
                                    />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{selectedPartner.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedPartner.phone}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-sm font-black">{selectedPartner.rating}</span>
                                        </div>
                                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            selectedPartner.isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}>
                                            {selectedPartner.isOnline ? 'Active' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                                    <Wallet size={20} className="mx-auto mb-2 text-emerald-600" />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Earnings</p>
                                    <p className="font-black text-slate-900">₹{selectedPartner.lifetimeEarnings.toFixed(0)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                                    <Landmark size={20} className="mx-auto mb-2 text-indigo-600" />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">COD Bal</p>
                                    <p className="font-black text-slate-900">₹{selectedPartner.codCollected.toFixed(0)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                                    <History size={20} className="mx-auto mb-2 text-amber-600" />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                                    <p className="font-black text-slate-900">142</p>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Verified Documents</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <ShieldCheck size={14} />
                                            <p className="text-[8px] font-black uppercase tracking-widest">Govt ID</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-900">{selectedPartner.documents.governmentIdNumber || 'Verified'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Bike size={14} />
                                            <p className="text-[8px] font-black uppercase tracking-widest">License</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-900">{selectedPartner.documents.licenseNumber || 'Verified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 pt-4">
                                <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center justify-center gap-3">
                                    <Activity size={18} /> View Live Tracking
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => { setEditingPartner(selectedPartner); setSelectedPartner(null); }}
                                        className="py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                                    >
                                        <Edit2 size={18} /> Edit Profile
                                    </button>
                                    <button 
                                        onClick={() => { onToggleSuspension(selectedPartner.id); setSelectedPartner(null); }}
                                        className={`py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border-2 transition-all ${
                                            selectedPartner.isSuspended 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                            : 'bg-white border-rose-100 text-rose-600'
                                        }`}
                                    >
                                        <Ban size={18} /> {selectedPartner.isSuspended ? 'Unblock' : 'Block'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal (Simple Overlay) */}
            <AnimatePresence>
                {(isAddModalOpen || editingPartner) && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl space-y-6"
                        >
                            <div className="text-center">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                                    {editingPartner ? 'Edit Partner' : 'New Partner'}
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={editingPartner ? editingPartner.name : newPartnerForm.name}
                                        onChange={e => editingPartner ? setEditingPartner({...editingPartner, name: e.target.value}) : setNewPartnerForm({...newPartnerForm, name: e.target.value})}
                                        className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                                {!editingPartner && (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone</label>
                                        <input 
                                            type="tel" 
                                            value={newPartnerForm.phone}
                                            onChange={e => setNewPartnerForm({...newPartnerForm, phone: e.target.value})}
                                            className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                        />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vehicle</label>
                                        <select 
                                            value={editingPartner ? editingPartner.vehicleType : newPartnerForm.vehicleType}
                                            onChange={e => editingPartner ? setEditingPartner({...editingPartner, vehicleType: e.target.value as any}) : setNewPartnerForm({...newPartnerForm, vehicleType: e.target.value as any})}
                                            className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20 appearance-none"
                                        >
                                            <option value="Bike">Bike</option>
                                            <option value="Scooter">Scooter</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Number</label>
                                        <input 
                                            type="text" 
                                            value={editingPartner ? editingPartner.vehicleNumber : newPartnerForm.vehicleNumber}
                                            onChange={e => editingPartner ? setEditingPartner({...editingPartner, vehicleNumber: e.target.value}) : setNewPartnerForm({...newPartnerForm, vehicleNumber: e.target.value})}
                                            className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => { setIsAddModalOpen(false); setEditingPartner(null); }}
                                    className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={editingPartner ? handleUpdatePartner : handleAddPartner}
                                    className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200"
                                >
                                    {editingPartner ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Partners;
