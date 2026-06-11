'use client';

import React from 'react';

interface Call {
  id: string;
  caller: string;
  duration: string;
  timestamp: string;
  transcript: string;
}

interface CallLogsTabProps {
  agentCalls: Call[];
}

export default function CallLogsTab({ agentCalls }: CallLogsTabProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6 animate-fade-in border border-border/60">
      <h2 className="text-base font-extrabold text-foreground">
        Voice Recordings &amp; Transcript Feed
      </h2>
      <div className="space-y-8">
        {agentCalls.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center text-xs text-muted-foreground font-semibold border border-border/40">
            No transcripts logged for this agent.
          </div>
        ) : (
          agentCalls.map((call) => (
            <div
              key={call.id}
              className="border-b border-border pb-6 last:border-b-0 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-foreground text-sm">
                  {call.caller} ({call.timestamp})
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Duration: {call.duration}
                </span>
              </div>
              <div className="bg-card p-4 rounded-xl font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-line max-h-48 overflow-y-auto border border-border/80">
                {call.transcript || 'Transcribing call recording audio...'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
