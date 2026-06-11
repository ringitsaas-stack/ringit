"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/shared/lib/supabase-client";
import { useToast } from "@/components/ToastProvider";

const getClientSafe = () => {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
};

export interface PricingFeature {
  label: string;
  checked: boolean;
}

export interface PricingTier {
  key: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  desc: string;
  limits: string[];
  features: PricingFeature[];
  popular?: boolean;
  cta: string;
}

export const TIERS: PricingTier[] = [
  {
    key: "starter",
    name: "Starter",
    priceMonthly: 49,
    priceYearly: 490, // 2 months free ($49 * 10)
    desc: "Perfect for local clinics and single reception lines.",
    limits: [
      "1 Active AI Receptionist agent",
      "100 monthly call minutes included",
      "Standard GPT-4o-mini engine",
    ],
    features: [
      { label: "Twilio Number Procurement", checked: true },
      { label: "Voice Cloning Studio", checked: false },
      { label: "CRM / Google Sheets Webhooks", checked: false },
      { label: "Advanced Reasoning Models", checked: false },
    ],
    cta: "Get Started",
  },
  {
    key: "pro",
    name: "Pro",
    priceMonthly: 99,
    priceYearly: 990, // 2 months free ($99 * 10)
    desc: "Scales with growing clinics and offices.",
    limits: [
      "5 Active AI Receptionist agents",
      "500 monthly call minutes included",
      "Use standard or advanced LLMs",
    ],
    features: [
      { label: "Twilio Number Procurement", checked: true },
      { label: "Voice Cloning Studio", checked: true },
      { label: "CRM / Google Sheets Webhooks", checked: true },
      { label: "Advanced Reasoning Models", checked: true },
    ],
    popular: true,
    cta: "Start with Pro",
  },
  {
    key: "agency",
    name: "Agency",
    priceMonthly: 249,
    priceYearly: 2490, // 2 months free ($249 * 10)
    desc: "For multi-location practices and software managers.",
    limits: [
      "20 Active AI Receptionist agents",
      "2,000 monthly call minutes included",
      "Dedicated API access & webhook sync",
    ],
    features: [
      { label: "Twilio Number Procurement", checked: true },
      { label: "Voice Cloning Studio", checked: true },
      { label: "CRM / Google Sheets Webhooks", checked: true },
      { label: "Advanced Reasoning Models", checked: true },
    ],
    cta: "Get Started",
  },
];

interface PricingProps {
  isPricingPage?: boolean;
}

