import React, { createContext, useContext, useState, useEffect } from 'react';
import { WarningSettings, defaultWarningSettings, warningSettingsSchema } from '@shared/warning-settings';

interface WarningSettingsContextType {
  settings: WarningSettings;
  updateSettings: (newSettings: WarningSettings) => void;
  resetToDefaults: () => void;
  isLoading: boolean;
}

const WarningSettingsContext = createContext<WarningSettingsContextType | undefined>(undefined);

export function WarningSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WarningSettings>(defaultWarningSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('vapi-warning-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Validate against schema to ensure compatibility
        const validated = warningSettingsSchema.parse(parsed);
        setSettings(validated);
      }
    } catch (error) {
      console.warn('Failed to load warning settings, using defaults:', error);
      // If parsing fails, reset to defaults
      localStorage.removeItem('vapi-warning-settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: WarningSettings) => {
    try {
      // Validate settings before saving
      const validated = warningSettingsSchema.parse(newSettings);
      setSettings(validated);
      localStorage.setItem('vapi-warning-settings', JSON.stringify(validated));
    } catch (error) {
      console.error('Invalid warning settings:', error);
      throw new Error('Invalid settings configuration');
    }
  };

  // Reset to default settings
  const resetToDefaults = () => {
    setSettings(defaultWarningSettings);
    localStorage.setItem('vapi-warning-settings', JSON.stringify(defaultWarningSettings));
  };

  return (
    <WarningSettingsContext.Provider value={{
      settings,
      updateSettings,
      resetToDefaults,
      isLoading,
    }}>
      {children}
    </WarningSettingsContext.Provider>
  );
}

export function useWarningSettings() {
  const context = useContext(WarningSettingsContext);
  if (context === undefined) {
    throw new Error('useWarningSettings must be used within a WarningSettingsProvider');
  }
  return context;
}