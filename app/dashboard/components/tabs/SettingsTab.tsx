'use client';

import React from 'react';
import Link from 'next/link';
import VersionsTab from './VersionsTab';

interface ProcessedVoice {
  voice_id: string;
  voice_name: string;
  provider: string;
  gender: string;
  accent: string;
  age: string;
  preview_audio_url: string;
}

interface EditForm {
  businessName: string;
  services: string;
  tone: string;
  leadEmail: string;
  googleSheetUrl: string;
  llmModel: string;
  language: string;
  voiceId: string;
}

interface SettingsTabProps {
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePause: () => void;
  onDeleteAgent: () => void;
  agentStatus: 'active' | 'paused';
  platformVoices: ProcessedVoice[];
  customClonedVoices: ProcessedVoice[];
  platformLanguages: string[];
  platformModels: { id: string; label: string }[];
  playingVoiceId: string | null;
  voiceGenderFilter: 'all' | 'Male' | 'Female' | 'Cloned';
  voiceAccentFilter: string;
  voiceSearchQuery: string;
  setVoiceGenderFilter: (v: 'all' | 'Male' | 'Female' | 'Cloned') => void;
  setVoiceAccentFilter: (v: string) => void;
  setVoiceSearchQuery: (v: string) => void;
  onPlayVoice: (url: string, id: string) => void;
  // Tone dropdown
  isToneDropdownOpen: boolean;
  setIsToneDropdownOpen: (v: boolean) => void;
  // LLM dropdown
  isLlmDropdownOpen: boolean;
  setIsLlmDropdownOpen: (v: boolean) => void;
  // Language dropdown
  isLangDropdownOpen: boolean;
  setIsLangDropdownOpen: (v: boolean) => void;
  // Gender dropdown
  isGenderDropdownOpen: boolean;
  setIsGenderDropdownOpen: (v: boolean) => void;
  // Accent dropdown
  isAccentDropdownOpen: boolean;
  setIsAccentDropdownOpen: (v: boolean) => void;
  // Voice cloning studio
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isCloning: boolean;
  recordingSeconds: number;
  clonedVoiceName: string;
  setClonedVoiceName: (v: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onVoiceUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCloneVoice: () => void;
  activePlan?: string;
  editedPrompt: string;
  setEditedPrompt: (val: string) => void;
  versions: { version: number; date: string; prompt: string; tone: string; services: string }[];
  isDeployingPrompt: boolean;
  onDeploy: (promptText: string) => void;
  onRestore: (prompt: string, version: number) => void;
}

const TONE_OPTIONS = ['Warm and friendly', 'Professional and formal', 'Upbeat and energetic'];
const DEFAULT_MODELS = [
  { id: 'gpt-4o-mini', label: 'gpt-4o-mini (Recommended - Low Latency)' },
  { id: 'gpt-4o', label: 'gpt-4o (High Intelligence)' },
  { id: 'claude-3-5-sonnet', label: 'claude-3-5-sonnet (Excellent Reasoning)' },
];
const DEFAULT_LANGUAGES = [
  'English (US)', 'English (UK)', 'Spanish (ES)', 'French (FR)', 'German (DE)', 'Hindi (IN)',
];
const DEFAULT_VOICES: ProcessedVoice[] = [
  { voice_id: 'openai-Alloy', voice_name: 'Alloy', provider: 'openai', gender: 'Female', accent: 'English (US)', age: 'Adult', preview_audio_url: '' },
  { voice_id: 'openai-Echo', voice_name: 'Echo', provider: 'openai', gender: 'Male', accent: 'English (US)', age: 'Adult', preview_audio_url: '' },
  { voice_id: 'openai-Fable', voice_name: 'Fable', provider: 'openai', gender: 'Male', accent: 'English (UK)', age: 'Adult', preview_audio_url: '' },
  { voice_id: 'openai-Nova', voice_name: 'Nova', provider: 'openai', gender: 'Female', accent: 'English (US)', age: 'Young Adult', preview_audio_url: '' },
  { voice_id: 'openai-Shimmer', voice_name: 'Shimmer', provider: 'openai', gender: 'Female', accent: 'English (US)', age: 'Adult', preview_audio_url: '' },
  { voice_id: 'openai-Onyx', voice_name: 'Onyx', provider: 'openai', gender: 'Male', accent: 'English (US)', age: 'Adult', preview_audio_url: '' },
];

export default function SettingsTab({
  editForm, setEditForm, onSubmit, onTogglePause, onDeleteAgent, agentStatus,
  platformVoices, customClonedVoices, platformLanguages, platformModels,
  playingVoiceId, voiceGenderFilter, voiceAccentFilter, voiceSearchQuery,
  setVoiceGenderFilter, setVoiceAccentFilter, setVoiceSearchQuery, onPlayVoice,
  isToneDropdownOpen, setIsToneDropdownOpen,
  isLlmDropdownOpen, setIsLlmDropdownOpen,
  isLangDropdownOpen, setIsLangDropdownOpen,
  isGenderDropdownOpen, setIsGenderDropdownOpen,
  isAccentDropdownOpen, setIsAccentDropdownOpen,
  isRecording, audioBlob, audioUrl, isCloning, recordingSeconds,
  clonedVoiceName, setClonedVoiceName,
  onStartRecording, onStopRecording, onVoiceUpload, onCloneVoice,
  activePlan = 'starter',
  editedPrompt, setEditedPrompt, versions, isDeployingPrompt, onDeploy, onRestore,
}: SettingsTabProps) {

  const models = platformModels.length > 0 ? platformModels : DEFAULT_MODELS;
  const languages = platformLanguages.length > 0 ? platformLanguages : DEFAULT_LANGUAGES;
  const baseVoices = [...customClonedVoices, ...(platformVoices.length > 0 ? platformVoices : DEFAULT_VOICES)];
  // Deduplicate by voice_id — cloned voices can appear in both lists
  const allVoices = Array.from(new Map(baseVoices.map((v) => [v.voice_id, v])).values());

  const accents = Array.from(new Set(allVoices.map((v) => v.accent).filter(Boolean)));

  const filteredVoices = allVoices.filter((v) => {
    const matchGender =
      voiceGenderFilter === 'all' ? true :
      voiceGenderFilter === 'Cloned' ? v.gender === 'Cloned' :
      v.gender === voiceGenderFilter;
    const matchAccent = voiceAccentFilter === 'all' || v.accent === voiceAccentFilter;
    const matchSearch =
      !voiceSearchQuery || v.voice_name.toLowerCase().includes(voiceSearchQuery.toLowerCase());
    return matchGender && matchAccent && matchSearch;
  });

  const closeAllDropdowns = () => {
    setIsToneDropdownOpen(false);
    setIsLlmDropdownOpen(false);
    setIsLangDropdownOpen(false);
    setIsGenderDropdownOpen(false);
    setIsAccentDropdownOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">

      {/* === LEFT: Config Form === */}
      <form onSubmit={onSubmit} className="lg:col-span-2 glass-panel p-8 rounded-2xl space-y-6 border border-border/60">
        <div>
          <h3 className=" text-foreground text-sm">Receptionist Settings Configuration</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Dynamically update services, sheet endpoints, or pause active calls.
          </p>
        </div>

        <div className="space-y-4">
          {/* Business Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px]  text-muted-foreground">Business Name</label>
            <input
              type="text"
              required
              value={editForm.businessName}
              onChange={(e) => setEditForm((f) => ({ ...f, businessName: e.target.value }))}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Lead Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px]  text-muted-foreground">Alerts Forwarding Email</label>
            <input
              type="email"
              required
              value={editForm.leadEmail}
              onChange={(e) => setEditForm((f) => ({ ...f, leadEmail: e.target.value }))}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Google Sheet URL */}
          <div className="flex flex-col gap-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px]  text-muted-foreground">Google Sheet Web App URL</label>
              {activePlan === 'starter' && (
                <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black px-2 py-0.5 rounded tracking-wide uppercase">
                  🔒 Pro Only
                </span>
              )}
            </div>
            <input
              type="url"
              disabled={activePlan === 'starter'}
              placeholder={activePlan === 'starter' ? "🔒 Upgrade to Pro to enable CRM synchronization" : "https://script.google.com/macros/s/.../exec"}
              value={editForm.googleSheetUrl}
              onChange={(e) => setEditForm((f) => ({ ...f, googleSheetUrl: e.target.value }))}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors disabled:opacity-60"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
              Paste your Google Apps Script Web App URL to append leads automatically.
            </span>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px]  text-muted-foreground">Offered Services &amp; Scope</label>
            <textarea
              rows={3}
              required
              value={editForm.services}
              onChange={(e) => setEditForm((f) => ({ ...f, services: e.target.value }))}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
            />
          </div>

          {/* Tone Dropdown */}
          <div className={`flex flex-col gap-1.5 relative ${isToneDropdownOpen ? 'z-[100]' : 'z-10'}`}>
            <label className="text-[10px]  text-muted-foreground">Tone Profile</label>
            <button
              type="button"
              onClick={() => { closeAllDropdowns(); setIsToneDropdownOpen(!isToneDropdownOpen); }}
              className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-3 text-sm text-foreground hover:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            >
              <span>{editForm.tone || 'Select Tone'}</span>
              <svg className={`w-4 h-4 text-muted-foreground transition-transform ${isToneDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isToneDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsToneDropdownOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-[100] p-1.5 scrollbar-thin animate-fade-in">
                  {TONE_OPTIONS.map((t) => (
                    <button key={t} type="button" onClick={() => { setEditForm((f) => ({ ...f, tone: t })); setIsToneDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${editForm.tone === t ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'text-foreground hover:bg-secondary/60'}`}>
                      <span>{t}</span>
                      {editForm.tone === t && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* LLM Model Dropdown */}
          <div className={`flex flex-col gap-1.5 relative ${isLlmDropdownOpen ? 'z-[100]' : 'z-10'}`}>
            <label className="text-[10px]  text-muted-foreground">AI Response LLM Engine</label>
            <button
              type="button"
              onClick={() => { closeAllDropdowns(); setIsLlmDropdownOpen(!isLlmDropdownOpen); }}
              className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-3 text-sm text-foreground hover:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            >
              <span>{models.find((m) => m.id === editForm.llmModel)?.label || editForm.llmModel || 'Select LLM Engine'}</span>
              <svg className={`w-4 h-4 text-muted-foreground transition-transform ${isLlmDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isLlmDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLlmDropdownOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-[100] p-1.5 scrollbar-thin animate-fade-in">
                  {models.map((m) => {
                    const isLocked = activePlan === 'starter' && m.id !== 'gpt-4o-mini';
                    return (
                      <button 
                        key={m.id} 
                        type="button" 
                        disabled={isLocked}
                        onClick={() => { 
                          if (isLocked) return;
                          setEditForm((f) => ({ ...f, llmModel: m.id })); 
                          setIsLlmDropdownOpen(false); 
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between disabled:opacity-50 ${editForm.llmModel === m.id ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'text-foreground hover:bg-secondary/60'}`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isLocked && <span>🔒</span>}
                          {m.label}
                        </span>
                        {editForm.llmModel === m.id && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Language Dropdown */}
          <div className={`flex flex-col gap-1.5 relative ${isLangDropdownOpen ? 'z-[100]' : 'z-10'}`}>
            <label className="text-[10px]  text-muted-foreground">Telephony Speech Language</label>
            <button
              type="button"
              onClick={() => { closeAllDropdowns(); setIsLangDropdownOpen(!isLangDropdownOpen); }}
              className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-3 text-sm text-foreground hover:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            >
              <span>{editForm.language || 'Select Language'}</span>
              <svg className={`w-4 h-4 text-muted-foreground transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isLangDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-[100] p-1.5 scrollbar-thin animate-fade-in">
                  {languages.map((l) => (
                    <button key={l} type="button" onClick={() => { setEditForm((f) => ({ ...f, language: l })); setIsLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${editForm.language === l ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'text-foreground hover:bg-secondary/60'}`}>
                      <span>{l}</span>
                      {editForm.language === l && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Voice Catalog */}
          <div className="flex flex-col gap-2 bg-card/45 border border-border/80 p-5 rounded-xl space-y-4">
            <div>
              <label className="text-xs  text-foreground">Receptionist Voice Selection</label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Filter, preview, and select your receptionist voice profile.
              </p>
            </div>

            {/* Voice Filters */}
            <div className="flex flex-col md:flex-row gap-2">
              {/* Gender Filter */}
              <div className={`relative flex-grow min-w-[120px] ${isGenderDropdownOpen ? 'z-30' : 'z-10'}`}>
                <button type="button"
                  onClick={() => { closeAllDropdowns(); setIsGenderDropdownOpen(!isGenderDropdownOpen); }}
                  className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-2 text-xs text-foreground hover:border-zinc-400 focus:outline-none transition-colors">
                  <span>
                    {voiceGenderFilter === 'all' ? 'All Genders' : voiceGenderFilter === 'Cloned' ? 'My Cloned Voices' : voiceGenderFilter}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isGenderDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isGenderDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsGenderDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-50 p-1.5 scrollbar-thin animate-fade-in">
                      {[['all', 'All Genders'], ['Male', 'Male'], ['Female', 'Female'], ['Cloned', 'My Cloned Voices']].map(([val, lbl]) => (
                        <button key={val} type="button" onClick={() => { setVoiceGenderFilter(val as 'all' | 'Male' | 'Female' | 'Cloned'); setIsGenderDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${voiceGenderFilter === val ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'text-foreground hover:bg-secondary/60'}`}>
                          <span>{lbl}</span>
                          {voiceGenderFilter === val && <span className="text-[10px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Accent Filter */}
              <div className={`relative flex-grow min-w-[150px] ${isAccentDropdownOpen ? 'z-30' : 'z-10'}`}>
                <button type="button"
                  onClick={() => { closeAllDropdowns(); setIsAccentDropdownOpen(!isAccentDropdownOpen); }}
                  className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-2 text-xs text-foreground hover:border-zinc-400 focus:outline-none transition-colors">
                  <span>{voiceAccentFilter === 'all' ? 'All Languages' : voiceAccentFilter}</span>
                  <svg className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isAccentDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isAccentDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAccentDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-50 p-1.5 scrollbar-thin animate-fade-in">
                      {['all', ...accents].map((l) => (
                        <button key={l} type="button" onClick={() => { setVoiceAccentFilter(l); setIsAccentDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${voiceAccentFilter === l ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'text-foreground hover:bg-secondary/60'}`}>
                          <span>{l === 'all' ? 'All Languages' : l}</span>
                          {voiceAccentFilter === l && <span className="text-[10px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Search */}
              <input type="text" placeholder="Search voice name..."
                value={voiceSearchQuery}
                onChange={(e) => setVoiceSearchQuery(e.target.value)}
                className="bg-card border border-border rounded-lg p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none flex-grow font-semibold"
              />
            </div>

            {/* Voice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {filteredVoices.map((v) => (
                <div key={v.voice_id}
                  onClick={() => setEditForm((f) => ({ ...f, voiceId: v.voice_id }))}
                  className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 ${editForm.voiceId === v.voice_id ? 'border-emerald-500 bg-emerald-500/5' : 'border-border/60 hover:border-border bg-card/40'}`}>
                  <div className="flex justify-between items-center">
                    <span className=" text-foreground text-xs">{v.voice_name}</span>
                    <div className="flex items-center gap-1.5">
                      {editForm.voiceId === v.voice_id && (
                        <span className="text-[9px]  text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">Active</span>
                      )}
                      {v.preview_audio_url?.startsWith('http') && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); onPlayVoice(v.preview_audio_url, v.voice_id); }}
                          className="text-[10px]  px-2 py-0.5 rounded-md border border-border bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                          {playingVoiceId === v.voice_id ? '⏹' : '▶'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px]  px-1.5 py-0.5 rounded-md uppercase ${v.gender === 'Female' ? 'bg-pink-500/10 text-pink-400' : v.gender === 'Cloned' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {v.gender}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{v.accent}</span>
                    <span className="text-[8px] text-muted-foreground font-semibold uppercase bg-secondary px-1 py-0.5 rounded">{v.provider}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit"
            className="bg-primary text-primary-foreground  text-xs px-6 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-md active:scale-98">
            Save Changes
          </button>
          <button type="button" onClick={onTogglePause}
            className={` text-xs px-6 py-2.5 rounded-lg transition-all shadow-md active:scale-98 border ${agentStatus === 'active' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
            {agentStatus === 'active' ? '⏸ Pause Receptionist' : '▶ Resume Receptionist'}
          </button>
          <button type="button" onClick={onDeleteAgent}
            className="bg-red-600/10 text-red-500 border border-red-600/20  text-xs px-6 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-md">
            Delete AI Receptionist Permanently
          </button>
        </div>
      </form>

      {/* === RIGHT: Voice Cloning Studio === */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-border/60 relative overflow-hidden">
          {activePlan === 'starter' && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50 animate-fade-in">
              <span className="text-3xl mb-2">🔒</span>
              <h4 className=" text-sm text-foreground">Voice Cloning Locked</h4>
              <p className="text-[10px] text-muted-foreground mt-1 mb-4 max-w-[200px]">
                Upgrade to Pro or Agency to clone custom voice profiles and apply them to your agent.
              </p>
              <Link href="/pricing" className="bg-emerald-500 text-background  text-[10px] px-4 py-2 rounded-lg hover:bg-emerald-400 transition-all uppercase tracking-wider">
                Upgrade Now 🚀
              </Link>
            </div>
          )}
          <div>
            <h3 className=" text-foreground text-sm">🎤 Voice Cloning Studio</h3>
            <p className="text-[10px] text-muted-foreground mt-1">
              Record a 30-second voice sample or upload an audio file (MP3/WAV) to clone your voice.
            </p>
          </div>

          {/* Voice Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px]  text-muted-foreground">Cloned Voice Name</label>
            <input type="text" placeholder="e.g. Alex Custom Voice"
              value={clonedVoiceName}
              onChange={(e) => setClonedVoiceName(e.target.value)}
              className="bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Recording Controls */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {!isRecording ? (
                <button type="button" onClick={onStartRecording}
                  className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20  text-xs px-4 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Start Recording
                </button>
              ) : (
                <button type="button" onClick={onStopRecording}
                  className="flex-1 bg-red-500 text-white  text-xs px-4 py-2.5 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Stop ({recordingSeconds}s)
                </button>
              )}
            </div>

            <div className="text-center text-[10px] text-muted-foreground font-semibold">— or upload a file —</div>

            <label className="block cursor-pointer">
              <div className="w-full bg-card border border-dashed border-border rounded-xl p-4 text-center text-xs text-muted-foreground font-semibold hover:border-zinc-400 hover:text-foreground transition-all">
                📁 Upload MP3 / WAV
              </div>
              <input type="file" accept="audio/*" onChange={onVoiceUpload} className="hidden" />
            </label>
          </div>

          {/* Audio Preview */}
          {audioUrl && (
            <div className="space-y-3 pt-1">
              <div className="text-[10px]  text-muted-foreground uppercase tracking-wider">
                Sample Preview
              </div>
              <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
            </div>
          )}

          {/* Clone Button */}
          {audioBlob && (
            <button type="button" onClick={onCloneVoice} disabled={isCloning}
              className="w-full bg-primary text-primary-foreground  text-xs px-5 py-3 rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
              {isCloning ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Cloning Voice...
                </>
              ) : (
                '✨ Clone & Apply Voice'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Divider & Prompt Versions Section */}
      <div className="lg:col-span-3 border-t border-border/60 pt-8 mt-4">
        <div className="mb-6">
          <h3 className=" text-foreground text-sm font-semibold">🗂️ Prompt Versions &amp; Backups</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Customize the system prompt template and restore older deployment backups.
          </p>
        </div>
        <VersionsTab
          editedPrompt={editedPrompt}
          setEditedPrompt={setEditedPrompt}
          versions={versions}
          isDeployingPrompt={isDeployingPrompt}
          onDeploy={onDeploy}
          onRestore={onRestore}
        />
      </div>
    </div>
  );
}
