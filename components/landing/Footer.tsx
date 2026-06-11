"use client";

import React from "react";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="w-full bg-background border-t border-border/60 py-8  px-6 text-foreground">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Top Grid: Logo on left, navigation lists on right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-6 border-b border-border/60">
          
          {/* Logo & Slogan Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-extrabold text-[11px] group-hover:scale-105 transition-transform">
                R
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">
                Ringit<span className="text-foreground-blue">.ai</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs md:text-sm max-w-xs leading-relaxed font-semibold">
              A Smallest AI product. Voice agents for businesses that live off calls.
            </p>
          </div>

          {/* Navigation Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 gap-6">
            {/* Product Column */}
            <div className="space-y-4">
              <h4 className="text-md font-bold mb-2 text-foreground-blue">
                Product
              </h4>
              <ul className="text-sm font-medium text-foreground">
                 <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                   Feature
                  </a>
                </li>
                <li>
                  <a href="#verticals" className="hover:text-foreground transition-colors">
                    Who we serve
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-4">
              <h4 className="text-md font-bold mb-2 text-foreground-blue">
                Legal
              </h4>
              <ul className="text-sm font-medium text-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy & Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                 <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Slogan, and Credit Badge */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-[10px] font-semibold text-muted-foreground/85 tracking-wider">
          {/* Copyright */}
          <div>
            &copy; {new Date().getFullYear()} Ringit · An AI Voice product.
          </div>
        </div>
      </div>
    </footer>
  );
}
