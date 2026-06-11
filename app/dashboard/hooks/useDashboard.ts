'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  businessName: string;
  industry: string;
  tone: string;
  services: string;
  leadEmail: string;
  phoneNumber: string;
  providerAgentId: string;
  status: 'active' | 'paused';
  googleSheetUrl?: string;
  voiceId?: string;
  llmModel?: string;
  language?: string;
}

export interface Call {
  id: string;
  agentId?: string;
  caller: string;
  duration: string;
  durationSeconds?: number;
  intent: string;
  summary: string;
  transcript: string;
  timestamp: string;
  leadName: string;
}

export interface AgentVersion {
  version: number;
  date: string;
  prompt: string;
  tone: string;
  services: string;
}

export interface ProcessedVoice {
  voice_id: string;
  voice_name: string;
  provider: string;
  gender: string;
  accent: string;
  age: string;
  preview_audio_url: string;
}

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
}

export interface DbAgent {
  id: string;
  business_name: string;
  industry: string;
  tone: string;
  services: string;
  lead_email: string;
  phone_numbers?: { twilio_phone_number: string }[];
  phone_number?: string;
  provider_agent_id: string;
  status: 'active' | 'paused';
  google_sheet_url?: string;
  latest_config?: {
    voiceId?: string;
    llmModel?: string;
    language?: string;
  };
}

export interface DbCall {
  id: string;
  agent_id: string;
  caller_phone?: string;
  duration_seconds: number;
  summary?: string;
  transcript?: string;
  created_at: string;
}

export interface DbAgentVersion {
  created_at: string;
  prompt: string;
  config?: { voiceId?: string; tone?: string; services?: string; leadEmail?: string; llmModel?: string; language?: string };
}

export type DashboardTab = 'dashboard' | 'agents' | 'pricing' | 'settings';

// ─── Supabase safe getter ──────────────────────────────────────────────────────

const getClientSafe = () => {
  try {
    return getSupabaseClient();
  } catch {
    console.warn('Supabase Client not active. Running in sandbox mode.');
    return null;
  }
};

// ─── Hook Definition ────────────────────────────────────────────────────────────

