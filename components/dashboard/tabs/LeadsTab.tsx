'use client';

import React from 'react';

interface Call {
  id: string;
  caller: string;
  intent: string;
  leadName: string;
}

interface LeadsTabProps {
  agentCalls: Call[];
}

export default function LeadsTab({ agentCalls }: LeadsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {agentCalls.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center text-xs text-muted-foreground font-semibold border border-border/60 col-span-full">
          No active CRM leads logged yet.
        </div>
      ) : (
        agentCalls.map((call) => (
          <div
            key={call.id}
            className="glass-panel p-6 rounded-2xl border-t-2 border-t-emerald-500 space-y-4 hover:border-zinc-500 transition-all border border-border/60"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-foreground text-sm">{call.leadName}</h4>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                  {call.caller}
                </p>
              </div>
              <span className="text-[8px]  bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                CRM Synced
              </span>
            </div>
            <div className="bg-card p-3 rounded-lg border border-border/80 space-y-1">
              <span className="text-[9px]  text-muted-foreground">
                Intent Captured:
              </span>
              <p className="text-xs text-foreground leading-normal">{call.intent}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
