'use client';

import React from 'react';
import Link from 'next/link';
import LandingPricing from '@/components/landing/Pricing';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* ── Nav Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md py-4 px-6 md:px-10 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-extrabold text-sm group-hover:scale-105 transition-transform">R</div>
          <span className="text-lg">Ringit<span className="text-foreground-blue">.ai</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <LandingPricing isPricingPage={true} />
      </main>

      <footer className="border-t border-border/40 py-8 px-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Ringit.ai. All rights reserved. Secure billing via Stripe.
      </footer>
    </div>
  );
}
