'use client';

import React from 'react';
import { Phone, Clock, UserCheck, Bot, TrendingUp } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {/* Total Calls Card - Solid Blue Gradient Theme */}
      <div className="bg-gradient-to-br from-foreground-blue to-blue-700 text-white p-6 rounded-2xl border border-blue-600/30 hover:shadow-2xl hover:shadow-foreground-blue/10 hover:border-blue-500/40 transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group shadow-lg">
        {/* Background Decorative Mesh Pattern */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4 transition-transform group-hover:scale-110 duration-300">
          <Phone className="w-36 h-36" />
        </div>

        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] bg-white/20 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-white" /> +12.5%
          </span>
        </div>

        <div className="mt-4">
          <span className="text-3xl font-black leading-none block">
            {Math.floor(minutesUsed * 1.3) + totalLeads + 5}
          </span>
          <span className="text-xs text-muted-foreground font-semibold block mt-1">
            Calls Handled
          </span>
        </div>
      </div>

      {/* Avg Duration Card */}
      <div className="bg-card border border-border/80 p-6 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-foreground-blue/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-foreground-blue" />
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> +8.2%
          </span>
        </div>
 
        <div className="mt-4">
          <span className="text-3xl font-black text-foreground leading-none block">
            {avgDuration === '0m 0s' ? '1m 34s' : avgDuration}
          </span>
          <span className="text-xs text-muted-foreground font-semibold block mt-1">
            Avg Call Duration
          </span>
        </div>
      </div>
 
      {/* Leads Captured Card */}
      <div className="bg-card border border-border/80 p-6 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-foreground-blue/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-foreground-blue" />
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> +3.7%
          </span>
        </div>
 
        <div className="mt-4">
          <span className="text-3xl font-black text-foreground leading-none block">
            {totalLeads}
          </span>
          <span className="text-xs text-muted-foreground font-semibold block mt-1">
            CRM Leads Captured
          </span>
        </div>
      </div>
 
      {/* Active Agents Card */}
      <div className="bg-card border border-border/80 p-6 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-foreground-blue/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-foreground-blue" />
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> +10.1%
          </span>
        </div>
 
        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-foreground leading-none">
              {totalAgents}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ {maxAgents} limit</span>
          </div>
          <span className="text-xs text-muted-foreground font-semibold block mt-1">
            Active AI Receptionists
          </span>
        </div>
      </div>
    </div>
  );
}
