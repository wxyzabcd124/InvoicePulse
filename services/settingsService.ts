import { CompanySettings } from '../types';

const SETTINGS_STORAGE_KEY = 'invoicePulseSettings';

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'Your Company Name',
  email: 'hello@yourcompany.com',
  address: '123 Business Way, Suite 100\nCity, State, Zip',
  phone: '(555) 000-0000',
  currency: '$',
};

export const getSettings = (): CompanySettings => {
  const settingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
  return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: CompanySettings): void => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};
