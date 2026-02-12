import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1800); // 1.8 seconds for a smooth feel

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <style>
        {`
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.2; }
            100% { transform: scale(0.8); opacity: 0.5; }
          }
          @keyframes slide-up {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-pulse-ring {
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .animate-slide-up {
            animation: slide-up 0.8s ease-out forwards;
          }
        `}
      </style>
      
      <div className="relative">
        {/* Pulsing background rings */}
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse-ring"></div>
        <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse-ring" style={{ animationDelay: '1s' }}></div>
        
        {/* Logo Icon */}
        <div className="relative bg-blue-600 p-6 rounded-[2rem] shadow-2xl shadow-blue-200 animate-slide-up">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
          Invoice<span className="text-blue-600">Pulse</span>
        </h1>
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      <div className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 opacity-60">
        Local & Secure Billing
      </div>
    </div>
  );
};

export default SplashScreen;