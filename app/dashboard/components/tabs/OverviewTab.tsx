'use client';

import React from 'react';

interface Agent {
  id: string;
  businessName: string;
  industry: string;
  phoneNumber: string;
  status: 'active' | 'paused';
}

interface OverviewTabProps {
  agents: Agent[];
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  setDashboardTab: (tab: 'dashboard' | 'agents' | 'pricing' | 'settings') => void;
  onNewAgentClick: () => void;
}

export default function OverviewTab({
  agents,
  selectedAgentId,
  setSelectedAgentId,
  setDashboardTab,
  onNewAgentClick,
}: OverviewTabProps) {
  // Mock monthly usage stats for the chart
  const monthlyStats = [
    { name: 'Jan', minutes: 80, calls: 45 },
    { name: 'Feb', minutes: 120, calls: 70 },
    { name: 'Mar', minutes: 190, calls: 110 },
    { name: 'Apr', minutes: 240, calls: 145 },
    { name: 'May', minutes: 310, calls: 185 },
    { name: 'Jun', minutes: 350, calls: 210 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      {/* Left: Monthly Stats Chart */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[360px]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Monthly Stats</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Calling volume and minute utilization</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-foreground-blue">
                <span className="w-2 h-2 rounded-full bg-foreground-blue" /> Calls (x10)
              </span>
              <span className="flex items-center gap-1 text-foreground/75">
                <span className="w-2 h-2 rounded-full bg-foreground/60" /> Minutes
              </span>
            </div>
          </div>

          {/* Premium CSS Chart */}
          <div className="h-52 flex items-end justify-between gap-4 pt-4 border-b border-border/40 px-2">
            {monthlyStats.map((stat) => {
              const maxVal = 400;
              const minutesHeight = `${(stat.minutes / maxVal) * 100}%`;
              const callsHeight = `${((stat.calls * 1.5) / maxVal) * 100}%`;

              return (
                <div key={stat.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                  <div className="w-full flex gap-1 h-full items-end justify-center relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-foreground text-background text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold whitespace-nowrap shadow-md">
                      {stat.minutes} mins • {stat.calls} calls
                    </div>
                    {/* Minutes bar */}
                    <div 
                      style={{ height: minutesHeight }} 
                      className="w-3 md:w-5 bg-foreground/15 rounded-t-md group-hover:bg-foreground/25 transition-all duration-300"
                    />
                    {/* Calls bar */}
                    <div 
                      style={{ height: callsHeight }} 
                      className="w-3 md:w-5 bg-foreground-blue/70 rounded-t-md group-hover:bg-foreground-blue transition-all duration-300 shadow-[0_0_12px_rgba(18,72,222,0.2)]"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold group-hover:text-foreground transition-colors">
                    {stat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-[10px] text-muted-foreground font-medium border-t border-border/25 pt-4">
          <span>Minutes usage up 24% from last month</span>
          <span className="text-foreground-blue font-semibold">Active utilization: 78.4%</span>
        </div>
      </div>

      {/* Right: AI Agents List */}
      <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[360px]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">AI Agents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Provisioned voice receptionists</p>
            </div>
            <button
              onClick={onNewAgentClick}
              className="bg-foreground-blue hover:bg-foreground-blue/90 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors shadow-md shrink-0 uppercase tracking-wide cursor-pointer"
            >
              + New Agent
            </button>
          </div>

          {/* List of Agents */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedAgentId === agent.id 
                    ? 'bg-foreground-blue/[0.03] border-foreground-blue/50 shadow-[0_0_12px_rgba(18,72,222,0.02)]' 
                    : 'bg-card/30 border-border/50 hover:border-zinc-400'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground truncate">{agent.businessName}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.status === 'active' ? 'bg-foreground-blue animate-pulse' : 'bg-muted-foreground'}`} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{agent.phoneNumber}</p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAgentId(agent.id);
                      setDashboardTab('settings');
                    }}
                    className="bg-secondary text-secondary-foreground hover:bg-border border border-border text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Setting
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAgentId(agent.id);
                      setDashboardTab('agents');
                    }}
                    className="bg-foreground-blue hover:bg-foreground-blue/90 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-[10px] text-muted-foreground font-medium border-t border-border/25 pt-4">
          Total agents: <strong className="text-foreground">{agents.length} active</strong>
        </div>
      </div>
    </div>
  );
}
