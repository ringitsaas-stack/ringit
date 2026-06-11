'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import LandingHeader from '@/components/landing/Header';
import LandingHero from '@/components/landing/Hero';

const getClientSafe = () => {
  try { return getSupabaseClient(); } catch { return null; }
};

const FEATURES = [
  { icon: '⚡', title: 'Instant Telephony Provision', desc: 'Search area codes and acquire Twilio numbers programmatically in under 20 seconds.' },
  { icon: '🗣️', title: 'Human-Grade Voice Latency', desc: 'Retell AI voice synthesis delivers natural conversational pacing with sub-120ms response times.' },
  { icon: '📝', title: 'AI Lead Extraction', desc: 'Calls are transcribed and parsed by Claude to sync caller names, phones, and intents to your CRM.' },
  { icon: '🔄', title: 'Prompt Version Control', desc: 'Archive every prompt update and hot-roll back to any previous deployment with one click.' },
  { icon: '📊', title: 'Live Analytics Dashboard', desc: 'Real-time call logs, lead pipeline, duration tracking and per-agent analytics in one view.' },
  { icon: '🎤', title: 'Voice Cloning Studio', desc: 'Record a 30-second sample to clone your voice and apply it to your AI receptionist instantly.' },
];

const PRICING = [
  { name: 'Starter', price: '$49', desc: 'Best for small operations', features: ['1 Active AI Receptionist', '100 Calling Minutes / month', 'Email lead forwarding', 'Basic analytics'], cta: 'Get Started', highlight: false },
  { name: 'Pro', price: '$99', desc: 'Most popular — scales with you', features: ['5 Active AI Receptionists', '500 Calling Minutes / month', 'Prompt version rollbacks', 'Google Sheets CRM sync', 'Voice Cloning Studio'], cta: 'Start Pro Trial', highlight: true },
  { name: 'Agency', price: '$249', desc: 'For multiple offices & teams', features: ['20 Active AI Receptionists', '2,000 Calling Minutes / month', 'Dedicated developer SLA', 'Custom voice model support', 'Priority support'], cta: 'Contact Sales', highlight: false },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = getClientSafe();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session?.user);
      } else {
        setIsLoggedIn(!!localStorage.getItem('ringit_sandbox_user'));
      }
    };
    check();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">

      {/* ── Sticky Nav ── */}
      <LandingHeader isLoggedIn={isLoggedIn} />

      <main className="flex-1 flex flex-col">

        {/* ── Hero ── */}
        <LandingHero />

        {/* ── Stats Bar ── */}
        <section className="border-y border-border/60 bg-card/30 py-8 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ value: '120ms', label: 'Voice Latency' }, { value: '24/7', label: 'Always On' }, { value: '99.9%', label: 'Uptime SLA' }, { value: '2 min', label: 'Avg Setup' }].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="text-2xl md:text-3xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto w-full">
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Up and running in 3 steps</h2>
            <p className="text-muted-foreground text-sm font-semibold">From signup to live calls in under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Agent', desc: 'Set your business name, industry, services, and tone. We auto-configure the AI prompt.' },
              { step: '02', title: 'Get a Phone Number', desc: 'Pick an area code and we instantly provision a Twilio number and wire it to your Retell AI agent.' },
              { step: '03', title: 'Go Live & Capture Leads', desc: 'Your AI receptionist answers calls, books appointments, and sends structured CRM leads to your inbox.' },
            ].map((item) => (
              <div key={item.step} className="glass-panel p-7 rounded-2xl space-y-4 border border-border/60 hover:border-border transition-all group">
                <div className="text-3xl font-extrabold text-blue-500/30 group-hover:text-blue-500/60 transition-colors">{item.step}</div>
                <h3 className=" text-foreground text-base">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-20 px-6 bg-card/20 border-y border-border/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-2 mb-14">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Complete Autonomous Telephony</h2>
              <p className="text-muted-foreground text-sm font-semibold">Everything you need to automate voice operations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feat) => (
                <div key={feat.title} className="glass-panel p-6 rounded-2xl space-y-3 border border-border/60 hover:border-border hover:shadow-md transition-all group">
                  <div className="text-2xl group-hover:scale-110 transition-transform inline-block">{feat.icon}</div>
                  <h3 className=" text-foreground text-sm">{feat.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto w-full">
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Transparent Pricing</h2>
            <p className="text-muted-foreground text-sm font-semibold">Choose the plan that fits your call volume</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`glass-panel p-7 rounded-2xl flex flex-col justify-between space-y-6 border transition-all ${plan.highlight ? 'border-2 border-blue-600 scale-105 shadow-xl shadow-blue-500/10' : 'border-border/60 hover:border-border'}`}>
                <div className="space-y-4">
                  {plan.highlight && <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full border border-blue-600/20">Most Popular</span>}
                  <div>
                    <h3 className={` text-sm mb-0.5 ${plan.highlight ? 'text-blue-600' : 'text-foreground'}`}>{plan.name}</h3>
                    <div className="text-3xl font-extrabold text-foreground">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                    <p className="text-muted-foreground text-[11px] mt-1">{plan.desc}</p>
                  </div>
                  <ul className="space-y-2.5 border-t border-border pt-4">
                    {plan.features.map((f) => (
                      <li key={f} className={`text-[11px] flex items-start gap-2 ${plan.highlight ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        <span className="text-blue-600 mt-px shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/auth/signup" className={`w-full text-center  text-xs py-2.5 rounded-lg transition-all ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md' : 'bg-card border border-border text-foreground hover:bg-secondary'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-20 px-6 bg-card/20 border-t border-border/40">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Ready to automate your front desk?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Join businesses running 24/7 AI receptionists. No code, no hardware — just a phone number and a prompt.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isLoggedIn ? (
                <button onClick={() => router.push('/dashboard')} className="bg-primary text-primary-foreground  text-sm px-8 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md">
                  Open Dashboard →
                </button>
              ) : (
                <>
                  <Link href="/auth/signup" className="bg-primary text-primary-foreground  text-sm px-8 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md">Start for Free →</Link>
                  <Link href="/auth/login" className="border border-border text-foreground  text-sm px-8 py-3.5 rounded-xl hover:bg-secondary transition-all">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-8 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-foreground text-background flex items-center justify-center font-extrabold text-[9px]">R</div>
            <span>Ringit.ai — AI Telephony Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
          <span>© 2025 Ringit.ai · All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
