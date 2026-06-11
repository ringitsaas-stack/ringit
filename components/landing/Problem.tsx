"use client";

import React from "react";
import Image from "next/image";

const PROBLEM_ITEMS = [
  {
    image: "/Img_1.png",
    title: "Missed Calls Turn Into Lost Customers",
    desc: "Potential customers call when they're ready to buy. If nobody answers, they'll often contact acompetitor instead.",
  },
  {
    image: "/Img_2.png",
    title: "Every Caller Expects An Immediate Response",
    desc: "Long hold times, voicemails, and delayed callbacks create friction that reduces conversions and customer satisfaction.",
  },
  {
    image: "/Img_3.png",
    title: "Hiring More Staff Doesn't Scale",
    desc: "Receptionists are expensive and only work limited hours. Your business needs someone answering every call, day and night.",
  },
];

export default function LandingProblem() {
  return (
    <section
      id="problem"
      className="relative py-12 px-6 md:px-12 bg-background overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Section Header */}
        <div className="text-center md:text-left space-y-6 max-w-4xl">
          {/* Framer-like Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-blue/20 bg-card/60 shadow-sm text-xs font-semibold text-foreground tracking-normal w-fit">
            <svg
              className="w-2 h-2 text-foreground-blue fill-current"
              viewBox="0 0 8 8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 4 0 C 6.209 0 8 1.791 8 4 C 8 6.209 6.209 8 4 8 C 1.791 8 0 6.209 0 4 C 0 1.791 1.791 0 4 0 Z" />
            </svg>
            <span className="text-foreground font-medium text-[13px]">
              The Problem
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl mb-2 font-extrabold text-foreground tracking-tight leading-[1.15] max-w-3xl">
            Your Business Can&apos;t Afford To{" "}
            <span className="text-foreground-blue">Miss Another Call.</span>
          </h2>

          <p className="text-muted-foreground text-base md:text-xl max-w-2xl font-medium leading-relaxed">
            RingIT answers every call, books appointments, provides quotes,
            qualifies leads, and routes callers 24/7.
          </p>
        </div>

        {/* Responsive Framer-style Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROBLEM_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col bg-card rounded-[18px] border border-border-blue/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative aspect-1024/910 w-full overflow-hidden bg-muted/20 p-4">
                <div className="relative w-full h-full rounded-[14px] overflow-hidden border border-border/30">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="p-5 pt-0 flex-1 flex flex-col justify-start space-y-2">
                <p className="text-2xl font-bold text-foreground group-hover:text-foreground-blue transition-colors duration-200">
                  {item.title}
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
