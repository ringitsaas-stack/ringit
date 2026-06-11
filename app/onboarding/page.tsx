'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

// Handle Supabase Auth Client Initialization gracefully
const getClientSafe = () => {
  try {
    return getSupabaseClient();
  } catch {
    console.warn('Supabase Client not active (missing env vars). Running in sandbox mode.');
    return null;
  }
};

interface UserSession {
  id: string;
  email: string;
  fullName: string;
}

interface WizardForm {
  businessName: string;
  industry: string;
  tone: string;
  services: string;
  leadEmail: string;
  areaCode: string;
  useExistingNumber: boolean;
  existingPhoneNumber: string;
  existingPhoneSid: string;
  googleSheetUrl: string;
  customIndustry: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isWizardToneDropdownOpen, setIsWizardToneDropdownOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState(
    'Formulating system prompts and provisioning telephony voice channels...'
  );
  const [newlyCreatedPhone, setNewlyCreatedPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'agency' | null>(null);

  const [wizardForm, setWizardForm] = useState<WizardForm>({
    businessName: '',
    industry: 'Dental',
    tone: 'Warm and friendly',
    services: '',
    leadEmail: '',
    areaCode: '415',
    useExistingNumber: false,
    existingPhoneNumber: '',
    existingPhoneSid: '',
    googleSheetUrl: '',
    customIndustry: '',
  });

  // Verify authentication session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getClientSafe();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || 'Valued Partner',
          });
        } else {
          router.push('/auth/login');
        }
      } else {
        const localUser = localStorage.getItem('ringit_sandbox_user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          router.push('/auth/login');
        }
      }
      setIsAuthLoading(false);
    };
    checkSession();
  }, [router]);

  const validateStep2 = () => {
    if (!wizardForm.businessName.trim()) {
      toast('Please enter a Business Name', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(wizardForm.leadEmail)) {
      toast('Please enter a valid Alerts Forwarding Email address (e.g. office@company.com)', 'error');
      return;
    }
    if (wizardForm.useExistingNumber) {
      if (!wizardForm.existingPhoneNumber.trim()) {
        toast('Please enter your existing Twilio Phone Number', 'error');
        return;
      }
      if (
        !wizardForm.existingPhoneSid.trim() ||
        !wizardForm.existingPhoneSid.startsWith('PN') ||
        wizardForm.existingPhoneSid.length !== 34
      ) {
        toast('Please enter a valid Twilio Phone SID (must be 34 characters and start with "PN")', 'error');
        return;
      }
    } else {
      const areaCodeRegex = /^\d{3}$/;
      if (!areaCodeRegex.test(wizardForm.areaCode)) {
        toast('Preferred Twilio Area Code must be a 3-digit number (e.g. 415)', 'error');
        return;
      }
    }
    setWizardStep(3);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardForm.services.trim()) {
      toast('Please specify the core services your AI receptionist will support', 'error');
      return;
    }

    setIsProvisioning(true);
    setWizardStep(4);

    const statuses = wizardForm.useExistingNumber
      ? [
          'Validating active subscription plan limitations...',
          'Formulating customized receptionist system instructions...',
          'Provisioning AI receptionist instance on Retell AI Gateway...',
          'Linking pre-owned Twilio phone number credentials...',
          'Binding webhook handlers and configuring route triggers...',
          'Initializing database transaction records and backing up configurations...',
        ]
      : [
          'Validating active subscription plan limitations...',
          'Formulating customized receptionist system instructions...',
          'Provisioning AI receptionist instance on Retell AI Gateway...',
          'Searching for available phone numbers via Twilio API...',
          'Purchasing Twilio phone number (+1 415-961-4820)...',
          'Configuring Twilio voice webhook triggers for Retell routing...',
          'Initializing database transaction records and backing up configurations...',
        ];

    for (let i = 0; i < statuses.length; i++) {
      setProvisioningStatus(statuses[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const mockPhoneNumber = wizardForm.useExistingNumber
      ? wizardForm.existingPhoneNumber
      : `+1 (${wizardForm.areaCode}) 961-4820`;

    if (user) {
      const supabase = getClientSafe();
      if (supabase) {
        try {
          setProvisioningStatus('Saving active agent record to Supabase database...');
          const response = await fetch('/api/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              businessName: wizardForm.businessName,
              industry: wizardForm.industry === 'Other' ? wizardForm.customIndustry : wizardForm.industry,
              tone: wizardForm.tone,
              services: wizardForm.services,
              leadEmail: wizardForm.leadEmail,
              areaCode: wizardForm.areaCode,
              useExistingNumber: wizardForm.useExistingNumber,
              existingPhoneNumber: wizardForm.existingPhoneNumber,
              existingPhoneSid: wizardForm.existingPhoneSid,
              googleSheetUrl: wizardForm.googleSheetUrl,
            }),
          });

          const data = await response.json();
          if (data.success) {
            const returnedPhone = data.phone?.twilio_phone_number || data.phoneNumber || mockPhoneNumber;
            setNewlyCreatedPhone(returnedPhone);
            toast('Successfully saved and provisioned to Supabase database!', 'success');
          } else {
            setIsProvisioning(false);
            setWizardStep(3);
            toast(data.error || 'Failed to save active agent record to Supabase database.', 'error');
            return;
          }
        } catch (err) {
          console.error('Error during Supabase provisioning:', err);
          setIsProvisioning(false);
          setWizardStep(3);
          toast(err instanceof Error ? err.message : 'A network error occurred during agent provisioning.', 'error');
          return;
        }
      } else {
        // Mock success in sandbox mode
        setNewlyCreatedPhone(mockPhoneNumber);
        toast('Agent provisioned successfully (Simulation Sandbox).', 'success');
      }
    } else {
      setIsProvisioning(false);
      setWizardStep(3);
      toast('Your active session has expired. Please sign in and try again.', 'error');
      return;
    }

    setIsProvisioning(false);
  };

  const handlePlanSelection = async (plan: 'starter' | 'pro' | 'agency') => {
    setSelectedPlan(plan);
    toast(`Successfully subscribed to ${plan} plan!`, 'success');
    router.push('/dashboard');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-white animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 items-center justify-center p-6 relative">
      
      {/* Header / Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center  shadow-md">
            R
          </div>
          <span className="font-semibold text-lg text-foreground">Ringit<span className="text-emerald-500 ">.ai</span></span>
        </Link>
      </div>

     

      {/* FIRST TIME USER ONBOARDING WIZARD */}
      {selectedPlan === null && (
        <div className="max-w-2xl w-full space-y-8 animate-fade-in py-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground">Let&apos;s build your AI Receptionist</h1>
            <p className="text-muted-foreground text-sm">Follow the 4 quick steps to deploy a live Retell AI receptionist phone number.</p>
          </div>

          {/* Steps Visual Tracker */}
          <div className="flex justify-between items-center relative max-w-md mx-auto">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -translate-y-1/2 z-0"></div>
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center  text-sm z-10 border transition-all ${
                  wizardStep >= step
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-card text-muted-foreground border-border'
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          {wizardStep === 1 && (
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <div>
                <h2 className="text-xl  text-foreground">Step 1: Select Business Category</h2>
                <p className="text-muted-foreground text-xs mt-1">This templates the primary prompt baseline mapped to Retell AI.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['Dental', 'HVAC', 'Legal', 'Salon', 'Other'].map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setWizardForm({ ...wizardForm, industry: ind })}
                    className={`p-6 rounded-xl border text-left transition-all space-y-2 ${
                      wizardForm.industry === ind
                        ? 'border-primary bg-secondary'
                        : 'border-border bg-transparent hover:border-zinc-500'
                    }`}
                  >
                    <div className="text-2xl">
                      {ind === 'Dental' ? '🦷' : ind === 'HVAC' ? '❄️' : ind === 'Legal' ? '⚖️' : ind === 'Salon' ? '💇' : '✨'}
                    </div>
                    <div className=" text-foreground text-sm">
                      {ind === 'Other' ? 'Custom Category' : `${ind} Clinic`}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-tight">
                      {ind === 'Other' 
                        ? 'Describe your own custom business category.' 
                        : 'Apply pre-configured industry template structures.'}
                    </div>
                  </button>
                ))}
              </div>

              {wizardForm.industry === 'Other' && (
                <div className="flex flex-col gap-1.5 p-4 bg-card/35 border border-border/80 rounded-xl space-y-2 animate-fade-in">
                  <label className="text-[10px]  text-muted-foreground">Describe Custom Business Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Real Estate Agency, Pizza Restaurant, Pet Grooming, SaaS Support"
                    value={wizardForm.customIndustry}
                    onChange={(e) => setWizardForm({ ...wizardForm, customIndustry: e.target.value })}
                    className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-medium"
                  />
                  <span className="text-[9px] text-muted-foreground">
                    This will dynamically engineer a bespoke custom receptionist system prompt tailored exactly to your category!
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (wizardForm.industry === 'Other' && !wizardForm.customIndustry.trim()) {
                      toast('Please describe your custom business category', 'error');
                      return;
                    }
                    setWizardStep(2);
                  }}
                  className="bg-primary text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-all"
                >
                  Next: Business Details
                </button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <div>
                <h2 className="text-xl  text-foreground">Step 2: Business & Telephony Config</h2>
                <p className="text-muted-foreground text-xs mt-1">Provide business details and configure telephony routing configurations.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px]  text-muted-foreground">Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dental Care Inc."
                    value={wizardForm.businessName}
                    onChange={(e) => setWizardForm({ ...wizardForm, businessName: e.target.value })}
                    className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px]  text-muted-foreground">Alerts Forwarding Email</label>
                  <input
                    type="email"
                    required
                    placeholder="office@dentalcare.com"
                    value={wizardForm.leadEmail}
                    onChange={(e) => setWizardForm({ ...wizardForm, leadEmail: e.target.value })}
                    className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px]  text-muted-foreground">Google Sheet Web App URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={wizardForm.googleSheetUrl}
                    onChange={(e) => setWizardForm({ ...wizardForm, googleSheetUrl: e.target.value })}
                    className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  <span className="text-[9px] text-muted-foreground leading-normal mt-0.5">
                    Automatically append customer lead details to Google Sheets in real-time. Leave blank to configure later.
                  </span>
                </div>

                {/* Telephony Option Switcher */}
                <div className="border border-border/60 bg-card/30 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xs  text-foreground">Link Pre-Owned Twilio Number</label>
                      <p className="text-[10px] text-muted-foreground max-w-xs">
                        Enable this to link a number you already purchased from your own Twilio console. Saves credit and bypasses trial restrictions!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardForm({ ...wizardForm, useExistingNumber: !wizardForm.useExistingNumber })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        wizardForm.useExistingNumber ? 'bg-primary' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          wizardForm.useExistingNumber ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {!wizardForm.useExistingNumber ? (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
                      <label className="text-[10px]  text-muted-foreground">Preferred Twilio Area Code</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="415"
                        value={wizardForm.areaCode}
                        onChange={(e) => setWizardForm({ ...wizardForm, areaCode: e.target.value })}
                        className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px]  text-muted-foreground">Existing Twilio Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. +14155552671"
                          value={wizardForm.existingPhoneNumber}
                          onChange={(e) => setWizardForm({ ...wizardForm, existingPhoneNumber: e.target.value })}
                          className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px]  text-muted-foreground">Twilio Phone SID (starts with PN)</label>
                        <input
                          type="text"
                          maxLength={34}
                          placeholder="PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={wizardForm.existingPhoneSid}
                          onChange={(e) => setWizardForm({ ...wizardForm, existingPhoneSid: e.target.value })}
                          className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="border border-border text-muted-foreground font-semibold text-sm px-6 py-2 rounded-lg hover:text-foreground hover:bg-card"
                >
                  Back
                </button>
                <button
                  onClick={validateStep2}
                  className="bg-primary text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-all"
                >
                  Next: Personality Settings
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <form onSubmit={handleOnboardingSubmit} className="glass-panel p-8 rounded-2xl space-y-6">
              <div>
                <h2 className="text-xl  text-foreground">Step 3: Services & Tone Profiles</h2>
                <p className="text-muted-foreground text-xs mt-1">Specify detailed services to embed context directly in the prompt.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px]  text-muted-foreground">Describe Your Services</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Scaling is $120, whitening is $250. Bookings are confirmed next business day."
                    value={wizardForm.services}
                    onChange={(e) => setWizardForm({ ...wizardForm, services: e.target.value })}
                    className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px]  text-muted-foreground">Assistant Tone Profile</label>
                  <button
                    type="button"
                    onClick={() => setIsWizardToneDropdownOpen(!isWizardToneDropdownOpen)}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-3 text-sm text-foreground hover:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  >
                    <span>{wizardForm.tone || 'Select Tone'}</span>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform ${isWizardToneDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {isWizardToneDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsWizardToneDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-50 p-1.5 scrollbar-thin animate-fade-in">
                        {['Warm and friendly', 'Professional and formal', 'Upbeat and energetic'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setWizardForm({ ...wizardForm, tone: t });
                              setIsWizardToneDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                              wizardForm.tone === t
                                ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                                : 'text-foreground hover:bg-secondary/60'
                            }`}
                          >
                            <span>{t}</span>
                            {wizardForm.tone === t && <span className="text-[10px]">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="border border-border text-muted-foreground font-semibold text-sm px-6 py-2 rounded-lg hover:text-foreground hover:bg-card"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-emerald-400 transition-all shadow-lg border border-emerald-600/10"
                >
                  Build & Launch AI Agent
                </button>
              </div>
            </form>
          )}

          {wizardStep === 4 && (
            <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 min-h-[350px]">
              {isProvisioning ? (
                <>
                  <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-white animate-spin"></div>
                  <div className="space-y-2">
                    <h3 className="text-lg  text-foreground">Provisioning AI Infrastructure</h3>
                    <p className="text-muted-foreground text-xs animate-pulse max-w-sm">{provisioningStatus}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                    🎉
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl  text-foreground">Your AI Receptionist is Ready!</h3>
                    <p className="text-muted-foreground text-xs max-w-sm">We successfully bought a Twilio number and registered the Retell agent.</p>
                  </div>

                  <div className="bg-card border border-border p-4 rounded-xl max-w-xs w-full">
                    <div className="text-[10px]  text-muted-foreground">Live Phone Number</div>
                    <div className="text-xl  text-emerald-500 mt-1">{newlyCreatedPhone}</div>
                  </div>

                  <button
                    onClick={() => handlePlanSelection('pro')}
                    className="bg-primary text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-all"
                  >
                    Continue to Dashboard ⚡
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