export default function LandingPricing({ isPricingPage = false }: PricingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("starter");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPlan = async () => {
      try {
        const supabase = getClientSafe();
        let activeUserId: string | null = null;

        if (supabase) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            activeUserId = session.user.id;
            setUserId(activeUserId);
          }
        } else {
          const sandboxUser = localStorage.getItem("ringit_sandbox_user");
          if (sandboxUser) {
            const parsed = JSON.parse(sandboxUser);
            activeUserId = parsed.id;
            setUserId(activeUserId);
          }
        }

        if (activeUserId && supabase) {
          const { data } = await supabase
            .from("subscriptions")
            .select("plan, status")
            .eq("user_id", activeUserId)
            .maybeSingle();

          if (data) {
            setCurrentPlan(data.plan || "starter");
          }
        }
      } catch (err) {
        console.error("Error fetching user and plan:", err);
      } finally {
        setIsPlanLoading(false);
      }
    };

    fetchUserAndPlan();
  }, []);

  const handleUpgrade = async (planKey: string) => {
    if (!userId) {
      toast("Please sign in or create an account to subscribe.", "error");
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (planKey === "starter" && currentPlan === "starter") {
      toast("You are already on the Starter plan.", "info");
      return;
    }

    setIsLoading(planKey);

    // Map planKey & isYearly to priceIds (using fallback mock values if not defined in env)
    let priceId = "";
    if (planKey === "starter") {
      priceId = isYearly
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY || "price_starter_yearly"
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || "price_starter_monthly";
    } else if (planKey === "pro") {
      priceId = isYearly
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || "price_pro_yearly"
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly";
    } else if (planKey === "agency") {
      priceId = isYearly
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY || "price_agency_yearly"
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY || "price_agency_monthly";
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: `${window.location.origin}/dashboard?upgrade_success=true`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to initiate checkout session");

      if (data.url) {
        toast(`Redirecting to upgrade checkout...`, "info");
        window.location.assign(data.url);
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Checkout initiation failed.", "error");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section
      id="pricing"
      className={`relative w-full overflow-hidden ${
        isPricingPage ? "py-12" : "py-12  bg-background"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        {/* Header copy (Left-aligned, matching the rest of the page vertical rhythm) */}
        <div className="space-y-4 max-w-3xl mb-12 text-left w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-blue/20 bg-card/60 shadow-sm text-xs font-semibold tracking-normal">
            <span className="w-2 h-2 rounded-full bg-foreground-blue" />
            <span className="text-foreground font-medium text-[13px]">
              Pricing Plans
            </span>
          </div>
          <h2 className="text-3xl mb-2 md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Choose the  <span className="text-foreground-blue">Plan</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-xl max-w-2xl font-medium leading-relaxed">
            Every plan includes our core AI Receptionist setup. Upgrade to unlock CRM sync, voice cloning, and advanced reasoning models.
          </p>
        </div>

        {/* Centered content wrapper for toggle and cards */}
        <div className="w-full flex flex-col items-center">
          {/* ── Toggle Switch (Monthly / Yearly) ── */}
          <div className="flex items-center justify-center gap-4 p-1.5 rounded-xl border border-border bg-card shadow-sm">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isYearly
                  ? "bg-foreground text-background shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isYearly
                  ? "bg-foreground text-background shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="bg-foreground-blue text-white text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                2 Months Free
              </span>
            </button>
          </div>

          {/* ── Cards Grid (Aceternity UI Premium Styling - Adapted to Light Theme / White Cards) ── */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-5xl items-stretch">
          {isPlanLoading ? (
            // Premium Skeleton Loader for Pricing Cards
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="relative flex flex-col p-8 rounded-3xl border border-border/60 bg-card/30 text-foreground justify-between min-h-[550px] animate-pulse"
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground-blue/40 text-white text-[9px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow-lg h-5 w-24" />
                )}
                <div className="space-y-4">
                  <div className="h-6 w-24 bg-muted rounded-md" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded-md" />
                    <div className="h-3 w-2/3 bg-muted rounded-md" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <div className="h-9 w-20 bg-muted rounded-md" />
                    <div className="h-3 w-10 bg-muted rounded-md" />
                  </div>
                </div>

                <div className="h-10 w-full bg-muted rounded-xl mt-8" />

                <hr className="my-6 border-t border-dashed border-border/80" />

                <div className="space-y-3.5">
                  <div className="h-3 w-24 bg-muted rounded-md" />
                  <ul className="space-y-2.5">
                    {[...Array(3)].map((_, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 bg-muted rounded-full shrink-0" />
                        <div className="h-3 w-5/6 bg-muted rounded-md" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 space-y-3 flex-1">
                  <div className="h-3 w-20 bg-muted rounded-md" />
                  <ul className="space-y-2.5">
                    {[...Array(4)].map((_, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <div className="h-3 w-1/2 bg-muted rounded-md" />
                        <div className="w-4 h-4 bg-muted rounded-full shrink-0" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            TIERS.map((tier) => {
              const isCurrent = currentPlan === tier.key;
              const price = isYearly ? tier.priceYearly : tier.priceMonthly;
              const periodLabel = isYearly ? "/ year" : "/ month";
              const costPerMonthEquivalent = isYearly
                ? (tier.priceYearly / 12).toFixed(1)
                : tier.priceMonthly;

              // All cards are now premium white cards
              const isPopular = tier.popular;

              return (
                <div
                  key={tier.key}
                  className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 bg-white text-foreground ${
                    isPopular
                      ? "border-2 border-foreground-blue shadow-lg scale-105 z-10"
                      : "border-border/80 shadow-md hover:border-border hover:shadow-lg"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground-blue text-white text-[9px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow-lg">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-muted-foreground min-h-[32px]">
                      {tier.desc}
                    </p>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">${price}</span>
                      <span className="text-xs text-muted-foreground">
                        {periodLabel}
                      </span>
                    </div>
                    {isYearly && (
                      <span className="text-[10px] text-foreground-blue font-bold block">
                        Equivalent to ${costPerMonthEquivalent}/mo (billed annually)
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    disabled={isLoading !== null}
                    onClick={() => handleUpgrade(tier.key)}
                    className={`mt-8 w-full py-3 rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                      isCurrent
                        ? "bg-secondary text-secondary-foreground cursor-default opacity-80"
                        : isPopular
                        ? "bg-foreground-blue text-white hover:bg-foreground-blue/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {isLoading === tier.key
                      ? "Processing..."
                      : isCurrent
                      ? "Active Subscription"
                      : tier.cta}
                  </button>

                  {/* Divider */}
                  <hr className="my-6 border-t border-dashed border-border" />

                  {/* Limits / Quotas */}
                  <div className="space-y-3.5">
                    <p className="text-[10px] font-extrabold tracking-wider uppercase text-muted-foreground">
                      {tier.name} plan includes
                    </p>
                    <ul className="space-y-2.5">
                      {tier.limits.map((limit, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                          <span className="text-xs shrink-0 text-foreground-blue">
                            ⚡
                          </span>
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features list */}
                  <div className="mt-6 space-y-3 flex-1">
                    <p className="text-[10px] font-extrabold tracking-wider uppercase text-muted-foreground">
                      Features
                    </p>
                    <ul className="space-y-2.5">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center justify-between text-xs font-medium">
                          <span
                            className={
                              feat.checked
                                ? "text-foreground"
                                : "text-muted-foreground/50 line-through"
                            }
                          >
                            {feat.label}
                          </span>
                          <span className="shrink-0 text-sm">
                            {feat.checked ? (
                              <span className="text-foreground-blue font-bold">✓</span>
                            ) : (
                              <span className="text-muted-foreground/30">🔒</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  </section>
);
}
