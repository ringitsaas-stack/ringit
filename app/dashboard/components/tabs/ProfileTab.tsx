'use client';

import React, { useState, useEffect } from 'react';
import { User, CreditCard, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface UserType {
  id?: string;
  email?: string;
  fullName?: string;
  provider?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface BillingInfoType {
  subscription?: {
    plan: string;
    status: string;
    max_agents: number;
    max_minutes: number;
    current_period_end?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  };
  usage?: {
    minutes_used: number;
  };
}

interface ProfileTabProps {
  user: UserType | null;
  billingInfo: BillingInfoType | null;
  activePlan?: string;
}

export default function ProfileTab({ user, billingInfo, activePlan = 'starter' }: ProfileTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFormFullName(user.fullName || user.user_metadata?.full_name || '');
      setFormEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsUpdating(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: formFullName,
          email: formEmail,
          password: formPassword || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast('Profile updated successfully!', 'success');
        setFormPassword('');
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      toast(err.message || 'An error occurred during update.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user?.id) {
      toast('User authentication details are missing. Please sign in again.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal session redirection URL received from payment server.');
      }
    } catch (error: any) {
      console.error('Billing portal redirection failure:', error);
      toast(error.message || 'Unable to open billing portal. Please subscribe to a paid plan first.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your Ringit.ai account? This action is irreversible.')) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await response.json();
      if (data.success) {
        toast('Account soft-deleted successfully. Signing out...', 'success');
        localStorage.removeItem('ringit_sandbox_user');
        localStorage.removeItem('ringit_dashboard_tab');
        window.location.href = '/auth/login';
      } else {
        throw new Error(data.error || 'Failed to soft delete profile');
      }
    } catch (err: any) {
      toast(err.message || 'Error occurred during account deletion.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Edit Card */}
        <form onSubmit={handleUpdateProfile} className="glass-panel p-8 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[420px]">
          <div className="space-y-4">
            <div>
              <h2 className="text-md font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-foreground-blue" /> Account Profile Info
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your registered user details and login identifiers.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Account Holder</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="text-sm font-semibold text-foreground bg-card/40 border border-border/40 px-3.5 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="text-sm font-semibold text-foreground bg-card/40 border border-border/40 px-3.5 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              {user?.provider !== 'google' && user?.provider !== 'google.com' && (
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <label className="text-xs text-muted-foreground font-semibold">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="text-sm font-semibold text-foreground bg-card/40 border border-border/40 px-3.5 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border/40">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full text-xs font-bold bg-foreground-blue hover:bg-foreground-blue/90 text-white px-4 py-3 rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(18,72,222,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? 'Saving Profile Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Billing Card */}
        <div className="glass-panel p-8 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[420px]">
          <div className="space-y-5">
            <div>
              <h2 className="text-md font-semibold text-foreground flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-foreground-blue" /> Plan &amp; Billing Summary
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your subscription limit tiers, monthly usage gauges, and renewal date.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 bg-card/40 border border-border/40 p-3 rounded-xl">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Current Tier</span>
                <span className="text-sm font-extrabold text-foreground-blue uppercase">
                  {billingInfo?.subscription?.plan || activePlan || 'Starter'}
                </span>
              </div>
              <div className="flex flex-col gap-1 bg-card/40 border border-border/40 p-3 rounded-xl">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Plan Status</span>
                <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {billingInfo?.subscription?.status ? billingInfo?.subscription?.status.charAt(0).toUpperCase() + billingInfo?.subscription?.status.slice(1) : 'Active'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold">Monthly Minutes Quota</span>
                <span className="text-foreground font-black">
                  {billingInfo?.usage?.minutes_used?.toFixed(1) || '0.0'} / {billingInfo?.subscription?.max_minutes || 100} mins
                </span>
              </div>
              <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden border border-border/30">
                <div 
                  className="h-full bg-foreground-blue rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(18,72,222,0.3)]" 
                  style={{ width: `${Math.min(((billingInfo?.usage?.minutes_used || 0) / (billingInfo?.subscription?.max_minutes || 100)) * 100, 100)}%` }}
                />
              </div>
              {billingInfo?.subscription?.current_period_end && (
                <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed">
                  Your monthly call quota resets on <strong>{new Date(billingInfo.subscription.current_period_end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                </p>
              )}
            </div>

            {/* Stripe Portal Integration & Explanation */}
            <div className="pt-4 border-t border-border/40 space-y-4">
              <div className="text-[10px] text-muted-foreground font-semibold leading-relaxed space-y-2">
                <div className="flex items-start gap-1.5 text-foreground/80 font-bold">
                  <span className="text-foreground-blue mt-0.5">•</span>
                  <div>
                    <p className="text-foreground/90 text-sm font-bold">Cancel or Delete Plan</p>
                    <p className="font-medium text-xs text-muted-foreground mt-0.5 leading-normal">
                      You can cancel your active subscription anytime. Your limits will remain active until the end of your billing cycle.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-1.5 text-foreground/80 font-bold">
                  <span className="text-foreground-blue mt-0.5">•</span>
                  <div>
                    <p className="text-foreground/90 text-sm font-bold">View Invoices &amp; Old Plans</p>
                    <p className="font-medium text-xs text-muted-foreground mt-0.5 leading-normal">
                      Access your full billing history, view previous invoice cycles, update card details, or download receipts securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/40">
            <button
              onClick={handleManageBilling}
              disabled={isLoading}
              className="w-full text-xs font-bold bg-foreground-blue hover:bg-foreground-blue/90 text-white px-4 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(18,72,222,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting to Secure Stripe Portal...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Manage Billing &amp; Plans
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Danger Zone / Soft Account Deactivation */}
      <div className="glass-panel p-6 rounded-2xl border border-red-500/25 bg-red-500/5 space-y-4 animate-fade-in-up">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-500">Deactivate Ringit.ai Account</h3>
            <p className="text-xs text-red-400 font-semibold leading-normal">
              Deactivating your profile will delete your details. You will be logged out immediately.
            </p>
          </div>
        </div>
        <div className="flex justify-end pt-3 border-t border-red-500/10">
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </div>

    </div>
  );
}
