import React from "react";

export default function AuthVisualPanel() {
  return (
    <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-t-3xl md:rounded-tr-none md:rounded-bl-3xl overflow-hidden flex flex-col justify-between min-h-[320px] md:min-h-[500px]">
      {/* Subtle grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-10" />

      <div className="relative z-10 space-y-4">
        <div className="w-8 h-8 rounded-lg bg-white text-[#070914] flex items-center justify-center font-extrabold text-sm shadow-md">
          R
        </div>
        <h1 className="text-2xl md:text-[36px] font-semibold leading-tight tracking-tight relative md:leading-10">
          Automated voice receptionists for modern practices.
        </h1>
      </div>

      <div className="relative z-10 text-white/50 text-xs font-semibold tracking-wider">
        SECURE TELEPHONY POWERED BY RETELL & TWILIO
      </div>
    </div>
  );
}
