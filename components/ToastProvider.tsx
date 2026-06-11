'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const cleanErrorMessage = (rawError: string): string => {
    if (!rawError) return 'An unexpected error occurred. Please try again.';
    if (
      rawError.includes('phone_numbers_twilio_phone_sid_key') ||
      rawError.includes('phone_numbers_twilio_phone_number_key') ||
      rawError.includes('duplicate key value violates unique constraint')
    ) {
      return 'This Twilio phone number is already linked to another active receptionist agent.';
    }
    if (rawError.includes('KYC') || rawError.includes('KYC process') || rawError.includes('create-phone-number: 403')) {
      return 'No valid KYC profile found. Please complete your verification inside the Retell dashboard first.';
    }
    if (rawError.includes('RETELL_API_KEY') || rawError.includes('401') || rawError.includes('Unauthorized')) {
      return 'Authentication failed. Please verify your Retell API key settings.';
    }
    if (rawError.includes('Plan limit reached') || rawError.includes('max_agents')) {
      return 'Maximum agent limit reached for your active subscription plan. Please upgrade to add more.';
    }
    const cleaned = rawError
      .replace(/^Database error [^:]+:\s*/i, '')
      .replace(/^Error:\s*/i, '')
      .replace(/^Retell API error [^:]+:\s*/i, '')
      .trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const toast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    const processedMessage = type === 'error' ? cleanErrorMessage(message) : message;
    setToasts((prev) => [...prev, { id, message: processedMessage, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 translate-y-0 opacity-100 animate-fade-in ${
              t.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : t.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
            }`}
          >
            <span className="text-base">
              {t.type === 'success' ? '⚡' : t.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="text-xs font-semibold leading-normal">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
