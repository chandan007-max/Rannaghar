
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Address, Geolocation as GeoType } from '../types';
import { User, Phone, MapPin, Home, Plus, Edit, Trash2, Star, LogOut, Loader2, CheckCircle, AlertCircle, RefreshCcw, History } from 'lucide-react';

interface AccountScreenProps {
  onNavigateToOrders?: () => void;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ onNavigateToOrders }) => {
  const { user, logout, addAddress, updateAddress, deleteAddress, setPrimaryAddress } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">My Profile</h2>
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center text-gray-700">
            <User className="h-5 w-5 mr-3 text-amber-600" />
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Phone className="h-5 w-5 mr-3 text-amber-600" />
            <span className="font-medium">{user.phone}</span>
          </div>
        </div>
      </div>

      {onNavigateToOrders && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">My Orders</h2>
          <button 
            onClick={onNavigateToOrders}
            className="w-full bg-white p-5 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center text-gray-700">
              <History className="h-5 w-5 mr-3 text-amber-600" />
              <span className="font-medium">View Order History</span>
            </div>
            <span className="text-gray-400">&rarr;</span>
          </button>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-amber-500 pl-3">My Addresses</h2>
            <button onClick={() => setIsAdding(!isAdding)} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                <Plus className="h-4 w-4 mr-1" /> {isAdding ? 'Cancel' : 'Add New'}
            </button>
        </div>
         {isAdding && <AddressForm onSave={() => setIsAdding(false)} />}
        <div className="space-y-4">
          {user.addresses.map(address => (
            <AddressCard 
                key={address.id} 
                address={address} 
                isPrimary={user.primaryAddressId === address.id}
                onSetPrimary={() => setPrimaryAddress(address.id)}
                onDelete={() => deleteAddress(address.id)}
            />
          ))}
        </div>
      </div>
        <div className="pt-4">
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

const AddressForm: React.FC<{ onSave: () => void, address?: Address }> = ({ onSave, address }) => {
    const { addAddress, updateAddress } = useAuth();
    const [label, setLabel] = useState(address?.label || 'Home');
    const [fullAddress, setFullAddress] = useState(address?.fullAddress || '');
    const [location, setLocation] = useState<GeoType | null>(address?.location || null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported.');
            return;
        }

        setIsGettingLocation(true);
        setLocationError('');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                setIsGettingLocation(false);
            },
            (error) => {
                let errorMessage = 'Error fetching location.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location access denied. Check your browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = 'Location request timed out.';
                }
                setLocationError(errorMessage);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullAddress || !location || !label) {
            alert("Please fill all fields and pin location.");
            return;
        }
        if (address) {
            updateAddress({ ...address, label, fullAddress, location });
        } else {
            addAddress({ label, fullAddress, location });
        }
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm mb-4 space-y-4 border border-indigo-200">
            <input type="text" placeholder="Label (e.g., Home, Work)" value={label} onChange={e => setLabel(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
            <textarea placeholder="Full Address" value={fullAddress} onChange={e => setFullAddress(e.target.value)} required rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"></textarea>
            
            <div className="space-y-2">
                <button type="button" onClick={handleGetLocation} disabled={isGettingLocation || !!location} className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${location ? 'bg-teal-600' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:bg-indigo-300`}>
                    {isGettingLocation ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : location ? <CheckCircle className="h-5 w-5 mr-2" /> : <MapPin className="h-5 w-5 mr-2" />}
                    {isGettingLocation ? 'Fetching...' : location ? 'Location Pinned!' : 'Pin Location'}
                </button>
                {locationError && (
                    <div className="flex items-start gap-2 text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100">
                        <AlertCircle size={14} className="mt-0.5" />
                        <div className="flex-grow">
                             <p className="text-[10px] font-bold">{locationError}</p>
                             <button type="button" onClick={handleGetLocation} className="text-[9px] uppercase font-black tracking-widest flex items-center gap-1 mt-1">
                                <RefreshCcw size={10} /> Retry
                             </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-2">
                 <button type="button" onClick={onSave} className="py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="py-2 px-4 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700">Save Address</button>
            </div>
        </form>
    );
};

const AddressCard: React.FC<{address: Address, isPrimary: boolean, onSetPrimary: () => void, onDelete: () => void}> = ({ address, isPrimary, onSetPrimary, onDelete }) => {
    return (
         <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center mb-1">
                        {isPrimary && <Star className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" />}
                        <p className="font-bold text-gray-800">{address.label}</p>
                    </div>
                    <p className="text-gray-600 text-sm">{address.fullAddress}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                    {!isPrimary && <button onClick={onDelete} className="hover:text-red-600"><Trash2 size={18}/></button>}
                </div>
            </div>
             {!isPrimary && (
                <button onClick={onSetPrimary} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-3">
                    Set as Primary
                </button>
            )}
        </div>
    );
}

export default AccountScreen;
