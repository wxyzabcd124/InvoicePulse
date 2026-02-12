import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import InvoiceForm from './components/InvoiceForm';
import NotificationCenter from './components/NotificationCenter';
import { getClients, addInvoice, getInvoiceAlerts, InvoiceAlert } from './services/invoiceService';

// Navigation component to handle location-based logic
const Navigation = () => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState<InvoiceAlert[]>([]);

  // Periodically check for alerts
  useEffect(() => {
    setAlerts(getInvoiceAlerts());
    const interval = setInterval(() => {
      setAlerts(getInvoiceAlerts());
    }, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Hide navigation on splash and landing pages
  const hideNav = location.pathname === '/' || location.pathname === '/welcome';

  if (hideNav) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <NavLink to="/dashboard" className="flex items-center gap-2 text-2xl font-black text-blue-600 mb-4 sm:mb-0">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          InvoicePulse
        </NavLink>
        <div className="flex items-center space-x-6 overflow-x-auto max-w-full no-scrollbar pb-1 sm:pb-0 relative">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            Invoices
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            Clients
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            Settings
          </NavLink>

          {/* Notification Bell */}
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
          
          <NotificationCenter 
            isOpen={isNotifOpen} 
            onClose={() => setIsNotifOpen(false)} 
            alerts={alerts}
          />
        </div>
      </nav>
    </header>
  );
};

// Wrapper for new invoice to allow programmatic navigation
const NewInvoiceWrapper = () => {
  const navigate = useNavigate();
  const clients = getClients();

  const handleSubmit = (data: any) => {
    addInvoice(data);
    navigate('/invoices');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Create New Invoice</h1>
      <InvoiceForm
        isOpen={true}
        onClose={() => navigate('/invoices')}
        onSubmit={handleSubmit}
        clients={clients}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navigation />

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<NewInvoiceWrapper />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* Footer hidden on splash */}
        <FooterWrapper />
      </div>
    </Router>
  );
}

const FooterWrapper = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <footer className="bg-white border-t border-gray-100 text-gray-400 p-8 text-center text-xs mt-auto">
      <div className="flex flex-col items-center gap-4">
         <div className="flex gap-6 mb-2">
            <NavLink to="/welcome" className="hover:text-gray-900 transition-colors">About</NavLink>
            <NavLink to="/dashboard" className="hover:text-gray-900 transition-colors">App</NavLink>
            <NavLink to="/settings" className="hover:text-gray-900 transition-colors">Settings</NavLink>
         </div>
         <div>
            <p className="mb-2 font-black uppercase tracking-[0.2em] text-gray-600">InvoicePulse</p>
            <p>&copy; {new Date().getFullYear()} All data stored locally in your browser.</p>
         </div>
      </div>
    </footer>
  );
};

export default App;