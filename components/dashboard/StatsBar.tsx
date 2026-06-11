'use client';

import React from 'react';

interface Agent {
  phoneNumber: string;
  status: 'active' | 'paused';
}

interface StatsBarProps {
  currentAgent: Agent;
  dynamicMinutes: string;
  dynamicLeadsCount: number;
  dynamicAvgDuration: string;
}

export default function StatsBar({
  currentAgent,
  dynamicMinutes,
  dynamicLeadsCount,
  dynamicAvgDuration,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-border transition-all">
        <span className="text-[10px]  text-muted-foreground uppercase tracking-widest">
          Active Number
        </span>
        <div className="mt-3">
          <span className="text-sm md:text-base  text-foreground truncate block">
            {currentAgent.phoneNumber}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-emerald-500  flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {currentAgent.status}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-border transition-all">
        <span className="text-[10px]  text-muted-foreground uppercase tracking-widest">
          Minutes Answered
        </span>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-foreground leading-none">
            {dynamicMinutes}
          </span>
          <span className="text-xs text-muted-foreground font-normal">/ 500 min</span>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground font-semibold">
          Active Pro Plan
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-border transition-all">
        <span className="text-[10px]  text-muted-foreground uppercase tracking-widest">
          CRM Leads
        </span>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-foreground leading-none">
            {dynamicLeadsCount}
          </span>
          <span className="text-[10px] text-emerald-500  ml-1.5">Capture live</span>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          Extracted securely via LLM
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-border transition-all">
        <span className="text-[10px]  text-muted-foreground uppercase tracking-widest">
          Avg Duration
        </span>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-foreground leading-none">
            {dynamicAvgDuration}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          Telephony Latency: ~120ms
        </div>
      </div>
    </div>
  );
}
