"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedButton from "../common/AnimatedButton";

const SOLUTION_FEATURES = [
  {
    id: "01.",
    title: "Human-Like Voice Conversations",
    desc: "Your AI voice agent speaks naturally, understands intent, and responds like a trained human agent — not a scripted bot.",
    image: "/Sol_1.avif",
  },
  {
    id: "02.",
    title: "Instant 24/7 Call Handling",
    desc: "Answer every single inbound call instantly, day or night. Scale dynamically to handle hundreds of concurrent calls without any wait times.",
    image: "/Sol_2.avif",
  },
  {
    id: "03.",
    title: "Secure Lead & CRM Storage",
    desc: "We capture and store every call log, contact detail, and lead requirement automatically. Securely sync all customer records in real-time to keep your business pipeline fully up-to-date.",
    image: "/Sol_3.png",
  },
  {
    id: "04.",
    title: "Actionable Call Insights",
    desc: "Automatically transcribe, tag, and extract key details like sentiment, intent, and customer data to sync directly with your CRM.",
    image: "/Sol_4.avif",
  },
];

export default function LandingSolution() {
  const [activeTab, setActiveTab] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  return (
    <section
      id="features"
      className="relative py-24 px-6 md:px-12 bg-background overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left Column: Solution Intro & Interactive Tabs */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2 space-y-10">
            {/* Header copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-blue/20 bg-card/60 shadow-sm text-xs font-semibold text-foreground tracking-normal w-fit">
                <svg
                  className="w-2 h-2 text-foreground-blue fill-current"
                  viewBox="0 0 8 8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M 4 0 C 6.209 0 8 1.791 8 4 C 8 6.209 6.209 8 4 8 C 1.791 8 0 6.209 0 4 C 0 1.791 1.791 0 4 0 Z" />
                </svg>
                <span className="text-foreground font-medium text-[13px]">
                  The Solution
                </span>
              </div>

              {/* Subheading text */}
              <p className="text-muted-foreground text-base md:text-xl max-w-2xl font-medium leading-relaxed">
                Deploy AI voice agents that understand intent, respond
                naturally, and resolve real customer needs in seconds.
              </p>

              {/* Get Started Button */}
              <div>
                <AnimatedButton href="/auth/signup" label="Get Started Free" />
              </div>
            </div>

            {/* Interactive Tab List */}
            <div className="border-t border-border/80 divide-y divide-border/80">
              {SOLUTION_FEATURES.map((feat, index) => {
                const isActive = activeTab === index;
                return (
                  <div
                    key={feat.id}
                    onClick={() => setActiveTab(index)}
                    className="group cursor-pointer py-6 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-[14px] font-bold text-muted-foreground/50 mt-0.75">
                          {feat.id}
                        </span>
                        <h4 className="text-[17px] font-bold text-foreground transition-colors duration-200">
                          {feat.title}
                        </h4>
                      </div>

                      {/* Arrow Icon shown for active tab */}
                      <div
                        className={`w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2 pointer-events-none"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 text-foreground fill-current"
                          viewBox="0 0 20.385 17.751"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M 11.51 17.751 L 9.983 16.245 L 16.264 9.965 L 0 9.965 L 0 7.787 L 16.264 7.787 L 9.983 1.527 L 11.51 0 L 20.385 8.875 Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Description wrapper */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isActive
                          ? "grid-rows-[1fr] opacity-100 mt-2"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm leading-relaxed font-medium text-muted-foreground pl-[38px] max-w-[480px]">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Full height Dynamic Solution Graphic/Mockup Preview */}
          <div className="lg:col-span-6 flex items-stretch">
            <div className="relative w-full rounded-[24px] overflow-hidden border border-border/40 shadow-xl bg-card min-h-[500px] lg:min-h-[600px] h-full flex-1">
              {SOLUTION_FEATURES.map((feat, index) => {
                const isActive = activeTab === index;
                return (
                  <div
                    key={feat.id}
                    className={`absolute inset-0 transition-all duration-300 ${
                      isActive
                        ? "opacity-100 z-10 scale-100"
                        : "opacity-0 z-0 scale-95"
                    }`}
                  >
                    {!loadedImages[index] && (
                      <div className="absolute inset-0 bg-secondary/30 animate-pulse flex items-center justify-center z-[11]">
                        <div className="w-8 h-8 rounded-full border-2 border-foreground-blue border-t-transparent animate-spin" />
                      </div>
                    )}
                    <Image
                      src={feat.image}
                      alt={feat.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 576px"
                      className={`object-cover transition-opacity duration-300 ${loadedImages[index] ? 'opacity-100' : 'opacity-0'}`}
                      priority={index === 0}
                      onLoad={() => setLoadedImages(prev => ({ ...prev, [index]: true }))}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
