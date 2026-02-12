import React, { useState, useEffect } from 'react';
import { CompanySettings } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>(getSettings());
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({ ...prev, logo: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Profile</h1>
        <p className="text-gray-500 mt-1">Configure your company identity for professional invoices.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className={`w-40 h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center overflow-hidden mb-4 bg-gray-50 transition-all duration-300 ${settings.logo ? 'border-blue-100' : 'border-gray-300 hover:border-blue-400'}`}>
              {settings.logo ? (
                <img src={settings.logo} alt="Company Logo" className="max-w-full max-h-full object-contain p-4" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">No logo uploaded</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-center">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {settings.logo ? 'Change Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              
              {settings.logo && (
                <button 
                  type="button" 
                  onClick={removeLogo}
                  className="bg-white border border-gray-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Input 
            id="name" 
            label="Business Name" 
            value={settings.name} 
            onChange={handleChange} 
            required 
            placeholder="E.g. Acme Corp"
            className="rounded-xl"
          />
          
          <Input 
            id="email" 
            label="Business Email" 
            type="email" 
            value={settings.email} 
            onChange={handleChange} 
            required 
            placeholder="billing@yourcompany.com"
            className="rounded-xl"
          />
          
          <div>
            <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide text-[11px]">Business Address</label>
            <textarea
              id="address"
              value={settings.address}
              onChange={handleChange}
              rows={3}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
              required
              placeholder="123 Business Lane&#10;City, State 12345"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              id="phone" 
              label="Business Phone" 
              value={settings.phone} 
              onChange={handleChange} 
              required 
              placeholder="+1 (555) 000-0000"
              className="rounded-xl"
            />
            <Input 
              id="currency" 
              label="Currency Symbol" 
              value={settings.currency} 
              onChange={handleChange} 
              required 
              maxLength={3} 
              placeholder="$"
              className="rounded-xl font-bold text-center text-lg"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <Button type="submit" size="lg" className="rounded-xl shadow-lg px-8">
            Save Changes
          </Button>
          {successMessage && (
            <span className="flex items-center gap-2 text-green-600 font-bold text-sm animate-bounce">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </span>
          )}
        </div>
      </form>

      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Setup Information</h4>
          <p className="text-blue-800 text-sm mt-1 leading-relaxed">
            These details will appear at the top of every invoice you generate. Make sure your address includes all necessary tax information if required in your jurisdiction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;