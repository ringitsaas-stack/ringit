'use client';

import React from 'react';

interface StatsBarProps {
  totalAgents: number;
  maxAgents: number;
  minutesUsed: number;
  maxMinutes: number;
  totalLeads: number;
  avgDuration: string;
}

export default function StatsBar({
  totalAgents,
  maxAgents,
  minutesUsed,
  maxMinutes,
  totalLeads,
  avgDuration,
}: StatsBarProps) {
  const agentUsagePercentage = Math.min((totalAgents / maxAgents) * 100, 100);
  const minutesUsagePercentage = Math.min((minutesUsed / maxMinutes) * 100, 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {/* Total Agents Card */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-zinc-400 transition-all bg-card/50">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Total Agents
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-foreground leading-none">
              {totalAgents}
            </span>
            <span className="text-xs text-muted-foreground font-normal">/ {maxAgents} limit</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
            <div 
              className="bg-foreground-blue h-1 rounded-full transition-all duration-500" 
              style={{ width: `${totalAgents > 0 ? Math.max(agentUsagePercentage, 5) : 0}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
            <span>Provisioned receptionists</span>
            <span className="text-foreground-blue">{agentUsagePercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Minute Limits Card */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-zinc-400 transition-all bg-card/50">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Minute Limits
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-foreground leading-none">
              {minutesUsed.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground font-normal">/ {maxMinutes}m</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
            <div 
              className="bg-foreground-blue h-1 rounded-full transition-all duration-500" 
              style={{ width: `${minutesUsed > 0 ? Math.max(minutesUsagePercentage, 5) : 0}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
            <span>Monthly Call quota</span>
            <span className="text-foreground-blue">{minutesUsagePercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Total Leads Card */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-zinc-400 transition-all bg-card/50">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Total Leads
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-foreground leading-none">
              {totalLeads}
            </span>
            <span className="text-[10px] text-foreground-blue font-bold px-1.5 py-0.5 bg-foreground-blue/10 rounded-md">Live</span>
          </div>
        </div>
        <div className="mt-4 text-[10px] text-muted-foreground font-medium">
          Captured from active customer queries
        </div>
      </div>

      {/* Avg Duration Card */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-border/60 hover:border-zinc-400 transition-all bg-card/50">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Avg Duration
          </span>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-foreground leading-none">
              {avgDuration}
            </span>
          </div>
        </div>
        <div className="mt-4 text-[10px] text-muted-foreground font-medium">
          Telephony Latency: ~120ms
        </div>
      </div>
    </div>
  );
}
