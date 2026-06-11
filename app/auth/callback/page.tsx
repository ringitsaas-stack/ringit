'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/shared/lib/supabase-client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing sign-in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient();

        // Supabase JS v2 automatically reads the #access_token hash fragment
        // and establishes the session when getSession() is called.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error.message);
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => router.push('/auth/login?error=oauth_failed'), 1500);
          return;
        }

        if (!session?.user) {
          // Session not ready yet — wait for onAuthStateChange to fire
          setStatus('Verifying session...');
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, sess) => {
              if (event === 'SIGNED_IN' && sess?.user) {
                subscription.unsubscribe();
                await redirectUser(sess.user.id, router, setStatus);
              } else if (event === 'SIGNED_OUT') {
                subscription.unsubscribe();
                router.push('/auth/login');
              }
            }
          );
          return;
        }

        await redirectUser(session.user.id, router, setStatus);
      } catch (err) {
        console.error('Callback handler crashed:', err);
        setStatus('Something went wrong. Redirecting...');
        setTimeout(() => router.push('/auth/login'), 1500);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-5 font-sans">
      {/* Spinner */}
      <div className="w-12 h-12 rounded-full border-4 border-border border-t-emerald-500 animate-spin" />

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-extrabold text-xs shadow-md">
          R
        </div>
        <span className=" text-base text-foreground">
          Ringit<span className="text-emerald-500">.ai</span>
        </span>
      </div>

      {/* Status text */}
      <p className="text-muted-foreground text-sm font-medium">{status}</p>
    </div>
  );
}

// ─── Helper: redirect to dashboard or onboarding ─────────────────────────────
async function redirectUser(
  userId: string,
  router: ReturnType<typeof useRouter>,
  setStatus: (s: string) => void
) {
  setStatus('Checking your workspace...');
  try {
    const res = await fetch(`/api/agents?userId=${userId}`);
    const data = await res.json();
    if (data.success && data.agents?.length > 0) {
      setStatus('Redirecting to your dashboard...');
      router.push('/dashboard');
    } else {
      setStatus('Setting up your workspace...');
      router.push('/onboarding');
    }
  } catch {
    // Default to onboarding on any error
    router.push('/onboarding');
  }
}
