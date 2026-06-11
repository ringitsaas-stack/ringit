'use client';

import React from 'react';

interface Agent {
  id: string;
  businessName: string;
  industry: string;
  phoneNumber: string;
  status: 'active' | 'paused';
}

interface Call {
  id: string;
  caller: string;
  duration: string;
  timestamp: string;
  transcript: string;
  summary: string;
  leadName?: string;
  intent?: string;
  date?: string;
}

interface OverviewTabProps {
  agents: Agent[];
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  setDashboardTab: (tab: 'dashboard' | 'leads' | 'pricing' | 'settings') => void;
  onNewAgentClick: () => void;
  agentCalls: Call[];
  allCalls?: Call[];
}

export default function OverviewTab({
  agents,
  selectedAgentId,
  setSelectedAgentId,
  setDashboardTab,
  onNewAgentClick,
  agentCalls,
  allCalls = [],
}: OverviewTabProps) {
  const [timeframe, setTimeframe] = React.useState<'weekly' | 'monthly'>('monthly');
  const [agentScope, setAgentScope] = React.useState<'current' | 'all'>('current');

  // Select target calls based on agentScope
  const callsToUse = agentScope === 'current' ? agentCalls : allCalls;

  // Group actual calls by week dynamically for the chart (last 6 weeks)
  const getWeeklyStats = () => {
    const getMonday = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(date.setDate(diff));
      mon.setHours(0, 0, 0, 0);
      return mon;
    };

    // Initialize stats for the last 6 weeks (week starting on Monday)
    const stats = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      // subtract weeks
      d.setDate(d.getDate() - (5 - i) * 7);
      const mon = getMonday(d);
      const nextMon = new Date(mon);
      nextMon.setDate(mon.getDate() + 7);
      
      const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const name = mon.toLocaleDateString('en-US', formatOptions);
      return {
        name,
        startOfWeek: mon,
        endOfWeek: nextMon,
        minutes: 0,
        calls: 0
      };
    });

    callsToUse.forEach(call => {
      let callDate = new Date();
      if (call.date) {
        callDate = new Date(call.date);
      }
      
      if (isNaN(callDate.getTime())) return;
      
      const matchedStat = stats.find(s => callDate >= s.startOfWeek && callDate < s.endOfWeek);
      if (matchedStat) {
        matchedStat.calls += 1;
        
        let mins = 0;
        const matchMins = call.duration.match(/(\d+)m/);
        if (matchMins) {
          mins = Number(matchMins[1]);
        }
        const matchSecs = call.duration.match(/(\d+)s/);
        if (matchSecs) {
          mins += Number(matchSecs[1]) / 60;
        }
        matchedStat.minutes += mins;
      }
    });

    return stats.map(s => ({
      name: s.name,
      minutes: Number(s.minutes.toFixed(1)),
      calls: s.calls
    }));
  };

  // Group actual calls by month dynamically for the chart (last 6 months)
  const getMonthlyStats = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize stats for the last 6 months
    const stats = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        name: months[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        minutes: 0,
        calls: 0
      };
    });

    callsToUse.forEach(call => {
      let callDate = new Date();
      if (call.date) {
        callDate = new Date(call.date);
      }
      
      if (isNaN(callDate.getTime())) return;
      
      const mIndex = callDate.getMonth();
      const yVal = callDate.getFullYear();
      
      const matchedStat = stats.find(s => s.monthIndex === mIndex && s.year === yVal);
      if (matchedStat) {
        matchedStat.calls += 1;
        
        let mins = 0;
        const matchMins = call.duration.match(/(\d+)m/);
        if (matchMins) {
          mins = Number(matchMins[1]);
        }
        const matchSecs = call.duration.match(/(\d+)s/);
        if (matchSecs) {
          mins += Number(matchSecs[1]) / 60;
        }
        matchedStat.minutes += mins;
      }
    });

    return stats.map(s => ({
      name: s.name,
      minutes: Number(s.minutes.toFixed(1)),
      calls: s.calls
    }));
  };

  const chartStats = timeframe === 'weekly' ? getWeeklyStats() : getMonthlyStats();
  const totalCallsCount = chartStats.reduce((sum, s) => sum + s.calls, 0);
  const totalMinutesCount = chartStats.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      {/* Left: Stats Chart */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[480px]">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Calling Volume</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time minute and call statistics</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Toggles Container */}
              <div className="flex items-center gap-2">
                {/* Agent Scope Toggle */}
                <div className="bg-muted/45 p-0.5 rounded-lg border border-border/40 flex gap-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setAgentScope('current')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      agentScope === 'current'
                        ? 'bg-foreground-blue text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Active Agent
                  </button>
                  <button
                    onClick={() => setAgentScope('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      agentScope === 'all'
                        ? 'bg-foreground-blue text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Agents
                  </button>
                </div>

                {/* Timeframe Toggle */}
                <div className="bg-muted/45 p-0.5 rounded-lg border border-border/40 flex gap-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setTimeframe('weekly')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      timeframe === 'weekly'
                        ? 'bg-foreground-blue text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimeframe('monthly')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      timeframe === 'monthly'
                        ? 'bg-foreground-blue text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-bold sm:border-l sm:border-border/40 sm:pl-3">
                <span className="flex items-center gap-1 text-foreground-blue">
                  <span className="w-2 h-2 rounded-full bg-foreground-blue" /> Calls
                </span>
                <span className="flex items-center gap-1 text-foreground/75">
                  <span className="w-2 h-2 rounded-full bg-foreground/60" /> Minutes
                </span>
              </div>
            </div>
          </div>

          {/* CSS Chart */}
          <div className="h-72 flex items-end justify-between gap-4 pt-4 border-b border-border/40 px-2">
            {chartStats.map((stat) => {
              // Get max calls & minutes dynamically to scale the chart bars
              const maxCalls = Math.max(...chartStats.map(s => s.calls), 5);
              const maxMins = Math.max(...chartStats.map(s => s.minutes), 5);
              
              const minutesHeight = `${(stat.minutes / maxMins) * 100}%`;
              const callsHeight = `${(stat.calls / maxCalls) * 100}%`;

              return (
                <div key={stat.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                  <div className="w-full flex gap-1.5 h-full items-end justify-center relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-zinc-950 text-white text-[9px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold whitespace-nowrap shadow-md border border-zinc-800">
                      {stat.minutes} mins • {stat.calls} calls
                    </div>
                    {/* Minutes bar */}
                    <div 
                      style={{ height: stat.minutes > 0 ? minutesHeight : '2px' }} 
                      className="w-3 md:w-5 bg-foreground/15 rounded-t-md group-hover:bg-foreground/25 transition-all duration-300"
                    />
                    {/* Calls bar */}
                    <div 
                      style={{ height: stat.calls > 0 ? callsHeight : '2px' }} 
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
          <span>Total synced: {totalMinutesCount.toFixed(1)} mins</span>
          <span className="text-foreground-blue font-semibold">Calls Resolved: {totalCallsCount}</span>
        </div>
      </div>

      {/* Right: AI Agents List */}
      <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[480px]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Agents</h2>
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
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
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
                      setDashboardTab('leads');
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
