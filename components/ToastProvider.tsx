'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { toast as sonnerToast, Toaster } from 'sonner';

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
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
    const processedMessage = type === 'error' ? cleanErrorMessage(message) : message;
    if (type === 'success') {
      sonnerToast(processedMessage, {
        style: {
          background: '#FFFFFF',
          color: '#0D0D0D',
          border: '1px solid #E4E4E7',
        },
      });
    } else if (type === 'error') {
      sonnerToast(processedMessage, {
        style: {
          background: '#FEF2F2',
          color: '#EF4444',
          border: '1px solid #FEE2E2',
        },
      });
    } else {
      sonnerToast(processedMessage, {
        style: {
          background: '#0D0D0D',
          color: '#FFFFFF',
          border: '1px solid #27272A',
        },
      });
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
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
