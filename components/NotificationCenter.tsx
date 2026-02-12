import React from 'react';
import { Link } from 'react-router-dom';
import { InvoiceAlert } from '../services/invoiceService';
import { getSettings } from '../services/settingsService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: InvoiceAlert[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, alerts }) => {
  if (!isOpen) return null;
  const settings = getSettings();

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[2px]" 
        onClick={onClose}
      />
      <div className="fixed top-20 right-4 w-full max-w-sm z-[70] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Notification Center</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
          {alerts.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">No overdue or upcoming payments.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {alerts.map((alert) => (
                <Link 
                  key={alert.invoice.id} 
                  to="/invoices"
                  onClick={onClose}
                  className="block p-5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alert.type === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {alert.type === 'overdue' ? 'Overdue' : `Due in ${alert.daysLeft} days`}
                    </span>
                    <span className="text-xs font-black text-gray-900">{settings.currency}{alert.invoice.total.toFixed(2)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Invoice #{alert.invoice.invoiceNumber}</h4>
                  <p className="text-xs text-gray-500 mt-1">Due Date: {alert.invoice.dueDate}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <Link 
            to="/invoices" 
            onClick={onClose}
            className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
          >
            Manage All Invoices
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;