"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnimatedButton from "@/components/common/AnimatedButton";

interface LandingHeaderProps {
  isLoggedIn: boolean | null;
}

export default function LandingHeader({ isLoggedIn }: LandingHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="absolute animate-fade-in top-0 left-0 right-0 z-50 bg-transparent py-4 px-6 md:py-6 md:px-10 flex justify-between items-center transition-all duration-300">
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2.5 group relative z-10">
        <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-105 transition-transform duration-300">
          R
        </div>
        <span className="text-lg tracking-tight font-semibold">Ringit</span>
      </Link>

      {/* Desktop Nav Links */}
      <nav className="hidden md:flex font-medium items-center gap-8 text-[15px] text-foreground/80">
        <a href="#features" className="hover:text-foreground hover:-translate-y-px transition-all duration-200">
          Features
        </a>
        <a href="#pricing" className="hover:text-foreground hover:-translate-y-px transition-all duration-200">
          Pricing
        </a>
        <a href="#how-it-works" className="hover:text-foreground hover:-translate-y-px transition-all duration-200">
          How It Works
        </a>
        <a href="#verticals" className="hover:text-foreground hover:-translate-y-px transition-all duration-200">
          Who We Serve
        </a>
      </nav>

      {/* Desktop Action buttons */}
      <div className="hidden md:flex items-center gap-4 relative z-10">
        {isLoggedIn === null ? (
          <div className="w-24 h-9 rounded-full bg-secondary animate-pulse" />
        ) : isLoggedIn ? (
          <AnimatedButton href="/dashboard" label="Dashboard" />
        ) : (
          <AnimatedButton href="/auth/signup" label="Get Started Free" />
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden p-2 text-foreground relative z-10"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/40 p-6 flex flex-col gap-6 shadow-2xl md:hidden animate-fade-in origin-top">
          <nav className="flex flex-col gap-4 text-lg font-medium text-foreground">
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
            <a href="#verticals" onClick={() => setIsMenuOpen(false)}>Who We Serve</a>
          </nav>
          <div className="h-px bg-border/50 w-full" />
          <div className="flex flex-col gap-3">
            {isLoggedIn === null ? (
              <div className="w-full h-12 rounded-full bg-secondary animate-pulse" />
            ) : isLoggedIn ? (
              <button
                onClick={() => {
                  router.push("/dashboard");
                  setIsMenuOpen(false);
                }}
                className="btn-framer-primary w-full justify-center gap-2 text-md px-5 py-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Dashboard
              </button>
            ) : (
              <a href="/auth/signup" className="btn-framer-primary w-full justify-center text-md px-5 py-3 text-center">
                Get Started Free
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
