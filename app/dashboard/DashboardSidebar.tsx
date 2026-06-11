'use client';
 
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  PhoneCall, 
  CreditCard, 
  Settings, 
  Plus, 
  LogOut, 
  ArrowUpRight, 
  Check 
} from 'lucide-react';
 
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
 
type DashboardTab = 'dashboard' | 'leads' | 'pricing' | 'settings';
 
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
 
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Calling Leads', icon: PhoneCall },
  { id: 'pricing', label: 'Pricing Plan', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;
 
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
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center  shadow-md font-bold">
            R
          </div>
          <span className="font-semibold text-lg text-foreground">
            Ringit<span className="text-foreground-blue">.ai</span>
          </span>
        </div>
 
        {/* Agent Switcher */}
        <div className="flex flex-col gap-2 relative">
          <span className="text-xs text-muted-foreground tracking-wider font-semibold">
            Active Receptionist
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 bg-card/65 border border-border rounded-xl py-2.5 px-3 text-sm text-foreground hover:border-zinc-400 focus:outline-none transition-colors cursor-pointer"
            >
              <span className="truncate text-left font-medium">
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
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        selectedAgentId === a.id
                          ? 'bg-foreground-blue/10 text-foreground-blue font-semibold'
                          : 'text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <span className="truncate">
                        {a.businessName} ({a.industry})
                      </span>
                      {selectedAgentId === a.id && (
                        <Check className="w-3.5 h-3.5 text-foreground-blue shrink-0" />
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
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-foreground-blue hover:bg-foreground-blue/5 transition-all flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Receptionist
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
 
        {/* Nav Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isTabActive = dashboardTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setDashboardTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
 
      {/* Bottom Panel */}
      <div className="border-t border-border pt-4 space-y-3">
        
           {/* Quota Usage Gauge or Skeleton */}
        {!billingInfo ? (
          <div className="glass-panel p-4 rounded-xl border border-border/50 bg-secondary/10 space-y-3 animate-pulse">
            <div className="flex justify-between items-center text-xs">
              <div className="h-3.5 w-16 bg-muted rounded-full" />
              <div className="h-3.5 w-8 bg-muted rounded-full" />
            </div>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div className="bg-muted h-1.5 rounded-full w-1/3" />
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="h-3 w-16 bg-muted rounded-full" />
              <div className="h-3 w-12 bg-muted rounded-full" />
            </div>
            <div className="border-t border-border/25 pt-2 flex justify-between">
              <div className="h-3 w-20 bg-muted rounded-full" />
              <div className="h-3 w-8 bg-muted rounded-full" />
            </div>
          </div>
        ) : (
        <div className="flex flex-col gap-1">

            <span className="text-md text-foreground-blue font-bold">
              {planLabel}
          </span>
          <div className="glass-panel p-4 rounded-xl border border-border/50 bg-secondary/20 space-y-2.5">
            <div className="flex justify-between items-center text-xs text-muted-foreground tracking-wide font-bold">
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
                className="w-full text-left text-xs font-black text-foreground-blue hover:underline flex items-center justify-center gap-1.5 pt-1 tracking-wider cursor-pointer"
              >
                Upgrade for higher limits <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        )}
      </div>
    </aside>
  );
}
