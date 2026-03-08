
import React from 'react';
import { useDeliveryPartner } from '../../context/DeliveryPartnerContext';
import { User, Phone, Star, Shield, FileText, Banknote, HelpCircle, LogOut } from 'lucide-react';
import StarRating from '../../components/StarRating';

const ProfileScreen: React.FC = () => {
    const { partner, logout } = useDeliveryPartner();

    if (!partner) return null;

    const profileItems = [
        { icon: FileText, label: 'Documents', value: 'Verified' },
        { icon: Banknote, label: 'Bank Details', value: '********' },
        { icon: Shield, label: 'Insurance', value: 'Active' },
        { icon: HelpCircle, label: 'Support', value: 'Contact Us' },
    ];

    return (
         <div className="p-4 sm:p-6 bg-gray-100 min-h-full">
            <header className="flex items-center space-x-4 pb-6 border-b mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{partner.name}</h1>
                    <p className="text-gray-500">{partner.phone}</p>
                    <div className="flex items-center mt-1">
                        <StarRating rating={partner.rating} size={18} />
                        <span className="ml-2 text-sm font-semibold text-gray-700">{partner.rating.toFixed(1)}</span>
                    </div>
                </div>
            </header>
            
             <div className="bg-white rounded-xl shadow-sm">
                {profileItems.map((item, index) => (
                    <div key={item.label} className={`flex justify-between items-center p-4 ${index < profileItems.length - 1 ? 'border-b' : ''}`}>
                        <div className="flex items-center">
                            <item.icon className="w-5 h-5 mr-4 text-gray-500" />
                            <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-gray-500 text-sm">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <button
                    onClick={logout}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;
