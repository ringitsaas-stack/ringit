"use client";

import React from "react";
import Image from "next/image";

interface CardData {
  title: string;
  desc: string;
  image: string;
}

interface ColumnConfig {
  type: "single" | "stacked";
  card?: CardData;
  cards?: CardData[];
}

const ENTERPRISE_COLUMNS: ColumnConfig[] = [
  {
    type: "single",
    card: {
      title: "Human Conversations, Built to Scale",
      desc: "Serve millions of customers across telecom, retail, healthcare, travel, and hospitality. RingIT’s AI voice agents handle high call volumes 24/7 — no hiring, no training, no delays.",
      image: "/Enter_1.png",
    },
  },
  {
    type: "single",
    card: {
      title: "Seamless System Integrations",
      desc: "We can integrate with any custom CRM based on your specific requirements. Feel free to send us an email with the details, and we'll be happy to discuss the integration options and provide a solution tailored to your needs.",
      image: "/Enter_3.png",
    },
  },
  {
    type: "single",
    card: {
      title: "24/7 Multilingual Support",
      desc: "We provide seamless support around the clock, across multiple languages. RingIT’s AI voice agents ensure every customer is heard and helped anytime, anywhere.",
      image: "/Enter_4.png",
    },
  },
];

export default function LandingEnterprise() {
  return (
    <section id="enterprise" className="relative py-12 px-6 md:px-12 bg-background overflow-hidden ">
      
      <div className="max-w-6xl mx-auto w-full space-y-16">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
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
              Enterprise Solutions
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Why Leading Teams <span className="text-foreground-blue">Choose RingIT</span>
          </h2>
        </div>

        {/* Bento Grid (3-column layout driven dynamically via JSON) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {ENTERPRISE_COLUMNS.map((col, cIdx) => {
            if (col.type === "single" && col.card) {
              const card = col.card;
              return (
                <div
                  key={cIdx}
                  className="flex flex-col bg-card rounded-[24px] border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full justify-between gap-6"
                >
                  <div className="p-6 pb-0 space-y-3">
                    <h3 className="text-2xl font-extrabold text-foreground mb-1 leading-snug">{card.title}</h3>
                    <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  
                  {/* flex-grow image container that uses object-contain and matches the dark canyon background color */}
                  <div className={`relative w-full mt-auto px-3 pb-3 ${cIdx === 1 ? 'aspect-[16/10.5]' : 'aspect-[16/13.5]'}`}>
                    <div className="relative w-full h-full rounded-[16px] overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 380px"
                        className="object-cover object-center"
                        unoptimized={true}
                      />
                    </div>
                  </div>
                </div>
              );
            } else if (col.type === "stacked" && col.cards) {
              return (
                <div key={cIdx} className="flex flex-col gap-4 h-full justify-between">
                  {col.cards.map((card, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col bg-card rounded-[24px] border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden justify-between flex-1"
                    >
                      <div className="p-4 pb-0 space-y-3">
                        <h3 className="text-xl font-bold text-foreground mb-1 leading-snug">{card.title}</h3>
                        <p className="text-muted-foreground text-[13.5px] font-medium">
                          {card.desc}
                        </p>
                      </div>
                      
                      {/* Image container spanning full card width at the bottom */}
                      <div className="relative w-full aspect-[16/7.5]  mt-auto">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 380px"
                          className="object-cover p-3 rounded-[24px]"
                          unoptimized={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>

      </div>
    </section>
  );
}
