"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How long until my AI voice agent is live?",
    answer: "Most RingIT agents are ready in under 3 minutes. Simply choose your industry, provide a few details about your business, and we'll build the rest.",
  },
  {
    question: "What can RingIT handle?",
    answer: "RingIT can answer calls, answer FAQs, qualify leads, provide quotes, book appointments, transfer calls, collect customer information, and handle common inquiries 24/7.",
  },
  {
    question: "Does the voice agent sound human?",
    answer: "Yes. RingIT is designed for natural, human-like conversations with realistic speech, intelligent responses, and smooth back-and-forth dialogue.",
  },
  {
    question: "Can it sound like me or my business?",
    answer: "Absolutely. RingIT can be trained on a founder's or owner's voice, allowing customers to interact with a voice that feels familiar and aligned with your brand.",
  },
  {
    question: "Does it actually book appointments?",
    answer: "Yes. RingIT can connect to your calendar and schedule appointments automatically while checking availability in real time.",
  },
  {
    question: "Can RingIT transfer calls to my team?",
    answer: "Yes. When a caller needs a human, RingIT can route calls to the appropriate person or department based on your rules.",
  },
  {
    question: "What languages are supported?",
    answer: "RingIT supports multiple languages, allowing businesses to serve customers across different regions and demographics.",
  },
  {
    question: "Can it integrate with our existing tools?",
    answer: "Yes. RingIT integrates with calendars, CRMs, APIs, webhooks, and other business systems to automate workflows and keep records up to date.",
  },
  {
    question: "What happens when call volume spikes?",
    answer: "RingIT can handle multiple conversations simultaneously, ensuring every caller gets an immediate response without hold times or missed calls.",
  },
  {
    question: "How does pricing work?",
    answer: "Start with a free trial and upgrade as your call volume grows. Pricing is designed to scale with your business without the cost of hiring additional staff.",
  },
];

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-12 px-6 md:px-12 bg-background overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 md:grid-cols-12 md:px-8">
        
        {/* Left Side: Header Copy */}
        <div className="md:col-span-5 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-blue/20 bg-card/60 shadow-sm text-xs font-semibold tracking-normal">
            <span className="w-2 h-2 rounded-full bg-foreground-blue" />
            <span className="text-foreground font-medium text-[13px]">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Frequently Asked <span className="text-foreground-blue">Questions</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm">
            Things businesses ask before they launch. Get answers to common setup, capabilities, and pricing questions.
          </p>
        </div>

        {/* Right Side: Accordion Accordion List */}
        <div className="md:col-span-7 divide-y divide-border/60 border-t border-b border-border/40 md:border-b-0">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                onClick={() => toggleFAQ(index)}
                className="cursor-pointer py-5 group transition-colors duration-200"
              >
                <div className="flex items-start">
                  {/* Animated toggle icon */}
                  <div className="relative mr-4 mt-1 h-6 w-6 flex-shrink-0">
                    {/* Plus Icon (Horizontal & Vertical segments) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`absolute inset-0 h-6 w-6 text-foreground-blue transition-all duration-300 transform ${
                        isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                      }`}
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    
                    {/* Minus Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`absolute inset-0 h-6 w-6 text-foreground-blue transition-all duration-300 transform ${
                        isOpen ? "rotate-180 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                      }`}
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <h3 className="text-[16px] md:text-lg font-bold text-foreground transition-colors group-hover:text-foreground-blue leading-snug">
                      {item.question}
                    </h3>
                    
                    {/* Expandable answer panel */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out text-muted-foreground text-sm md:text-[14.5px] leading-relaxed font-medium ${
                        isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 overflow-hidden"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {item.answer}
                      </div>
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
