
import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { User, Address } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setPrimaryAddress: (addressId: string) => void;
  // Admin Auth
  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  sendPasswordResetOtp: (email: string) => Promise<string>;
  resetAdminPassword: (otp: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('rannaghar_user', null);
  const [isAdmin, setIsAdmin] = useLocalStorage<boolean>('rannaghar_isAdmin', false);
  const [adminPassword, setAdminPassword] = useLocalStorage<string>('rannaghar_admin_pwd', 'admin123');


  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };
  
  const addAddress = (address: Omit<Address, 'id'>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const newAddress = { ...address, id: `addr-${Date.now()}` };
        return { ...prevUser, addresses: [...prevUser.addresses, newAddress] };
    });
  };

  const updateAddress = (updatedAddress: Address) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedAddresses = prevUser.addresses.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr);
        return { ...prevUser, addresses: updatedAddresses };
    });
  };

  const deleteAddress = (addressId: string) => {
    setUser(prevUser => {
        if (!prevUser || prevUser.addresses.length <= 1) {
            alert("You must have at least one address.");
            return prevUser;
        };
        if (prevUser.primaryAddressId === addressId) {
            alert("You cannot delete your primary address.");
            return prevUser;
        }
        return { ...prevUser, addresses: prevUser.addresses.filter(addr => addr.id !== addressId) };
    });
  };

  const setPrimaryAddress = (addressId: string) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, primaryAddressId: addressId };
    });
  };
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    if (email.toLowerCase() === 'rannaghardigha@gmail.com' && password === adminPassword) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
  };

  const sendPasswordResetOtp = async (email: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        if (email.toLowerCase() === 'rannaghardigha@gmail.com') {
          const mockOtp = "654321";
          resolve(mockOtp);
        } else {
          reject(new Error("Email not found."));
        }
      }, 1000);
    });
  };

  const resetAdminPassword = async (otp: string, newPassword: string): Promise<boolean> => {
     return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
             if (otp === "654321") {
                setAdminPassword(newPassword);
                resolve(true);
            } else {
                resolve(false);
            }
        }, 1000);
     });
  };


  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, addAddress, updateAddress, deleteAddress, setPrimaryAddress, isAdmin, adminLogin, adminLogout, sendPasswordResetOtp, resetAdminPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
