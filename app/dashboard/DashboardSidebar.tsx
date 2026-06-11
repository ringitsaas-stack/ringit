'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Agent {
  id: string;
  businessName: string;
  industry: string;
  status: 'active' | 'paused';
}

interface UserSession {
  id: string;
  email: string;
  fullName: string;
}

type DashboardTab = 'dashboard' | 'agents' | 'pricing' | 'settings';

interface DashboardSidebarProps {
  agents: Agent[];
  selectedAgentId: string;
  currentAgent: Agent | undefined;
  user: UserSession | null;
  dashboardTab: DashboardTab;
  isAgentDropdownOpen: boolean;
  setIsAgentDropdownOpen: (open: boolean) => void;
  setSelectedAgentId: (id: string) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  onSignOut: () => void;
  billingInfo: {
    subscription: {
      plan: string;
      status: string;
      max_agents: number;
      max_minutes: number;
    };
    usage: {
      agents_count: number;
      minutes_used: number;
      lifetime_minutes?: number;
    };
  } | null;
}

const NAV_ITEMS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'agents', label: 'Agents & Logs', icon: '📞' },
  { id: 'pricing', label: 'Pricing Plan', icon: '💳' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardSidebar({
  agents,
  selectedAgentId,
  currentAgent,
  user,
  dashboardTab,
  isAgentDropdownOpen,
  setIsAgentDropdownOpen,
  setSelectedAgentId,
  setDashboardTab,
  onSignOut,
  billingInfo,
}: DashboardSidebarProps) {
  const router = useRouter();

  const activePlan = billingInfo?.subscription?.plan || 'starter';
  const planLabel = activePlan.charAt(0).toUpperCase() + activePlan.slice(1) + ' Tier';
  
  const minutesUsed = billingInfo?.usage?.minutes_used ?? 0;
  const maxMinutes = billingInfo?.subscription?.max_minutes ?? 100;
  const usagePercentage = Math.min((minutesUsed / maxMinutes) * 100, 100);

  return (
    <aside className="w-64 border-r border-border/80 bg-card/40 backdrop-blur-md flex flex-col justify-between p-6 shrink-0 relative z-40">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center  shadow-md">
            R
          </div>
          <span className="font-semibold text-lg text-foreground">
            Ringit<span className="text-foreground-blue">.ai</span>
          </span>
        </div>

        {/* Agent Switcher */}
        <div className="flex flex-col gap-2 relative">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
            Active Receptionist
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 bg-card/65 border border-border rounded-xl py-2.5 px-3 text-sm text-foreground hover:border-zinc-400 focus:outline-none transition-colors"
            >
              <span className="truncate">
                {currentAgent
                  ? `${currentAgent.businessName} (${currentAgent.industry})`
                  : 'Select Agent'}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${
                  isAgentDropdownOpen ? 'rotate-180' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isAgentDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAgentDropdownOpen(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-1.5 min-w-[200px] max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-50 p-1.5 scrollbar-thin animate-fade-in">
                  {agents.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedAgentId(a.id);
                        setIsAgentDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        selectedAgentId === a.id
                          ? 'bg-foreground-blue/10 text-foreground-blue font-semibold'
                          : 'text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <span className="truncate">
                        {a.businessName} ({a.industry})
                      </span>
                      {selectedAgentId === a.id && (
                        <span className="text-xs">✓</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-border mt-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAgentDropdownOpen(false);
                        router.push('/onboarding');
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-foreground-blue hover:bg-foreground-blue/5 transition-all flex items-center gap-1 font-semibold"
                    >
                      <span>＋</span> Add Receptionist
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setDashboardTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                dashboardTab === item.id
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Quota Usage Gauge */}
        <div className="glass-panel p-4 rounded-xl border border-border/50 bg-secondary/20 space-y-2.5">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-wide font-bold">
            <span>Call Quota</span>
            <span className="text-foreground">{usagePercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-foreground-blue h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${minutesUsed > 0 ? Math.max(usagePercentage, 2) : 0}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
            <span>{minutesUsed.toFixed(1)} mins used</span>
            <span>{maxMinutes}m limit</span>
          </div>
          <div className="text-xs text-muted-foreground/80 border-t border-border/25 pt-2 flex justify-between font-medium">
            <span>Lifetime usage:</span>
            <span className=" text-foreground font-semibold">{(billingInfo?.usage?.lifetime_minutes ?? 0).toFixed(1)}m</span>
          </div>
          {activePlan !== 'agency' && (
            <button
              onClick={() => setDashboardTab('pricing')}
              className="w-full text-left text-xs font-black text-foreground-blue hover:underline block text-center pt-1 tracking-wider uppercase"
            >
              Upgrade for higher limits 🚀
            </button>
          )}
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="border-t border-border pt-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center  text-xs text-foreground border border-border shadow-sm shrink-0 font-bold">
            {user?.fullName.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-foreground truncate font-semibold">
              {user?.fullName}
            </span>
            <span className="text-xs text-foreground-blue uppercase tracking-wider font-bold">
              {planLabel}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSignOut}
            className="w-full text-center text-xs uppercase text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary px-3 py-2.5 rounded-lg transition-all border border-border tracking-wider font-bold"
          >
            Sign Out ⚡
          </button>
        </div>
      </div>
    </aside>
  );
}