export function useDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  // ── Session & Navigation ──────────────────────────────────────────────────
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('dashboard');

  // ── Billing Info ──────────────────────────────────────────────────────────
  const [billingInfo, setBillingInfo] = useState<{
    subscription: { plan: string; status: string; max_agents: number; max_minutes: number };
    usage: { agents_count: number; minutes_used: number };
  } | null>(null);

  // ── Agents & Calls ────────────────────────────────────────────────────────
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [calls, setCalls] = useState<Call[]>([]);
  const [versions, setVersions] = useState<AgentVersion[]>([]);

  // ── Edit Form (derived from currentAgent, with user overrides) ────────────
  const [editFormOverrides, setEditFormOverrides] = useState<Partial<{
    businessName: string; services: string; tone: string; leadEmail: string;
    googleSheetUrl: string; llmModel: string; language: string; voiceId: string;
  }>>({});

  // ── Prompt Editor ─────────────────────────────────────────────────────────
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [isDeployingPrompt, setIsDeployingPrompt] = useState(false);

  // ── Sync ──────────────────────────────────────────────────────────────────
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSyncedRef = useRef(false);

  // ── Dropdowns ─────────────────────────────────────────────────────────────
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [isLlmDropdownOpen, setIsLlmDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isAccentDropdownOpen, setIsAccentDropdownOpen] = useState(false);

  // ── Platform configs ──────────────────────────────────────────────────────
  const [platformVoices, setPlatformVoices] = useState<ProcessedVoice[]>([]);
  const [platformLanguages, setPlatformLanguages] = useState<string[]>([]);
  const [platformModels, setPlatformModels] = useState<{ id: string; label: string }[]>([]);

  // ── Voice filters ─────────────────────────────────────────────────────────
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'all' | 'Male' | 'Female' | 'Cloned'>('all');
  const [voiceAccentFilter, setVoiceAccentFilter] = useState('all');
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // ── Cloned voices ─────────────────────────────────────────────────────────
  const [clonedVoiceName, setClonedVoiceName] = useState('');
  const [customClonedVoices, setCustomClonedVoices] = useState<ProcessedVoice[]>([]);

  // ── Recording Studio ──────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // ─── Derived Values ─────────────────────────────────────────────────────────

  const currentAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) ?? agents[0],
    [agents, selectedAgentId]
  );

  // editForm is derived from currentAgent + any in-progress user overrides
  const editForm = useMemo(() => ({
    businessName: editFormOverrides.businessName ?? currentAgent?.businessName ?? '',
    services: editFormOverrides.services ?? currentAgent?.services ?? '',
    tone: editFormOverrides.tone ?? currentAgent?.tone ?? 'Warm and friendly',
    leadEmail: editFormOverrides.leadEmail ?? currentAgent?.leadEmail ?? '',
    googleSheetUrl: editFormOverrides.googleSheetUrl ?? currentAgent?.googleSheetUrl ?? '',
    llmModel: editFormOverrides.llmModel ?? 'gpt-4o-mini',
    language: editFormOverrides.language ?? 'English (US)',
    voiceId: editFormOverrides.voiceId ?? currentAgent?.voiceId ?? 'openai-Alloy',
  }), [currentAgent, editFormOverrides]);

  const setEditForm = useCallback((
    updater: React.SetStateAction<typeof editForm>
  ) => {
    setEditFormOverrides((prev) => {
      const base = {
        businessName: currentAgent?.businessName ?? '',
        services: currentAgent?.services ?? '',
        tone: currentAgent?.tone ?? 'Warm and friendly',
        leadEmail: currentAgent?.leadEmail ?? '',
        googleSheetUrl: currentAgent?.googleSheetUrl ?? '',
        llmModel: 'gpt-4o-mini',
        language: 'English (US)',
        voiceId: currentAgent?.voiceId ?? 'openai-Alloy',
        ...prev,
      };
      const next = typeof updater === 'function' ? updater(base) : updater;
      return next;
    });
  }, [currentAgent]);

  const agentCalls = useMemo(
    () => calls.filter((c) => c.agentId === selectedAgentId),
    [calls, selectedAgentId]
  );

  const { dynamicMinutes, dynamicLeadsCount, dynamicAvgDuration } = useMemo(() => {
    const total = agentCalls.reduce((acc, c) => acc + (c.durationSeconds ?? 0), 0);
    const avg = agentCalls.length > 0 ? Math.round(total / agentCalls.length) : 0;
    return {
      dynamicMinutes: (total / 60).toFixed(1),
      dynamicLeadsCount: agentCalls.filter((c) => c.leadName && c.leadName !== 'Lead Contact').length,
      dynamicAvgDuration: `${Math.floor(avg / 60)}m ${avg % 60}s`,
    };
  }, [agentCalls]);

  const fetchBillingInfo = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/billing?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch billing status');
      const data = await res.json();
      if (data.success) {
        setBillingInfo({ subscription: data.subscription, usage: data.usage });
      }
    } catch (err) {
      console.error('Error fetching billing info:', err);
    }
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────────────

  // Session Init
  useEffect(() => {
    const initSession = async () => {
      const supabase = getClientSafe();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { id, email = '', user_metadata } = session.user;
          setUser({ id, email, fullName: user_metadata?.full_name || 'Active User' });
          try {
            const res = await fetch(`/api/agents?userId=${id}`);
            const resData = await res.json();
            if (resData.success && resData.agents?.length > 0) {
              const mapped = (resData.agents as DbAgent[]).map((a): Agent => ({
                id: a.id, businessName: a.business_name, industry: a.industry,
                tone: a.tone, services: a.services, leadEmail: a.lead_email,
                phoneNumber: a.phone_numbers?.[0]?.twilio_phone_number ?? a.phone_number ?? '+1 (415) 890-3456',
                providerAgentId: a.provider_agent_id, status: a.status,
                googleSheetUrl: a.google_sheet_url ?? '',
                voiceId: a.latest_config?.voiceId || 'openai-Alloy',
                llmModel: a.latest_config?.llmModel || 'gpt-4o-mini',
                language: a.latest_config?.language || 'English (US)',
              }));
              setAgents(mapped);
              setSelectedAgentId(mapped[0].id);
              const { data: dbCalls } = await supabase.from('calls').select('*').eq('user_id', id).order('created_at', { ascending: false });
              if (dbCalls?.length) {
                setCalls((dbCalls as unknown as DbCall[]).map((c): Call => ({
                  id: c.id, agentId: c.agent_id, caller: c.caller_phone || 'Anonymous',
                  duration: `${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s`,
                  durationSeconds: c.duration_seconds,
                  intent: c.summary ? c.summary.substring(0, 50) : 'General Inquiry',
                  summary: c.summary || '', transcript: c.transcript || '',
                  timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  leadName: 'Lead Contact',
                })));
              }
            } else {
              router.push('/onboarding');
            }
          } catch {
            router.push('/onboarding');
          }
        } else {
          router.push('/auth/login');
        }
      } else {
        const local = localStorage.getItem('ringit_sandbox_user');
        if (local) {
          const parsed = JSON.parse(local);
          setUser(parsed);
          const mock: Agent[] = [{
            id: 'mock-agent-1', businessName: 'Dental Care Inc.', industry: 'Dental',
            tone: 'Warm and friendly', services: 'Teeth cleaning, whitening, cavity fillings',
            leadEmail: parsed.email, phoneNumber: '+1 (415) 961-4820',
            providerAgentId: 'agent_retell_101', status: 'active', googleSheetUrl: '',
          }];
          setAgents(mock);
          setSelectedAgentId(mock[0].id);
        } else {
          router.push('/auth/login');
        }
      }
      setIsAuthLoading(false);
    };
    initSession();
  }, [router]);

  // Fetch voices/languages/models
  useEffect(() => {
    fetch('/api/voices')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.voices?.length) setPlatformVoices(data.voices);
          if (data.languages?.length) setPlatformLanguages(data.languages);
          if (data.models?.length) setPlatformModels(data.models);
        }
      })
      .catch(console.error);
  }, []);

  // Load custom cloned voices from localStorage as fallback
  useEffect(() => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`ringit_cloned_voices_${user.id}`);
    if (saved) {
      try { setCustomClonedVoices(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [user?.id]);

  // Fetch Billing Info
  useEffect(() => {
    if (!user?.id) return;
    fetchBillingInfo(user.id);
  }, [user?.id, fetchBillingInfo]);

  // Fetch agent versions when agent changes
  const fetchAgentVersions = useCallback(async (agentId: string) => {
    const supabase = getClientSafe();
    if (!supabase) return;
    try {
      const { data } = await supabase.from('agent_versions').select('*').eq('agent_id', agentId).order('created_at', { ascending: false });
      if (data) {
        const mapped = (data as unknown as DbAgentVersion[]).map((v, i): AgentVersion => ({
          version: data.length - i,
          date: new Date(v.created_at).toLocaleString(),
          prompt: v.prompt,
          tone: v.config?.tone ?? 'Warm and friendly',
          services: v.config?.services ?? '',
        }));
        setVersions(mapped);
        if (mapped[0]) {
          setEditedPrompt(mapped[0].prompt);
        }
      }
    } catch (err) {
      console.error('Error fetching versions:', err);
    }
  }, []);

  useEffect(() => {
    if (!currentAgent) return;
    setEditFormOverrides({});  // reset overrides when agent changes
    setEditedPrompt(
      `You are a warm, professional ${currentAgent.industry.toLowerCase()} receptionist for ${currentAgent.businessName}...`
    );
    fetchAgentVersions(currentAgent.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAgent?.id, fetchAgentVersions]);

  // Sync call logs
  const syncRetellCalls = useCallback(async (showToast = false) => {
    if (!user?.id) return;
    setIsSyncing(true);
    if (showToast) toast('Syncing call logs from Retell AI...', 'info');
    try {
      await fetch('/api/calls/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
      const supabase = getClientSafe();
      if (supabase) {
        const { data: dbCalls } = await supabase.from('calls').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (dbCalls) {
          setCalls((dbCalls as unknown as DbCall[]).map((c): Call => ({
            id: c.id, agentId: c.agent_id, caller: c.caller_phone || 'Anonymous',
            duration: `${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s`,
            durationSeconds: c.duration_seconds, intent: c.summary?.substring(0, 50) ?? 'General Inquiry',
            summary: c.summary ?? '', transcript: c.transcript ?? '',
            timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            leadName: 'Lead Contact',
          })));
        }
      }
      if (showToast) toast('Calls are up to date!', 'success');
    } catch {
      if (showToast) toast('Call sync encountered an error.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (!user?.id || hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    const t = setTimeout(() => syncRetellCalls(false), 500);
    return () => clearTimeout(t);
  }, [user?.id, syncRetellCalls]);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    const supabase = getClientSafe();
    if (supabase) await supabase.auth.signOut();
    else localStorage.removeItem('ringit_sandbox_user');
    toast('Signed out successfully.', 'info');
    router.push('/auth/login');
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/agents/${currentAgent.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, prompt: editedPrompt }),
      });
      if (!res.ok) throw new Error('API patch failed');
    } catch {
      /* fallback to local update */
    }
    setAgents((prev) => prev.map((a) => a.id === currentAgent.id ? { ...a, ...editForm } : a));
    setEditFormOverrides({});
    toast('Receptionist settings updated successfully!', 'success');
    if (user?.id) fetchBillingInfo(user.id);
    setDashboardTab('dashboard');
  };

  const deployPromptVersion = async (promptText: string) => {
    if (!currentAgent) return;
    setIsDeployingPrompt(true);
    toast('Deploying prompt to Retell AI...', 'info');
    try {
      await fetch(`/api/agents/${currentAgent.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, prompt: promptText }),
      });
      await fetchAgentVersions(currentAgent.id);
      toast('Version deployed successfully!', 'success');
    } catch {
      toast('Prompt deployment failed.', 'error');
    } finally {
      setIsDeployingPrompt(false);
    }
  };

  const toggleAgentPause = async () => {
    const next = currentAgent.status === 'active' ? 'paused' : 'active';
    try {
      await fetch(`/api/agents/${currentAgent.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    } catch { /* sandbox fallback */ }
    setAgents((prev) => prev.map((a) => a.id === currentAgent.id ? { ...a, status: next } : a));
    toast(`Receptionist is now ${next === 'paused' ? 'Paused ⏸️' : 'Active 🟢'}`, 'info');
  };

  const handleDeleteAgent = async () => {
    if (!confirm(`Delete receptionist for ${currentAgent.businessName}?`)) return;
    try {
      await fetch(`/api/agents/${currentAgent.id}`, { method: 'DELETE' });
    } catch { /* sandbox fallback */ }
    const remaining = agents.filter((a) => a.id !== currentAgent.id);
    setAgents(remaining);
    toast('Agent de-provisioned successfully.', 'success');
    if (user?.id) fetchBillingInfo(user.id);
    if (remaining.length > 0) { setSelectedAgentId(remaining[0].id); setDashboardTab('dashboard'); }
    else router.push('/onboarding');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
         const blob = new Blob(chunks, { type: 'audio/wav' });
         setAudioBlob(blob);
         setAudioUrl(URL.createObjectURL(blob));
      };
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch {
      toast('Could not access microphone. Check browser permissions.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      toast('Recording stopped. Ready to clone!', 'info');
    }
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { toast('Please upload an audio file (MP3 or WAV)', 'error'); return; }
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    toast('Audio file loaded! Ready to clone.', 'success');
  };

  const cloneAndApplyVoice = async () => {
    if (!audioBlob || !currentAgent) { toast('Record or upload an audio sample first.', 'error'); return; }
    setIsCloning(true);
    toast('Cloning voice sample...', 'info');
    try {
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('agentId', currentAgent.id);
      formData.append('providerAgentId', currentAgent.providerAgentId);
      formData.append('voiceName', clonedVoiceName.trim() || `${currentAgent.businessName} Cloned Voice`);
      const res = await fetch('/api/voices/clone', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const voiceName = clonedVoiceName.trim() || `${currentAgent.businessName} Cloned Voice`;

        let previewUrl = '';
        try {
          const voiceRes = await fetch(`/api/voices/${data.voiceId}`);
          const voiceData = await voiceRes.json();
          if (voiceData.success && voiceData.voice?.preview_audio_url) {
            previewUrl = voiceData.voice.preview_audio_url;
          }
        } catch {
          // ignore
        }

        const newVoice: ProcessedVoice = {
          voice_id: data.voiceId,
          voice_name: voiceName,
          gender: 'Cloned',
          accent: 'Custom',
          preview_audio_url: previewUrl,
          provider: 'elevenlabs',
          age: 'Adult',
        };
        setCustomClonedVoices((prev) => {
          const updated = [newVoice, ...prev.filter((v) => v.voice_id !== newVoice.voice_id)];
          if (user?.id) localStorage.setItem(`ringit_cloned_voices_${user.id}`, JSON.stringify(updated));
          return updated;
        });
        setEditForm((f) => ({ ...f, voiceId: data.voiceId }));
        setAgents((prev) => prev.map((a) => a.id === currentAgent.id ? { ...a, voiceId: data.voiceId } : a));
        setAudioBlob(null); setAudioUrl(null); setClonedVoiceName('');
        toast('Voice cloned and applied!', 'success');
        if (user?.id) fetchBillingInfo(user.id);
      } else {
        throw new Error(data.error || 'Clone failed');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Voice clone error.', 'error');
    } finally {
      setIsCloning(false);
    }
  };

  const playVoicePreview = (url: string, voiceId: string) => {
    if (!url || !url.startsWith('http')) {
      toast('No audio preview available for this voice.', 'info');
      return;
    }
    if (previewAudio) {
      previewAudio.pause();
      if (playingVoiceId === voiceId) { setPlayingVoiceId(null); setPreviewAudio(null); return; }
    }
    const audio = new Audio(url);
    audio.play()
      .then(() => { setPlayingVoiceId(voiceId); setPreviewAudio(audio); })
      .catch(() => {
        toast('Could not play preview audio.', 'error');
        setPlayingVoiceId(null);
        setPreviewAudio(null);
      });
    audio.onended = () => { setPlayingVoiceId(null); setPreviewAudio(null); };
  };

  return {
    router,
    toast,
    user,
    isAuthLoading,
    dashboardTab,
    setDashboardTab,
    billingInfo,
    agents,
    selectedAgentId,
    setSelectedAgentId,
    calls,
    versions,
    editFormOverrides,
    setEditFormOverrides,
    editedPrompt,
    setEditedPrompt,
    isDeployingPrompt,
    isSyncing,
    isAgentDropdownOpen,
    setIsAgentDropdownOpen,
    isToneDropdownOpen,
    setIsToneDropdownOpen,
    isLlmDropdownOpen,
    setIsLlmDropdownOpen,
    isLangDropdownOpen,
    setIsLangDropdownOpen,
    isGenderDropdownOpen,
    setIsGenderDropdownOpen,
    isAccentDropdownOpen,
    setIsAccentDropdownOpen,
    platformVoices,
    platformLanguages,
    platformModels,
    voiceGenderFilter,
    setVoiceGenderFilter,
    voiceAccentFilter,
    setVoiceAccentFilter,
    voiceSearchQuery,
    setVoiceSearchQuery,
    playingVoiceId,
    previewAudio,
    clonedVoiceName,
    setClonedVoiceName,
    customClonedVoices,
    isRecording,
    audioBlob,
    audioUrl,
    mediaRecorder,
    isCloning,
    recordingSeconds,
    currentAgent,
    editForm,
    setEditForm,
    agentCalls,
    dynamicMinutes,
    dynamicLeadsCount,
    dynamicAvgDuration,
    fetchBillingInfo,
    fetchAgentVersions,
    syncRetellCalls,
    handleSignOut,
    handleEditAgent,
    deployPromptVersion,
    toggleAgentPause,
    handleDeleteAgent,
    startRecording,
    stopRecording,
    handleVoiceUpload,
    cloneAndApplyVoice,
    playVoicePreview,
  };
}
