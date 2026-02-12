import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-bounce">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Beta Version 1.2
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">
          Invoice<span className="text-blue-600">Pulse</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
          The elegant, local-first billing solution for modern professionals. 
          Manage clients, catalog products, and generate invoices in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            size="lg" 
            className="rounded-2xl px-12 py-5 text-xl shadow-2xl shadow-blue-200 hover:scale-105 transition-transform"
            onClick={() => navigate('/dashboard')}
          >
            Launch Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl px-12 py-5 text-xl border-gray-200 hover:bg-gray-50"
            onClick={() => navigate('/invoices/new')}
          >
            New Invoice
          </Button>
        </div>

        {/* Mock Invoice Preview */}
        <div className="mt-20 w-full max-w-4xl bg-white rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-700">
           <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-6 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
           </div>
           <div className="p-8 text-left">
              <div className="flex justify-between mb-8">
                 <div className="w-32 h-8 bg-gray-100 rounded-lg"></div>
                 <div className="w-24 h-8 bg-blue-50 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                 <div className="w-full h-4 bg-gray-50 rounded"></div>
                 <div className="w-5/6 h-4 bg-gray-50 rounded"></div>
                 <div className="w-4/6 h-4 bg-gray-50 rounded"></div>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between">
                 <div className="w-32 h-10 bg-gray-100 rounded-lg"></div>
                 <div className="w-40 h-10 bg-blue-600 rounded-lg opacity-20"></div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Swift Billing</h3>
              <p className="text-gray-500 leading-relaxed">Generate professional PDFs and print-ready invoices in seconds with our optimized workflow.</p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Client CRM</h3>
              <p className="text-gray-500 leading-relaxed">Keep track of your business relationships with a simple, integrated client management system.</p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Product Catalog</h3>
              <p className="text-gray-500 leading-relaxed">Store your services and goods with custom categories and photos for instant selection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Pledge */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Your Data, Your Control</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            InvoicePulse operates entirely within your browser. We never see your financial data, client lists, or company secrets. It's stored safely on your device.
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04accurately 11.952 11.952 0 00-1.022 7.711c.33 4.412 3.267 8.131 7.471 9.542a12.01 12.01 0 004.338 0c4.204-1.411 7.141-5.13 7.471-9.542a11.952 11.952 0 00-1.022-7.711z" />
            </svg>
            100% Client-Side Privacy
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;