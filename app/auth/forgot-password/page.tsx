'use client';

import React, { useState } from 'react';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';
import AuthVisualPanel from '@/components/common/AuthVisualPanel';

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

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetUrl: `${window.location.origin}/auth/login`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.sandbox) {
          toast('Sandbox Mock: Recovery link printed to console.', 'success');
        } else {
          toast('Password recovery instructions emailed successfully via Resend!', 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to dispatch email');
      }
    } catch (err: any) {
      toast(err.message || 'An error occurred during password reset dispatch.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 items-center justify-center p-4 md:p-6 relative">
      
      {/* Home Redirect logo link */}
      <div className="absolute top-8 left-8 z-30">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">R</div>
          <span className="text-lg text-foreground font-semibold">Ringit<span className="text-foreground-blue">.ai</span></span>
        </Link>
      </div>

      {/* Main 3D Panel Container */}
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-3xl border border-border/80 bg-white">
        
        {/* Visual elements from full-screen-signup.tsx */}
        <div className="w-full h-full z-2 absolute bg-linear-to-t from-transparent to-black pointer-events-none"></div>
        <div className="flex absolute z-2 overflow-hidden backdrop-blur-2xl pointer-events-none">
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
        </div>
        <div className="w-[15rem] h-[15rem] bg-foreground-blue/70 absolute z-1 rounded-full bottom-0 left-0 blur-xl"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0 left-10 opacity-30 blur-lg"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0 left-20 opacity-30 blur-lg"></div>

        {/* Left Visual Column */}
        <AuthVisualPanel />

        {/* Right Form Column */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white z-20 text-foreground justify-center">
          <div className="flex flex-col items-start mb-6">
            <h2 className="text-3xl font-semibold mb-2 tracking-tight text-foreground">
              Reset Password
            </h2>
            <p className="text-left text-muted-foreground text-xs font-medium">
              Enter your email to recover your credentials.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs text-muted-foreground font-semibold tracking-wide">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card border border-border rounded-xl p-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground-blue transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground-blue text-white hover:bg-foreground-blue/90 text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer font-bold mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : (
                'Reset Password ⚡'
              )}
            </button>
          </form>

          {/* Redirect to login */}
          <div className="text-center text-xs text-muted-foreground mt-6 font-semibold">
            Remember your credentials?{' '}
            <Link href="/auth/login" className="text-foreground-blue hover:underline">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
