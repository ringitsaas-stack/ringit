'use client';

import React, { useState } from 'react';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

// Handle Supabase Auth Client Initialization gracefully
const getClientSafe = () => {
  try {
    return getSupabaseClient();
  } catch {
    console.warn('Supabase Client not active (missing env vars). Running in sandbox mode.');
    return null;
  }
};

export default function ForgotPasswordPage() {
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = getClientSafe();

    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (error) {
        toast(error.message, 'error');
      } else {
        toast('Password recovery instructions emailed successfully!', 'success');
      }
    } else {
      // Sandbox mode mock
      toast('Sandbox mock: Password recovery link dispatched.', 'success');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 items-center justify-center p-6 relative">
      
      {/* Header / Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center  shadow-md">
            R
          </div>
          <span className="font-semibold text-lg text-foreground">Ringit<span className="text-emerald-500 ">.ai</span></span>
        </Link>
      </div>

     

      {/* Main Password Reset Card */}
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl space-y-6 shadow-2xl animate-fade-in border border-border transition-colors">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground">Reset your password</h1>
          <p className="text-muted-foreground text-xs font-medium">
            Enter your email to recover your credentials.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px]  text-muted-foreground">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
          >
            {isLoading ? (
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></span>
            ) : (
              'Reset Password ⚡'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Remember your credentials?{' '}
          <Link href="/auth/login" className="text-emerald-500  hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
