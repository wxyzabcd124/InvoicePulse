import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, getInvoiceAlerts, InvoiceAlert, getClients } from '../services/invoiceService';
import { getSettings } from '../services/settingsService';
import { getProducts } from '../services/productService';
import { Invoice, CompanySettings, Product, Client } from '../types';

const DashboardPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [alerts, setAlerts] = useState<InvoiceAlert[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(getSettings());

  const fetchData = useCallback(() => {
    setInvoices(getInvoices());
    setAlerts(getInvoiceAlerts());
    setSettings(getSettings());
    setProducts(getProducts());
    setClients(getClients());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Analytics Calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Revenue Metrics
    let todayRevenue = 0;
    let monthRevenue = 0;
    
    invoices.forEach(inv => {
      if (!inv.isPaid) return;
      const invDate = new Date(inv.issueDate);
      
      if (inv.issueDate === todayStr) {
        todayRevenue += inv.total;
      }
      
      if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
        monthRevenue += inv.total;
      }
    });

    // 2. Top Selling Category & Most Used Item
    const itemCounts: Record<string, number> = {};
    const categoryTotals: Record<string, number> = {};

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        // Most used item (by description)
        const name = item.description.split('\n')[0].trim();
        itemCounts[name] = (itemCounts[name] || 0) + item.quantity;

        // Try to find category by matching product name
        const product = products.find(p => name.startsWith(p.name));
        if (product) {
          categoryTotals[product.category] = (categoryTotals[product.category] || 0) + (item.quantity * item.unitPrice);
        }
      });
    });

    const mostUsedItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // 3. Weekly Revenue Chart Data (Last 7 Days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayTotal = invoices
        .filter(inv => inv.isPaid && inv.issueDate === dateKey)
        .reduce((sum, inv) => sum + inv.total, 0);
        
      return { day: dayName, total: dayTotal };
    });

    const maxWeekly = Math.max(...weeklyData.map(d => d.total), 1);

    return {
      todayRevenue,
      monthRevenue,
      mostUsedItem,
      topCategory,
      weeklyData,
      maxWeekly
    };
  }, [invoices, products]);

  const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.isPaid ? invoice.total : 0), 0);
  const outstandingAmount = invoices.reduce((sum, invoice) => sum + (invoice.isPaid ? 0 : invoice.total), 0);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Your business pulse at a glance.</p>
        </div>
        
        <div className="bg-white border border-blue-100 shadow-sm rounded-2xl p-4 flex items-center gap-4 max-w-sm w-full md:w-auto">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="w-12 h-12 object-contain rounded-xl border border-gray-100 p-1" />
          ) : (
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xl">
              {settings.name.charAt(0)}
            </div>
          )}
          <div className="flex-grow overflow-hidden">
            <h3 className="font-black text-gray-900 truncate leading-tight">{settings.name}</h3>
            <p className="text-xs text-gray-500 truncate">{settings.email}</p>
          </div>
          <Link to="/settings" className="text-blue-600 hover:text-blue-800 p-2" title="Edit Profile">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Today's Revenue</h2>
          <p className="text-3xl font-black text-blue-600">{settings.currency}{analytics.todayRevenue.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${analytics.todayRevenue > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Daily Pulse</span>
          </div>
        </div>
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">This Month</h2>
          <p className="text-3xl font-black text-gray-900">{settings.currency}{analytics.monthRevenue.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-green-600 mt-2 uppercase tracking-tight">Earnings Collected</p>
        </div>
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue</h2>
          <p className="text-3xl font-black text-green-600">{settings.currency}{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Lifetime Earnings</p>
        </div>
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Outstanding</h2>
          <p className="text-3xl font-black text-amber-600">{settings.currency}{outstandingAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase">Pending Payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Revenue Weekly Pulse</h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Past 7 Days</span>
            </div>
            <div className="p-8">
              <div className="relative h-64 flex items-end justify-between gap-4">
                {analytics.weeklyData.map((data, idx) => {
                  const heightPercent = (data.total / analytics.maxWeekly) * 100;
                  return (
                    <div key={idx} className="flex-grow flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                        {settings.currency}{data.total.toLocaleString()}
                      </div>
                      
                      {/* Bar */}
                      <div 
                        className="w-full max-w-[40px] bg-blue-100 rounded-t-xl group-hover:bg-blue-600 transition-all duration-500 overflow-hidden relative"
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                      </div>
                      <span className="mt-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">{data.day}</span>
                    </div>
                  );
                })}
                {/* Horizontal Grid lines (visual only) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                   <div className="border-b border-gray-200 w-full h-0"></div>
                   <div className="border-b border-gray-200 w-full h-0"></div>
                   <div className="border-b border-gray-200 w-full h-0"></div>
                   <div className="border-b border-gray-200 w-full h-0"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Category</h3>
                <p className="font-black text-gray-900 truncate w-full">{analytics.topCategory}</p>
             </div>
             <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Most Used Item</h3>
                <p className="font-black text-gray-900 truncate w-full">{analytics.mostUsedItem}</p>
             </div>
             <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Customers</h3>
                <p className="font-black text-gray-900">{clients.length}</p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 shadow-2xl shadow-blue-200 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>
            <h2 className="text-2xl font-black mb-6 tracking-tight relative z-10">Pulse Actions</h2>
            <div className="space-y-4 relative z-10">
              <Link to="/invoices/new" className="block bg-white text-blue-600 hover:bg-blue-50 font-black py-4 px-4 rounded-2xl transition-all duration-200 text-center shadow-lg transform hover:-translate-y-1 active:translate-y-0">
                Create New Invoice
              </Link>
              <Link to="/invoices" className="block bg-blue-500 hover:bg-blue-400 text-white font-black py-4 px-4 rounded-2xl transition-all duration-200 text-center border border-blue-400">
                Invoices Feed
              </Link>
              <Link to="/clients" className="block bg-blue-500 hover:bg-blue-400 text-white font-black py-4 px-4 rounded-2xl transition-all duration-200 text-center border border-blue-400">
                Client Base
              </Link>
            </div>
          </div>

          {/* Action Center - Simplified for Dashboard Sidebar */}
          {alerts.length > 0 && (
            <div className="bg-white border border-red-100 shadow-xl rounded-3xl overflow-hidden">
              <div className="px-6 py-4 bg-red-50/50 border-b border-red-100 flex justify-between items-center">
                <h2 className="text-[10px] font-black text-red-900 uppercase tracking-widest">Priority Alerts</h2>
                <span className="text-[9px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full">{alerts.length}</span>
              </div>
              <div className="p-2 space-y-1">
                {alerts.slice(0, 4).map((alert) => (
                  <Link 
                    key={alert.invoice.id} 
                    to="/invoices" 
                    className="flex items-center gap-3 p-3 hover:bg-red-50/30 rounded-xl transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.type === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <p className="text-[11px] font-black text-gray-900 truncate">Inv #{alert.invoice.invoiceNumber}</p>
                      <p className="text-[9px] font-bold text-gray-400">{alert.type === 'overdue' ? 'Overdue' : 'Due Soon'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-gray-900">{settings.currency}{alert.invoice.total.toFixed(0)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;