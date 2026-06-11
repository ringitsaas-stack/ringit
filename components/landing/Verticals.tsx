"use client";

import React from "react";

const VERTICALS = [
  {
    icon: "🔧",
    title: "Auto Repair",
    desc: "Books service, gives ballpark quotes, schedules pickup.",
  },
  {
    icon: "🎨",
    title: "Design Studios",
    desc: "Qualifies projects, quotes ranges, books project calls.",
  },
  {
    icon: "💪",
    title: "Gyms & Fitness",
    desc: "Books tours, handles class signups, answers membership questions.",
  },
  {
    icon: "⚕️",
    title: "Healthcare",
    desc: "Triages appointments, handles urgent calls, answers insurance questions.",
  },
  {
    icon: "⚖️",
    title: "Law Firms",
    desc: "Routes case types, takes intake info, books consultations.",
  },
  {
    icon: "📢",
    title: "Marketing Agencies",
    desc: "Qualifies leads, books discovery calls, quotes ranges.",
  },
  {
    icon: "📷",
    title: "Photography",
    desc: "Books shoots, quotes packages, captures wedding inquiries.",
  },
  {
    icon: "🏠",
    title: "Real Estate",
    desc: "Schedules showings, answers listing questions, captures buyer leads.",
  },
  {
    icon: "🍳",
    title: "Restaurants",
    desc: "Takes reservations, answers menu questions, handles takeout.",
  },
  {
    icon: "💇",
    title: "Salons",
    desc: "Books appointments, lists services, handles reschedules.",
  },
  {
    icon: "🐾",
    title: "Veterinary",
    desc: "Books visits, handles urgent calls, answers vaccination questions.",
  },
  {
    icon: "🧘",
    title: "Yoga",
    desc: "Books classes, manages memberships, handles drop-ins.",
  },
];

export default function LandingVerticals() {
  return (
    <section
      id="verticals"
      className="relative py-12 px-6 md:px-12 bg-background overflow-hidden"
    >
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
            <span className="text-foreground font-medium text-[13px]">
              Who we serve
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl mb-2 font-extrabold text-foreground tracking-tight leading-tight">
            Any business that{" "}
            <span className="text-foreground-blue">lives off calls.</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-xl max-w-2xl font-medium leading-relaxed">
            Each vertical ships with a hand-tuned starter template. The
            vocabulary, pricing language, and escalation rules are pre-set. You
            change them by chatting.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VERTICALS.map((vert, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col bg-card rounded-[18px] border border-border/60 hover:border-foreground-blue/30 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden justify-between min-h-[160px]"
            >
              <div className="space-y-4">
                {/* Header inside card: Icon and Arrow */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-foreground-blue/5 border border-foreground-blue/10 flex items-center justify-center text-lg shadow-sm">
                    {vert.icon}
                  </div>
                  
                  {/* Rounded sliding arrow container with hover animation */}
                  <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-foreground-blue/5 border border-foreground-blue/10 text-foreground-blue group-hover:bg-foreground-blue group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <svg
                      className="absolute h-3 w-3 transition-all duration-300 ease-out group-hover:-translate-y-5 group-hover:translate-x-5"
                      viewBox="0 0 256 256"
                      fill="currentColor"
                    >
                      <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z" />
                    </svg>
                    <svg
                      className="absolute h-3 w-3 -translate-x-5 translate-y-5 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0"
                      viewBox="0 0 256 256"
                      fill="currentColor"
                    >
                      <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z" />
                    </svg>
                  </div>
                </div>

                {/* Vertical title & description */}
                <div className="space-y-1.5">
                  <h4 className="text-[16px] font-bold text-foreground group-hover:text-foreground-blue transition-colors duration-200">
                    {vert.title}
                  </h4>
                  <p className="text-muted-foreground text-[12.5px] leading-relaxed font-medium">
                    {vert.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info line */}
        <div className="text-center">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground border border-border-blue/20 bg-card px-4 py-2 rounded-full">
            Create from scratch or customize a ready-made template.{" "}
          </span>
        </div>
      </div>
    </section>
  );
}
