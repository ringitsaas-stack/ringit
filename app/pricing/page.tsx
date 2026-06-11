'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';

const getClientSafe = () => {
  try { return getSupabaseClient(); } catch { return null; }
};

interface SubscriptionInfo {
  plan: string;
  status: string;
}

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('starter');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndPlan = async () => {
      const supabase = getClientSafe();
      let activeUserId: string | null = null;

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          activeUserId = session.user.id;
          setUserId(activeUserId);
        }
      } else {
        const sandboxUser = localStorage.getItem('ringit_sandbox_user');
        if (sandboxUser) {
          const parsed = JSON.parse(sandboxUser);
          activeUserId = parsed.id;
          setUserId(activeUserId);
        }
      }

      if (activeUserId && supabase) {
        const { data } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', activeUserId)
          .maybeSingle();
        
        if (data) {
          setCurrentPlan(data.plan || 'starter');
        }
      }
    };

    fetchUserAndPlan();
  }, []);

  const handleUpgrade = async (planKey: string) => {
    if (!userId) {
      toast('Please sign in or create an account to subscribe.', 'error');
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    if (planKey === 'starter' && currentPlan === 'starter') {
      toast('You are already on the Starter plan.', 'info');
      return;
    }

    setIsLoading(planKey);

    // Map planKey & isYearly to priceIds (using fallback mock values if not defined in env)
    let priceId = '';
    if (planKey === 'starter') {
      priceId = isYearly 
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly') 
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly');
    } else if (planKey === 'pro') {
      priceId = isYearly 
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly') 
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly');
    } else if (planKey === 'agency') {
      priceId = isYearly 
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY || 'price_agency_yearly') 
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY || 'price_agency_monthly');
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: `${window.location.origin}/dashboard?upgrade_success=true`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initiate checkout session');

      if (data.url) {
        toast(`Redirecting to upgrade checkout...`, 'info');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error(err);
      toast(err instanceof Error ? err.message : 'Checkout initiation failed.', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const TIERS = [
    {
      key: 'starter',
      name: 'Starter',
      priceMonthly: 49,
      priceYearly: 490, // 2 months free ($49 * 10)
      desc: 'Perfect for local clinics and single reception lines.',
      limits: [
        '1 Active AI Receptionist agent',
        '100 monthly call minutes included',
        'Standard GPT-4o-mini engine',
      ],
      features: [
        { label: 'Twilio Number Procurement', checked: true },
        { label: 'Voice Cloning Studio', checked: false },
        { label: 'CRM / Google Sheets Webhooks', checked: false },
        { label: 'Advanced Reasoning Models', checked: false },
      ],
    },
    {
      key: 'pro',
      name: 'Pro',
      priceMonthly: 99,
      priceYearly: 990, // 2 months free ($99 * 10)
      desc: 'Scales with growing clinics and offices.',
      limits: [
        '5 Active AI Receptionist agents',
        '500 monthly call minutes included',
        'Use standard or advanced LLMs',
      ],
      features: [
        { label: 'Twilio Number Procurement', checked: true },
        { label: 'Voice Cloning Studio', checked: true },
        { label: 'CRM / Google Sheets Webhooks', checked: true },
        { label: 'Advanced Reasoning Models', checked: true },
      ],
      popular: true,
    },
    {
      key: 'agency',
      name: 'Agency',
      priceMonthly: 249,
      priceYearly: 2490, // 2 months free ($249 * 10)
      desc: 'For multi-location practices and software managers.',
      limits: [
        '20 Active AI Receptionist agents',
        '2,000 monthly call minutes included',
        'Dedicated API access & webhook sync',
      ],
      features: [
        { label: 'Twilio Number Procurement', checked: true },
        { label: 'Voice Cloning Studio', checked: true },
        { label: 'CRM / Google Sheets Webhooks', checked: true },
        { label: 'Advanced Reasoning Models', checked: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      
      {/* ── Nav Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md py-4 px-6 md:px-10 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-extrabold text-sm group-hover:scale-105 transition-transform">R</div>
          <span className=" text-lg">Ringit<span className="text-emerald-500">.ai</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
       
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
        <div className="text-center space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400  text-[10px] px-3.5 py-1 rounded-full border border-emerald-500/20 tracking-wider uppercase">
            Flexible Plans
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Upgrade your receptionist lines, unlock custom voice cloning, and connect your leads directly to your CRM tools.
          </p>
        </div>

        {/* ── Toggle Switch ── */}
        <div className="mt-10 flex items-center justify-center gap-4 p-1.5 rounded-xl border border-border bg-card shadow-sm">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-1.5 rounded-lg text-xs  transition-all ${!isYearly ? 'bg-foreground text-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-1.5 rounded-lg text-xs  transition-all flex items-center gap-1.5 ${isYearly ? 'bg-foreground text-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Yearly
            <span className="bg-emerald-500 text-background text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
              2 Months Free
            </span>
          </button>
        </div>

        {/* ── Cards Grid ── */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {TIERS.map((tier) => {
            const isCurrent = currentPlan === tier.key;
            const price = isYearly ? tier.priceYearly : tier.priceMonthly;
            const periodLabel = isYearly ? '/ year' : '/ month';
            const costPerMonthEquivalent = isYearly ? (tier.priceYearly / 12).toFixed(1) : tier.priceMonthly;

            return (
              <div
                key={tier.key}
                className={`relative flex flex-col glass-panel p-8 rounded-2xl border transition-all ${tier.popular ? 'border-emerald-500/60 shadow-lg scale-105 md:translate-y-0 z-10' : 'border-border/60 hover:border-border'}`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-background text-[9px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="text-xl ">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground min-h-[32px]">{tier.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold tracking-tight">${price}</span>
                    <span className="text-xs text-muted-foreground">{periodLabel}</span>
                  </div>
                  {isYearly && (
                    <span className="text-[10px] text-emerald-400  block">
                      Equivalent to ${costPerMonthEquivalent}/mo (billed annually)
                    </span>
                  )}
                </div>

                {/* Limits */}
                <div className="mt-6 space-y-2.5 border-t border-border/40 pt-6">
                  <p className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">Plan Quotas</p>
                  {tier.limits.map((limit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">⚡</span>
                      <span className="text-xs text-foreground font-semibold">{limit}</span>
                    </div>
                  ))}
                </div>

                {/* Features list */}
                <div className="mt-6 space-y-2.5 flex-1">
                  <p className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">Features</p>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className={feat.checked ? 'text-foreground font-medium' : 'text-muted-foreground line-through'}>
                        {feat.label}
                      </span>
                      <span>{feat.checked ? '✅' : '🔒'}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  disabled={isLoading !== null}
                  onClick={() => handleUpgrade(tier.key)}
                  className={`mt-8 w-full py-3 rounded-xl  text-xs shadow-md transition-all active:scale-[0.98] ${isCurrent ? 'bg-secondary text-secondary-foreground cursor-default hover:opacity-100' : tier.popular ? 'bg-emerald-500 text-background hover:bg-emerald-400' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                >
                  {isLoading === tier.key ? 'Processing...' : isCurrent ? 'Active Subscription' : 'Upgrade Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border/40 py-8 px-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Ringit.ai. All rights reserved. Secure billing via Stripe.
      </footer>
    </div>
  );
}
