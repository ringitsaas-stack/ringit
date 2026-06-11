'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

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
        router.push('/onboarding');
      }
    } else {
      // Sandbox mode
      localStorage.setItem('ringit_sandbox_user', JSON.stringify({ id: 'mock-user-123', email, fullName }));
      toast('Sandbox signup successful.', 'success');
      router.push('/onboarding');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 items-center justify-center p-6 relative">

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">R</div>
          <span className=" text-lg text-foreground">Ringit<span className="text-emerald-500">.ai</span></span>
        </Link>
      </div>

     
      {/* Card */}
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl space-y-6 shadow-2xl animate-fade-in border border-border">

        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-extrabold text-foreground">Create your account</h1>
          <p className="text-muted-foreground text-xs font-medium">
            Launch secure automated voice receptionists in seconds.
          </p>
        </div>

        {/* ── Google Sign Up Button ── */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-card border border-border text-foreground font-semibold text-sm py-3 rounded-xl hover:bg-secondary/60 transition-all active:scale-98 disabled:opacity-60 shadow-sm"
        >
          {isGoogleLoading ? (
            <span className="w-4 h-4 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px]  text-muted-foreground uppercase tracking-wider">or sign up with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── Email Form ── */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px]  text-muted-foreground">Full Name</label>
            <input
              type="text"
              required
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px]  text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground  text-sm py-3 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              'Create Free Account ⚡'
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-emerald-500  hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
