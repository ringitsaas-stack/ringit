"use client";

import React from "react";
import AnimatedButton from "../common/AnimatedButton";

export default function LandingHero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-28 md:pt-40 md:pb-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Dot Matrix Overlay with Smooth Edge Fade */}
        <div
          className="absolute inset-x-0 top-25 h-120 text-foreground/5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "10px 10px",
            maskImage:
              "linear-gradient(to bottom, transparent, black 15%, black 70%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 15%, black 70%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      </div>

      {/* Hero Content Container */}
      <div className="relative w-full max-w-4xl mx-auto space-y-8 z-10 flex flex-col items-center">
        {/* Centered Pill Badge */}
        <div className="inline-flex items-center text-sm gap-2 bg-background px-1 py-1 pr-3 rounded-full border border-border-blue/20 shadow-sm animate-fade-in mb-5">
          <span className="bg-foreground-blue text-white font-medium px-2.5 py-0.5 rounded-full">
            New
          </span>
          <span className="font-medium text-foreground pr-1">
            Advanced AI Model
          </span>
        </div>

        {/* Heading title (Geist - 600, Size 58px, Line Height 64px, Color rgb(7, 13, 36)) */}
        <h1 className="text-4xl md:text-[58px] mb-4 animate-fade-in font-semibold tracking-tight text-foreground md:leading-16 leading-tight max-w-3xl">
          Launch Your AI Voice Agent In Just{" "}
          <span className="shiny-text inline-block">
            3 Minutes
          </span>
        </h1>

        {/* Subtext description */}
        <p className="text-muted-foreground text-md mb-2 sm:text-xl animate-fade-in max-w-2xl">
          RingIT AI voice agents answer questions, resolve issues, book
          appointments, and qualify leads 24/7 through natural conversations
          powered by your founder&apos;s or owner&apos;s cloned voice.
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <AnimatedButton href="/auth/signup" label="Get Started Free" />
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card text-foreground text-md px-7 py-3.5 rounded-full border border-border-blue/30 hover:-translate-y-0.5 active:scale-98 transition-all shadow"
          >
            Book a Demo
          </a>
        </div>

        {/* Dashboard Preview Container with Aurora Background Glows */}
        <div className="relative mt-16 w-full max-w-5xl flex flex-col items-center">
          {/* Vibrant Background Glows Bleeding Out to the Left & Right */}
          <div className="absolute inset-0 -z-10 flex justify-between items-center pointer-events-none w-[110%] translate-x-[-5%] translate-y-[-5%]">
            <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-foreground-blue/60 rounded-full blur-[100px] md:blur-[130px] mix-blend-normal animate-pulse-slow" />
            <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-foreground-blue/60 rounded-full blur-[100px] md:blur-[130px] mix-blend-normal animate-pulse-slow" />
          </div>

          {/* Animated BG avif behind the mockup (larger than the card to bleed outwards) */}
          <div
            className="absolute -inset-y-30 -inset-x-45 -z-20 bg-cover bg-center opacity-65 pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: "url('/Bg_animation.avif')",
            }}
          />

          {/* Actual Mockup Card */}
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-border/60 shadow-2xl bg-card transition-all duration-700 hover:scale-[1.01] hover:rotate-[0.5deg] z-10"
            style={{
              transform: "perspective(1200px) rotateX(5deg)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Soft inner glow */}
            <div className="absolute inset-0 bg-foreground-blue pointer-events-none z-0" />

            <img
              src="https://framerusercontent.com/images/iymqUXoBeYPUXeu1qllIHHaH4.png?width=2048"
              alt="Ringit Dashboard Interface"
              className="w-full relative z-10 border-b border-border/20 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
