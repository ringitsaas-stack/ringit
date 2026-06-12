'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';
import AuthVisualPanel from '@/components/common/AuthVisualPanel';

const getClientSafe = () => {
  try {
    return getSupabaseClient();
  } catch {
    console.warn('Supabase Client not active. Running in sandbox mode.');
    return null;
  }
};

// Google "G" SVG logo
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getClientSafe();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleSignup = async () => {
    const supabase = getClientSafe();
    if (!supabase) {
      toast('Google Sign-Up requires Supabase to be configured.', 'error');
      return;
    }
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      toast(error.message, 'error');
      setIsGoogleLoading(false);
    }
    // On success Supabase redirects the browser — no setIsGoogleLoading(false) needed
  };

  // ── Email / Password Signup ─────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = getClientSafe();

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        toast(error.message, 'error');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'user',
          });
        } catch (err) {
          console.error('Profile insert failed:', err);
        }
        toast('Account created successfully!', 'success');
        router.push('/dashboard');
      }
    } else {
      // Sandbox mode
      localStorage.setItem('ringit_sandbox_user', JSON.stringify({ id: 'mock-user-123', email, fullName }));
      toast('Sandbox signup successful.', 'success');
      router.push('/dashboard');
    }
    setIsLoading(false);
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
              Get Started
            </h2>
            <p className="text-left text-muted-foreground text-xs font-medium">
              Welcome to Ringit.ai — Let&apos;s set up your account
            </p>
          </div>

          {/* Google signup button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-card border border-border text-foreground font-semibold text-sm py-2.5 rounded-xl hover:bg-secondary/60 transition-all active:scale-98 disabled:opacity-60 shadow-sm cursor-pointer mb-5 animate-fade-in"
          >
            {isGoogleLoading ? (
              <span className="w-4 h-4 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">or register with email</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-xs text-muted-foreground font-semibold tracking-wide">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-card border border-border rounded-xl p-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground-blue transition-all"
              />
            </div>

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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs text-muted-foreground font-semibold tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                'Create Free Account ⚡'
              )}
            </button>
          </form>

          {/* Redirect to login */}
          <div className="text-center text-xs text-muted-foreground mt-6 font-semibold">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-foreground-blue hover:underline">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
