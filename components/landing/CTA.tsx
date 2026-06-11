"use client";

import React from "react";
import { CTASection } from "@/components/ui/cta-with-rectangle";

export default function LandingCTA() {
  return (
    <section className="relative py-20 px-6 md:px-12 bg-background overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground-blue/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto w-full">
        {/* Render the Launch UI CTASection with premium 3D light-theme container style */}
        <CTASection
          title={
            <span className="leading-tight block">
              Voice agents that pick up <br />
              <span className="bg-gradient-to-r  text-foreground-blue">
                the second someone needs you.
              </span>
            </span>
          }
          action={{
            text: "Get Started",
            href: "/auth/signup"
          }}
          withGlow={true}
          className="relative rounded-[32px] bg-white border border-border/80 text-center shadow-[0_20px_50px_rgba(18,72,222,0.12)] hover:shadow-[0_30px_70px_rgba(18,72,222,0.18)] transition-all duration-300 overflow-hidden"
        />
      </div>
    </section>
  );
}
