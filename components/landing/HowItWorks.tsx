"use client";

import React from "react";
import Image from "next/image";

interface Point {
  title?: string;
  text: string;
  icon?: string;
}

interface Step {
  step: string;
  badge: string;
  title: string;
  desc: string;
  image: string;
  layoutType: "grid" | "list" | "pills";
  points: Point[];
}

const STEPS_DATA: Step[] = [
  {
    step: "01",
    badge: "Setup",
    title: "Pick your industry.",
    desc: "Each template is tuned for the vocabulary, pricing language, and escalation patterns that vertical needs. The agent inherits all of it on minute one.",
    image: "/How_1.png",
    layoutType: "grid",
    points: [
      {
        title: "Instant Numbers",
        text: "Search area codes and acquire Twilio numbers programmatically in under 20 seconds.",
        icon: "pencil",
      },
      {
        title: "Voice Latency",
        text: "Sub-120ms latency powered by AI voice synthesis.",
        icon: "book",
      },
      {
        title: "CRM Lead Sync",
        text: "Calls parsed by Claude to extract name, phone, and intent to sync with CRMs.",
        icon: "link",
      },
      {
        title: "Voice Cloning",
        text: "Record a 30-second sample to clone your voice for your AI receptionist.",
        icon: "rocket",
      },
    ],
  },
  {
    step: "02",
    badge: "Customization",
    title: "Tell us about your business.",
    desc: "Provide business details, configure email alert destinations, link optional Google Sheets, and request a new Twilio area code or link your existing line.",
    image: "/how_2.png",
    layoutType: "list",
    points: [
      { text: "Set alerts forwarding email to receive customer lead updates immediately." },
      { text: "Append caller records and parsed details directly to Google Sheets in real-time." },
      { text: "Provision a brand-new Twilio area code phone number or wire your own Twilio SID." },
    ],
  },
  {
    step: "03",
    badge: "Deployment",
    title: "Talk, tweak, ship.",
    desc: "Formulate customized receptionist instructions on the AI voice gateway, select your assistant's tone profile, and launch your live phone line.",
    image: "/how_3.png",
    layoutType: "pills",
    points: [
      { text: "Assistant Tone Profile", icon: "simulator" },
      { text: "Prompt Version Control", icon: "adjust" },
      { text: "Live Call Transcripts", icon: "embed" },
    ],
  },
];

function renderSvgIcon(iconName?: string) {
  switch (iconName) {
    case "pencil":
      return (
        <svg className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      );
    case "book":
      return (
        <svg className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "link":
      return (
        <svg className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      );
    case "rocket":
      return (
        <svg className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41a14.98 14.98 0 00-2.3 6.33m6.16-2.58a14.98 14.98 0 00-6.16 12.12A14.98 14.98 0 0012.12 12a14.98 14.98 0 002.3-6.33M6.66 12.12a6 6 0 01-5.84 7.38" />
        </svg>
      );
    case "simulator":
      return (
        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      );
    case "adjust":
      return (
        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      );
    case "embed":
      return (
        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative py-12 px-6 md:px-12 bg-background overflow-hidden">
      
     
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-card/60 shadow-sm text-xs font-semibold text-foreground tracking-normal w-fit">
            <svg
              className="w-2 h-2 text-foreground-blue fill-current"
              viewBox="0 0 8 8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 4 0 C 6.209 0 8 1.791 8 4 C 8 6.209 6.209 8 4 8 C 1.791 8 0 6.209 0 4 C 0 1.791 1.791 0 4 0 Z" />
            </svg>
            <span className="text-foreground font-medium text-[13px]">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-5xl mb-2 font-extrabold text-foreground tracking-tight leading-tight">
            Three steps. <span className="text-foreground-blue">Three minutes.</span>
          </h2>
                    <p className="text-muted-foreground text-base md:text-xl max-w-2xl font-medium leading-relaxed">

            A real voice agent your customers can call.
          </p>
        </div>

        {/* Alternating Layout Steps rendering dynamically based on layoutType */}
        <div className="space-y-24">
          {STEPS_DATA.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={step.step}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                
                {/* Text Side */}
                <div
                  className={`lg:col-span-7 space-y-5 flex flex-col justify-center ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card shadow-sm text-xs font-semibold text-foreground w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground-blue" />
                    <span className="text-foreground font-medium text-[12px] pr-1">{step.badge}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-[32px] mb-1 font-extrabold text-foreground tracking-tight leading-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-md font-medium">
                    {step.desc}
                  </p>

                  {/* Render points dynamically based on layoutType */}
                  {step.layoutType === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                      {step.points.map((pt, pIdx) => (
                        <div key={pIdx} className="space-y-3">
                          <div className="w-9 h-9 rounded-xl bg-foreground-blue flex items-center justify-center text-white shadow-md shadow-foreground-blue/20 shrink-0">
                            {renderSvgIcon(pt.icon)}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-md font-bold text-foreground">{pt.title}</h4>
                            <p className="text-muted-foreground text-[12.5px] font-medium">
                              {pt.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.layoutType === "list" && (
                    <div className="space-y-4 pt-2">
                      {step.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex gap-3 items-center">
                          <div className="w-5 h-5 rounded-full bg-foreground-blue text-white flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 fill-none stroke-current" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <span className="text-foreground font-semibold text-md">
                            {pt.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.layoutType === "pills" && (
                    <div className="flex flex-wrap gap-3 max-w-150 pt-2">
                      {step.points.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card shadow-sm text-sm font-bold text-foreground hover:-translate-y-0.5 transition-all transition-colors"
                        >
                          <span className="text-foreground-blue shrink-0">
                            {renderSvgIcon(pt.icon)}
                          </span>
                          <span>{pt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Screenshot Side */}
                <div
                  className={`lg:col-span-5 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-[20px] overflow-hidden border border-border/80 shadow-lg bg-card p-3 transition-transform duration-300 hover:scale-[1.01]">
                    <div 
                      className="absolute inset-0 pointer-events-none z-20 rounded-[20px] overflow-hidden"
                      style={{
                        background: "radial-gradient(17.9% 17% at 94.25% 0%, var(--foreground-blue) 0%, rgba(255, 255, 255, 0) 100%)",
                        opacity: 0.15,
                      }}
                    />
                    <div className="relative w-full h-full rounded-[14px] overflow-hidden border border-border/30">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 680px"
                        className="object-contain"
                        unoptimized={true}
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
