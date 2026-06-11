'use client';

import React from 'react';

interface Call {
  id: string;
  caller: string;
  duration: string;
  intent: string;
  summary: string;
  timestamp: string;
  leadName: string;
}

interface OverviewTabProps {
  agentCalls: Call[];
}

export default function OverviewTab({ agentCalls }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Recent Call Activities */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-base font-extrabold text-foreground">Recent Call Activities</h2>
        <div className="space-y-4">
          {agentCalls.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-xs text-muted-foreground font-semibold border border-border/60">
              📞 No call records logged for this agent. Make a call to test your AI receptionist!
            </div>
          ) : (
            agentCalls.map((call) => (
              <div
                key={call.id}
                className="glass-panel p-6 rounded-2xl space-y-4 hover:border-zinc-500 transition-all border border-border/60 animate-fade-in"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📞</span>
                    <div>
                      <div className=" text-foreground text-sm">{call.caller}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {call.timestamp} • Duration: {call.duration}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-secondary text-foreground font-semibold px-2 py-0.5 rounded-lg border border-border">
                    {call.intent}
                  </span>
                </div>
                <div className="bg-background/40 p-4 rounded-xl border border-border/80 space-y-1">
                  <div className="text-[9px]  text-muted-foreground uppercase tracking-widest">
                    AI Call Summary:
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{call.summary}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lead Pipeline */}
      <div className="space-y-6">
        <h2 className="text-base font-extrabold text-foreground">Lead Pipeline</h2>
        <div className="space-y-4">
          {agentCalls.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-muted-foreground font-semibold border border-border/60">
              No customer leads extracted.
            </div>
          ) : (
            agentCalls.map((call) => (
              <div
                key={call.id}
                className="glass-panel p-5 rounded-2xl border-l-2 border-l-emerald-500 space-y-3 hover:border-zinc-500 transition-all border border-border/40"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className=" text-foreground text-xs">{call.leadName}</div>
                    <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                      Caller: {call.caller}
                    </div>
                  </div>
                  <span className="text-[8px] uppercase  text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    New Lead
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-normal">
                  {call.intent}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
