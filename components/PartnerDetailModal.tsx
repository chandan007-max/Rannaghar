
import React, { useState } from 'react';
import { DeliveryPartner } from '../types';
import { X, User, Phone, MapPin, AlertTriangle, Bike, FileText, Landmark, Edit, Trash2, Save } from 'lucide-react';
import { useDeliveryPartner } from '../context/DeliveryPartnerContext';

interface PartnerDetailModalProps {
    partner: DeliveryPartner;
    onClose: () => void;
}

// Reusable component for detail items
const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start text-sm">
        <div className="text-gray-500 mr-3 mt-1">{icon}</div>
        <div>
            <p className="font-semibold text-gray-500">{label}</p>
            <p className="text-gray-800">{value}</p>
        </div>
    </div>
);

// Reusable component for editable fields
const EditableField = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-gray-500">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
    </div>
);

const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({ partner, onClose }) => {
    const { updatePartnerDetails, deletePartner } = useDeliveryPartner();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<DeliveryPartner>(partner);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            paymentDetails: {
                ...prev.paymentDetails,
                [name]: value,
            }
        }));
    };
    
    const handleSave = () => {
        updatePartnerDetails(formData.phone, formData);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete partner ${partner.name}? This action cannot be undone.`)) {
            deletePartner(partner.phone);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-scale-in">
                <header className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Partner Details' : 'Partner Details'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24}/></button>
                </header>

                <main className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <EditableField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                                    <EditableField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="block text-xs font-medium text-gray-500">Address</label>
                                        <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                    </div>
                                    <EditableField label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
                                </>
                            ) : (
                                <>
                                    <DetailItem icon={<User size={16}/>} label="Name" value={partner.name} />
                                    <DetailItem icon={<Phone size={16}/>} label="Phone" value={partner.phone} />
                                    <div className="md:col-span-2"><DetailItem icon={<MapPin size={16}/>} label="Address" value={partner.address} /></div>
                                    <DetailItem icon={<AlertTriangle size={16}/>} label="Emergency Contact" value={partner.emergencyContact} />
                                </>
                            )}
                        </div>
                    </section>
                    
                    {/* Vehicle & Documents */}
                    <section>
                         <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Vehicle & Documents</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {isEditing ? (
                                <EditableField label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} />
                             ) : (
                                <DetailItem icon={<Bike size={16}/>} label="Vehicle Number" value={partner.vehicleNumber} />
                             )}
                            
                             <div className="flex items-center text-sm">
                                <FileText size={16} className="text-gray-500 mr-3" />
                                <div>
                                    <p className="font-semibold text-gray-500">Aadhaar Card</p>
                                    <p className="text-gray-800 flex items-center">{partner.documents.aadhaar ? 'Uploaded' : 'Not Uploaded'} {isEditing && <button className="ml-2 text-xs text-indigo-600">(Re-upload)</button>}</p>
                                </div>
                             </div>
                             <div className="flex items-center text-sm">
                                <FileText size={16} className="text-gray-500 mr-3" />
                                <div>
                                    <p className="font-semibold text-gray-500">Driving License</p>
                                    <p className="text-gray-800 flex items-center">{partner.documents.license ? 'Uploaded' : 'Not Uploaded'} {isEditing && <button className="ml-2 text-xs text-indigo-600">(Re-upload)</button>}</p>
                                </div>
                             </div>
                         </div>
                    </section>
                    
                     {/* Payment Details */}
                    <section>
                         <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Payment Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {isEditing ? (
                                <>
                                    {partner.paymentDetails.type === 'upi' ? (
                                        <EditableField label="UPI ID" name="upiId" value={formData.paymentDetails.upiId || ''} onChange={handlePaymentChange} />
                                    ) : (
                                        <>
                                            <EditableField label="Account Number" name="accountNumber" value={formData.paymentDetails.accountNumber || ''} onChange={handlePaymentChange} />
                                            <EditableField label="IFSC Code" name="ifsc" value={formData.paymentDetails.ifsc || ''} onChange={handlePaymentChange} />
                                        </>
                                    )}
                                </>
                             ) : (
                                 <DetailItem 
                                    icon={<Landmark size={16}/>} 
                                    label={partner.paymentDetails.type.toUpperCase()} 
                                    value={partner.paymentDetails.type === 'upi' ? partner.paymentDetails.upiId || 'N/A' : `${partner.paymentDetails.accountNumber} / ${partner.paymentDetails.ifsc}`} 
                                 />
                             )}
                         </div>
                    </section>
                </main>
                
                <footer className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => { setIsEditing(false); setFormData(partner); }} className="px-4 py-2 font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center"><Save size={16} className="mr-2"/>Save Changes</button>
                        </>
                    ) : (
                        <>
                             <button onClick={handleDelete} className="px-4 py-2 font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center"><Trash2 size={16} className="mr-2"/>Delete Partner</button>
                             <button onClick={() => setIsEditing(true)} className="px-4 py-2 font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-lg flex items-center"><Edit size={16} className="mr-2"/>Edit Details</button>
                        </>
                    )}
                </footer>
            </div>
            <style>{`.animate-scale-in { animation: scale-in 0.2s ease-out forwards; } @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
};

export default PartnerDetailModal;
