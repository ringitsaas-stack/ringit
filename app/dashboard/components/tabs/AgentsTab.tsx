'use client';

import React, { useState } from 'react';
import CallLogsTab from './CallLogsTab';
import LeadsTab from './LeadsTab';

interface Call {
  id: string;
  caller: string;
  duration: string;
  intent: string;
  summary: string;
  transcript: string;
  timestamp: string;
  leadName: string;
}

interface AgentsTabProps {
  agentCalls: Call[];
}

export default function AgentsTab({
  agentCalls,
}: AgentsTabProps) {
  const [agentsSubTab, setAgentsSubTab] = useState<'calls' | 'leads'>('calls');

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Sub navigation bar */}
      <div className="flex gap-2 border-b border-border/40 pb-3">
        <button
          onClick={() => setAgentsSubTab('calls')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            agentsSubTab === 'calls'
              ? 'bg-foreground-blue text-white shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-border'
          }`}
        >
          📞 Call Logs
        </button>
        <button
          onClick={() => setAgentsSubTab('leads')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            agentsSubTab === 'leads'
              ? 'bg-foreground-blue text-white shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-border'
          }`}
        >
          👤 Leads Captured
        </button>
      </div>

      {/* Render sub tabs */}
      {agentsSubTab === 'calls' && <CallLogsTab agentCalls={agentCalls} />}
      {agentsSubTab === 'leads' && <LeadsTab agentCalls={agentCalls} />}
    </div>
  );
}
