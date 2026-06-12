'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { getSupabaseClient } from '@/shared/lib/supabase-client';

// Handle Supabase Auth Client Initialization gracefully
const getClientSafe = () => {
  try {
    return getSupabaseClient();
  } catch {
    console.warn('Supabase Client not active (missing env vars). Running in sandbox mode.');
    return null;
  }
};

interface WizardForm {
  businessName: string;
  industry: string;
  tone: string;
  services: string;
  leadEmail: string;
  countryCode: string;
  areaCode: string;
  useExistingNumber: boolean;
  existingPhoneNumber: string;
  existingPhoneSid: string;
  googleSheetUrl: string;
  customIndustry: string;
}

const ONBOARDING_VERTICALS = [
  {
    icon: "🔧",
    id: "Auto Repair",
    title: "Auto Repair",
    desc: "Books service, gives ballpark quotes, schedules pickup.",
  },
  {
    icon: "🎨",
    id: "Design Studios",
    title: "Design Studios",
    desc: "Qualifies projects, quotes ranges, books project calls.",
  },
  {
    icon: "💪",
    id: "Gyms & Fitness",
    title: "Gyms & Fitness",
    desc: "Books tours, handles class signups, answers membership questions.",
  },
  {
    icon: "⚕️",
    id: "Healthcare",
    title: "Healthcare",
    desc: "Triages appointments, handles urgent calls, answers insurance questions.",
  },
  {
    icon: "⚖️",
    id: "Law Firms",
    title: "Law Firms",
    desc: "Routes case types, takes intake info, books consultations.",
  },
  {
    icon: "📢",
    id: "Marketing Agencies",
    title: "Marketing Agencies",
    desc: "Qualifies leads, books discovery calls, quotes ranges.",
  },
  {
    icon: "📷",
    id: "Photography",
    title: "Photography",
    desc: "Books shoots, quotes packages, captures wedding inquiries.",
  },
  {
    icon: "🏠",
    id: "Real Estate",
    title: "Real Estate",
    desc: "Schedules showings, answers listing questions, captures buyer leads.",
  },
  {
    icon: "🍳",
    id: "Restaurants",
    title: "Restaurants",
    desc: "Takes reservations, answers menu questions, handles takeout.",
  },
  {
    icon: "💇",
    id: "Salons",
    title: "Salons",
    desc: "Books appointments, lists services, handles reschedules.",
  },
  {
    icon: "🐾",
    id: "Veterinary",
    title: "Veterinary",
    desc: "Books visits, handles urgent calls, answers vaccination questions.",
  },
  {
    icon: "🧘",
    id: "Yoga",
    title: "Yoga",
    desc: "Books classes, manages memberships, handles drop-ins.",
  },
  {
    icon: "✨",
    id: "Other",
    title: "Custom Category",
    desc: "Describe your own custom business category.",
  },
];

interface OnboardingTabProps {
  user: any;
  setDashboardTab: (tab: any) => void;
  setAgents: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedAgentId: (id: string) => void;
  fetchBillingInfo: (userId: string) => void;
}

