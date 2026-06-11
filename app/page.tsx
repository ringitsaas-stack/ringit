"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/shared/lib/supabase-client";
import LandingHeader from "@/components/landing/Header";
import LandingHero from "@/components/landing/Hero";
import LandingProblem from "@/components/landing/Problem";
import LandingSolution from "@/components/landing/Solution";
import LandingHowItWorks from "@/components/landing/HowItWorks";
import LandingVerticals from "@/components/landing/Verticals";
import LandingEnterprise from "@/components/landing/Enterprise";

import LandingPricing from "@/components/landing/Pricing";
import LandingFAQ from "@/components/landing/FAQ";
import LandingCTA from "@/components/landing/CTA";
import LandingFooter from "@/components/landing/Footer";

const getClientSafe = () => {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = getClientSafe();
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session?.user);
      } else {
        setIsLoggedIn(!!localStorage.getItem("ringit_sandbox_user"));
      }
    };
    check();
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 overflow-x-hidden">
      <div className="fixed bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none z-50">
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            maskImage:
              "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
          }}
        />
      </div>
      <LandingHeader isLoggedIn={isLoggedIn} />

      <main className="flex-1 flex flex-col">
        <LandingHero />
        <LandingProblem />
        <LandingSolution />

        <LandingHowItWorks />
        <LandingVerticals />
        <LandingEnterprise />

        <LandingPricing />
        <LandingFAQ />
        <LandingCTA />

      </main>

      <LandingFooter />
    </div>
  );
}
