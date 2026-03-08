
import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { AdminSettings } from '../types';
import { DEFAULT_ADMIN_SETTINGS } from '../constants';

interface SettingsContextType {
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fix: use DEFAULT_ADMIN_SETTINGS directly as it now satisfies AdminSettings interface
  const [settings, setSettings] = useLocalStorage<AdminSettings>(
    'rannaghar_settings',
    DEFAULT_ADMIN_SETTINGS
  );

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