export default function OnboardingTab({
  user,
  setDashboardTab,
  setAgents,
  setSelectedAgentId,
  fetchBillingInfo,
}: OnboardingTabProps) {
  const { toast } = useToast();
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isWizardToneDropdownOpen, setIsWizardToneDropdownOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState(
    'Formulating system prompts and provisioning telephony voice channels...'
  );
  const [newlyCreatedPhone, setNewlyCreatedPhone] = useState('');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [wizardForm, setWizardForm] = useState<WizardForm>({
    businessName: '',
    industry: 'Auto Repair',
    tone: 'Warm and friendly',
    services: '',
    leadEmail: user?.email || '',
    countryCode: 'US',
    areaCode: '',
    useExistingNumber: false,
    existingPhoneNumber: '',
    existingPhoneSid: '',
    googleSheetUrl: '',
    customIndustry: '',
  });

  const handleAIGenerate = async () => {
    const businessName = wizardForm.businessName.trim();
    const industry = wizardForm.industry === 'Other' ? wizardForm.customIndustry.trim() : wizardForm.industry;

    if (!businessName) {
      toast('Please enter a business name first (Step 2).', 'error');
      setWizardStep(2);
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, industry })
      });
      const data = await res.json();
      if (data.success) {
        setWizardForm(prev => ({
          ...prev,
          services: data.services,
          tone: data.tone
        }));
        toast('Services and Tone Profile generated successfully with AI! ✨', 'success');
      } else {
        toast(data.error || 'Failed to generate profile.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      toast('An error occurred during AI generation.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

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
      const countryCodeRegex = /^[A-Z]{2}$/i;
      if (!countryCodeRegex.test(wizardForm.countryCode)) {
        toast('Preferred Twilio Country Code must be a 2-letter country code (e.g. US, CA, GB)', 'error');
        return;
      }
      if (wizardForm.areaCode.trim()) {
        const areaCodeRegex = /^\d{3}$/;
        if (!areaCodeRegex.test(wizardForm.areaCode)) {
          toast('Preferred Twilio Area Code must be a 3-digit number (e.g. 415)', 'error');
          return;
        }
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
          'Purchasing Twilio phone number...',
          'Configuring Twilio voice webhook triggers for Retell routing...',
          'Initializing database transaction records and backing up configurations...',
        ];

    for (let i = 0; i < statuses.length; i++) {
      setProvisioningStatus(statuses[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const mockPhoneNumber = wizardForm.useExistingNumber
      ? wizardForm.existingPhoneNumber
      : `+${wizardForm.countryCode === 'GB' ? '44' : wizardForm.countryCode === 'AU' ? '61' : wizardForm.countryCode === 'DE' ? '49' : wizardForm.countryCode === 'FR' ? '33' : wizardForm.countryCode === 'IN' ? '91' : wizardForm.countryCode === 'NZ' ? '64' : wizardForm.countryCode === 'IE' ? '353' : wizardForm.countryCode === 'SG' ? '65' : wizardForm.countryCode === 'NL' ? '31' : wizardForm.countryCode === 'ES' ? '34' : wizardForm.countryCode === 'IT' ? '39' : '1'} (555) 961-4820`;

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
              countryCode: wizardForm.countryCode,
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
            
            // Append agent to local dashboard state
            const newAgent = {
              id: data.agentId || data.agent?.id || Math.random().toString(),
              businessName: wizardForm.businessName,
              industry: wizardForm.industry === 'Other' ? wizardForm.customIndustry : wizardForm.industry,
              tone: wizardForm.tone,
              services: wizardForm.services,
              leadEmail: wizardForm.leadEmail,
              phoneNumber: returnedPhone,
              status: 'active' as const,
              voiceId: 'openai-Alloy',
              llmModel: 'gpt-4o-mini',
              language: 'English (US)',
            };
            setAgents((prev) => [...prev, newAgent]);
            setSelectedAgentId(newAgent.id);
            fetchBillingInfo(user.id);

            toast('Successfully saved and provisioned new receptionist!', 'success');
          } else {
            setIsProvisioning(false);
            setWizardStep(3);
            toast(data.error || 'Failed to save active agent record to Supabase.', 'error');
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
        // Sandbox mode
        setNewlyCreatedPhone(mockPhoneNumber);
        const newAgent = {
          id: 'sandbox-mock-' + Math.random(),
          businessName: wizardForm.businessName,
          industry: wizardForm.industry === 'Other' ? wizardForm.customIndustry : wizardForm.industry,
          tone: wizardForm.tone,
          services: wizardForm.services,
          leadEmail: wizardForm.leadEmail,
          phoneNumber: mockPhoneNumber,
          status: 'active' as const,
          voiceId: 'openai-Alloy',
          llmModel: 'gpt-4o-mini',
          language: 'English (US)',
        };
        setAgents((prev) => [...prev, newAgent]);
        setSelectedAgentId(newAgent.id);
        toast('Agent provisioned successfully (Simulation Sandbox).', 'success');
      }
    } else {
      setIsProvisioning(false);
      setWizardStep(3);
      toast('Your active session has expired. Please sign in and try again.', 'error');
      return;
    }

    setIsProvisioning(false);
    setDashboardTab('dashboard');
  };

  return (
    <div className="w-full space-y-8 animate-fade-in py-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-foreground">Let&apos;s build your AI Receptionist</h1>
        <p className="text-muted-foreground text-sm font-medium">Follow the 3 quick steps to deploy a live Retell AI receptionist phone number.</p>
      </div>

      {/* Steps Visual Tracker */}
      <div className="flex justify-between items-center relative max-w-md mx-auto">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -translate-y-1/2 z-0"></div>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm z-10 border transition-all font-bold ${
              wizardStep >= step
                ? 'bg-foreground-blue text-white border-foreground-blue shadow-[0_0_12px_rgba(18,72,222,0.4)]'
                : 'bg-card text-muted-foreground border-border'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Step Contents */}
      {wizardStep === 1 && (
        <div className="glass-panel p-8 rounded-2xl border border-border/60 bg-card/45 space-y-6">
          <div>
            <h2 className="text-xl text-foreground font-bold">Select Business Category</h2>
            <p className="text-muted-foreground text-xs mt-1">This templates the primary prompt baseline mapped to Retell AI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin p-1">
            {ONBOARDING_VERTICALS.map((vert) => (
              <button
                key={vert.id}
                type="button"
                onClick={() => setWizardForm({ ...wizardForm, industry: vert.id })}
                className={`p-4 rounded-xl border text-left transition-all space-y-2 flex flex-col justify-between min-h-[110px] cursor-pointer ${
                  wizardForm.industry === vert.id
                    ? 'border-foreground-blue bg-foreground-blue/5 shadow-[0_0_15px_rgba(18,72,222,0.15)] font-bold'
                    : 'border-border bg-card/30 hover:border-zinc-400 hover:bg-card/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-2xl">
                    {vert.icon}
                  </div>
                  <div className="font-bold text-foreground text-sm">
                    {vert.title}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground leading-snug">
                  {vert.desc}
                </div>
              </button>
            ))}
          </div>

          {wizardForm.industry === 'Other' && (
            <div className="flex flex-col gap-1.5 p-4 bg-card/35 border border-border/80 rounded-xl space-y-2 animate-fade-in">
              <label className="text-[10px] text-muted-foreground font-bold">Describe Custom Business Category</label>
              <input
                type="text"
                required
                placeholder="e.g. Real Estate Agency, Pizza Restaurant, Pet Grooming, SaaS Support"
                value={wizardForm.customIndustry}
                onChange={(e) => setWizardForm({ ...wizardForm, customIndustry: e.target.value })}
                className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-semibold"
              />
              <span className="text-[9px] text-muted-foreground">
                This will dynamically engineer a bespoke custom receptionist system prompt tailored exactly to your category!
              </span>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-border/20">
            <button
              type="button"
              onClick={() => {
                if (wizardForm.industry === 'Other' && !wizardForm.customIndustry.trim()) {
                  toast('Please describe your custom business category', 'error');
                  return;
                }
                setWizardStep(2);
              }}
              className="bg-foreground-blue text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-foreground-blue/90 transition-all shadow-md cursor-pointer animate-fade-in"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {wizardStep === 2 && (
        <div className="glass-panel p-8 rounded-2xl border border-border/60 bg-card/45 space-y-6">
          <div>
            <h2 className="text-xl text-foreground font-bold">Step 2: Business &amp; Telephony Config</h2>
            <p className="text-muted-foreground text-xs mt-1">Provide business details and configure telephony routing configurations.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Business Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dental Care Inc."
                value={wizardForm.businessName}
                onChange={(e) => setWizardForm({ ...wizardForm, businessName: e.target.value })}
                className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Alerts Forwarding Email</label>
              <input
                type="email"
                required
                placeholder="office@dentalcare.com"
                value={wizardForm.leadEmail}
                onChange={(e) => setWizardForm({ ...wizardForm, leadEmail: e.target.value })}
                className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Google Sheet Web App URL (Optional)</label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={wizardForm.googleSheetUrl}
                onChange={(e) => setWizardForm({ ...wizardForm, googleSheetUrl: e.target.value })}
                className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-semibold"
              />
              <span className="text-[9px] text-muted-foreground leading-normal mt-0.5 font-medium">
                Automatically append customer lead details to Google Sheets in real-time. Leave blank to configure later.
              </span>
            </div>

            {/* Telephony Switcher */}
            <div className="border border-border/60 bg-card/30 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-xs text-foreground font-bold">Link Pre-Owned Twilio Number</label>
                  <p className="text-[10px] text-muted-foreground max-w-xs leading-normal font-medium">
                    Enable this to link a number you already purchased from your own Twilio console.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardForm({ ...wizardForm, useExistingNumber: !wizardForm.useExistingNumber })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    wizardForm.useExistingNumber ? 'bg-foreground-blue' : 'bg-zinc-700'
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
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Preferred Twilio Country</label>
                  <select
                    value={wizardForm.countryCode}
                    onChange={(e) => setWizardForm({ ...wizardForm, countryCode: e.target.value, areaCode: '' })}
                    className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-bold cursor-pointer"
                  >
                    <option value="US">🇺🇸 United States (US)</option>
                    <option value="CA">🇨🇦 Canada (CA)</option>
                    <option value="GB">🇬🇧 United Kingdom (GB)</option>
                  </select>

                  {(wizardForm.countryCode === 'US' || wizardForm.countryCode === 'CA') && (
                    <div className="flex flex-col gap-1.5 pt-3 animate-fade-in">
                      <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Preferred 3-Digit Area Code (Optional)</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="e.g. 415"
                        value={wizardForm.areaCode}
                        onChange={(e) => setWizardForm({ ...wizardForm, areaCode: e.target.value })}
                        className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-semibold"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40 animate-fade-in">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Existing Twilio Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +14155552671"
                      value={wizardForm.existingPhoneNumber}
                      onChange={(e) => setWizardForm({ ...wizardForm, existingPhoneNumber: e.target.value })}
                      className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Twilio Phone SID (starts with PN)</label>
                    <input
                      type="text"
                      maxLength={34}
                      placeholder="PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={wizardForm.existingPhoneSid}
                      onChange={(e) => setWizardForm({ ...wizardForm, existingPhoneSid: e.target.value })}
                      className="bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border/20">
            <button
              onClick={() => setWizardStep(1)}
              className="border border-border text-muted-foreground font-bold text-xs px-6 py-2.5 rounded-lg hover:text-foreground hover:bg-card cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={validateStep2}
              className="bg-foreground-blue text-white font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-foreground-blue/90 transition-all shadow-md cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {wizardStep === 3 && (
        <form onSubmit={handleOnboardingSubmit} className="glass-panel p-8 rounded-2xl border border-border/60 bg-card/45 space-y-6">
          <div>
            <h2 className="text-xl text-foreground font-bold">Step 3: Services &amp; Tone Profiles</h2>
            <p className="text-muted-foreground text-xs mt-1">Specify detailed services to embed context directly in the prompt.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Describe Your Services</label>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI}
                  className="text-[10px] font-bold text-foreground-blue hover:text-foreground-blue/80 disabled:opacity-50 transition-opacity flex items-center gap-1 cursor-pointer bg-foreground-blue/10 px-2.5 py-1 rounded-md"
                >
                  {isGeneratingAI ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3 text-foreground-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span>⚡ Auto-Generate with AI</span>
                  )}
                </button>
              </div>
              <textarea
                rows={3}
                required
                placeholder="e.g. Scaling is $120, whitening is $250. Bookings are confirmed next business day."
                value={wizardForm.services}
                onChange={(e) => setWizardForm({ ...wizardForm, services: e.target.value })}
                className="bg-card border border-border rounded-xl p-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors font-medium leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Assistant Tone Profile</label>
              <button
                type="button"
                onClick={() => setIsWizardToneDropdownOpen(!isWizardToneDropdownOpen)}
                className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-3 text-sm text-foreground hover:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-bold"
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
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          wizardForm.tone === t
                            ? 'bg-foreground-blue/10 text-foreground-blue font-bold'
                            : 'text-foreground hover:bg-secondary/60'
                        }`}
                      >
                        <span>{t}</span>
                        {wizardForm.tone === t && <span className="text-[10px] text-foreground-blue">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border/20">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="border border-border text-muted-foreground font-bold text-xs px-6 py-2.5 rounded-lg hover:text-foreground hover:bg-card cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-foreground-blue text-white font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-foreground-blue/90 transition-all shadow-lg border border-foreground-blue/10 cursor-pointer"
            >
              Build &amp; Launch AI Agent
            </button>
          </div>
          {isProvisioning && (
            <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md flex items-center justify-center animate-fade-in">
              <div className="glass-panel p-10 rounded-2xl border border-border bg-card/65 flex flex-col items-center justify-center text-center space-y-6 max-w-sm w-full mx-4 shadow-2xl">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-foreground-blue animate-spin"></div>
                <div className="space-y-2">
                  <h3 className="text-lg text-foreground font-bold">Launching Infrastructure</h3>
                  <p className="text-muted-foreground text-xs animate-pulse font-medium">{provisioningStatus}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
