'use client';

import React from 'react';
import CallLogsTab from './CallLogsTab';

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
  return (
    <div className="space-y-6 animate-fade-in-up">
      <CallLogsTab agentCalls={agentCalls} />
    </div>
  );
}
