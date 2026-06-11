'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from './hooks/useDashboard';
import { RefreshCw, LogOut } from 'lucide-react';

import DashboardSidebar from '@/app/dashboard/DashboardSidebar';
import StatsBar from '@/app/dashboard/StatsBar';
import OverviewTab from '@/app/dashboard/components/tabs/OverviewTab';
import SettingsTab from '@/app/dashboard/components/tabs/SettingsTab';
import AgentsTab from '@/app/dashboard/components/tabs/AgentsTab';
import LandingPricing from '@/components/landing/Pricing';

export default function DashboardPage() {
  const router = useRouter();
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = React.useState(false);

  const {
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
    clonedVoiceName,
    setClonedVoiceName,
    customClonedVoices,
    isRecording,
    audioBlob,
    audioUrl,
    isCloning,
    recordingSeconds,
    currentAgent,
    editForm,
    setEditForm,
    agentCalls,
    dynamicMinutes,
    dynamicLeadsCount,
    dynamicAvgDuration,
    deployPromptVersion,
    syncRetellCalls,
    handleSignOut,
    handleEditAgent,
    toggleAgentPause,
    handleDeleteAgent,
    startRecording,
    stopRecording,
    handleVoiceUpload,
    cloneAndApplyVoice,
    playVoicePreview,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-300">
      <DashboardSidebar
        agents={agents}
        selectedAgentId={selectedAgentId}
        currentAgent={currentAgent}
        user={user}
        dashboardTab={dashboardTab}
        isAgentDropdownOpen={isAgentDropdownOpen}
        setIsAgentDropdownOpen={setIsAgentDropdownOpen}
        setSelectedAgentId={setSelectedAgentId}
        setDashboardTab={setDashboardTab}
        onSignOut={handleSignOut}
        billingInfo={billingInfo}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-background/50">
        {/* Sticky Workspace Header */}
        {/* Sticky Workspace Header */}
        <header className="sticky top-0 z-30 bg-background/40 backdrop-blur-md border-b border-border/60 py-4 px-8 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground capitalize">{dashboardTab}</h1>
          </div>
          <div className="flex items-center gap-4 relative">
            {/* <button
              onClick={() => syncRetellCalls(true)}
              disabled={isSyncing || isAuthLoading || !currentAgent}
              className="bg-secondary text-secondary-foreground text-xs py-2 px-4 rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md border border-secondary/10 disabled:opacity-50 font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Logs'}
            </button> */}

            {/* Profile Avatar & Popover */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfilePopoverOpen(!isProfilePopoverOpen)}
                  className="w-9 h-9 rounded-full bg-foreground-blue text-white hover:bg-foreground-blue/90 flex items-center justify-center text-sm font-bold border border-border shadow-sm shrink-0 cursor-pointer transition-colors"
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </button>

                {isProfilePopoverOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfilePopoverOpen(false)} 
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-2xl z-50 p-4 animate-fade-in space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-foreground truncate">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="border-t border-border pt-2.5">
                        <button
                          onClick={() => {
                            setIsProfilePopoverOpen(false);
                            handleSignOut();
                          }}
                          className="w-full text-center text-xs uppercase text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 px-3 py-2 rounded-lg transition-all border border-red-500/20 tracking-wider font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Sign Out <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-8 space-y-8 w-full mx-auto">
          {isAuthLoading || !currentAgent ? (
            dashboardTab === 'pricing' ? (
              <div className="space-y-8 animate-pulse">
                {/* Header copy placeholder */}
                <div className="space-y-4 max-w-3xl mb-12 text-left w-full">
                  <div className="h-6 w-28 bg-muted rounded-full" />
                  <div className="h-10 w-64 bg-muted rounded-md" />
                  <div className="h-4 w-96 bg-muted rounded-md" />
                </div>
                
                {/* Centered Switch placeholder */}
                <div className="flex justify-center mb-8">
                  <div className="h-10 w-48 bg-muted rounded-xl" />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-5xl items-stretch">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="relative flex flex-col p-8 rounded-3xl border border-border/60 bg-card/30 justify-between min-h-[500px]"
                    >
                      <div className="space-y-4">
                        <div className="h-6 w-24 bg-muted rounded-md" />
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-muted rounded-md" />
                          <div className="h-3 w-2/3 bg-muted rounded-md" />
                        </div>
                        <div className="h-9 w-20 bg-muted rounded-md mt-4" />
                      </div>
                      <div className="h-10 w-full bg-muted rounded-xl mt-8" />
                      <hr className="my-6 border-t border-dashed border-border/80" />
                      <div className="space-y-3">
                        <div className="h-3 w-24 bg-muted rounded-md" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 bg-muted rounded-md" />
                          <div className="h-3 w-28 bg-muted rounded-md" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-pulse">
                {/* Skeleton Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-panel p-5 rounded-2xl border border-border/60 bg-card/50 h-28 flex flex-col justify-between">
                      <div className="h-3 w-16 bg-muted rounded-full" />
                      <div className="h-7 w-24 bg-muted rounded-md mt-2" />
                      <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-muted h-full w-2/3 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skeleton Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Skeleton Chart Card */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[360px]">
                    <div className="space-y-3">
                      <div className="h-4 w-32 bg-muted rounded-md" />
                      <div className="h-3 w-48 bg-muted rounded-md" />
                    </div>
                    {/* Mock bars */}
                    <div className="h-48 flex items-end justify-between gap-4 pt-8 border-b border-border/40 pb-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-1 flex gap-1 h-full items-end justify-center">
                          <div className="w-3 md:w-5 bg-muted rounded-t-md h-1/3" />
                          <div className="w-3 md:w-5 bg-muted/80 rounded-t-md h-1/2" />
                        </div>
                      ))}
                    </div>
                    <div className="h-3 w-40 bg-muted rounded-md mt-4" />
                  </div>

                  {/* Skeleton Agents List */}
                  <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 flex flex-col justify-between min-h-[360px]">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-muted rounded-md" />
                          <div className="h-3 w-36 bg-muted rounded-md" />
                        </div>
                        <div className="h-7 w-16 bg-muted rounded-md" />
                      </div>
                      {/* Rows */}
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="p-3.5 rounded-xl border border-border/50 bg-card/30 flex justify-between items-center gap-3">
                            <div className="space-y-2 flex-1">
                              <div className="h-3 w-20 bg-muted rounded-md" />
                              <div className="h-2 w-28 bg-muted rounded-md" />
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <div className="h-5 w-10 bg-muted rounded-md" />
                              <div className="h-5 w-12 bg-muted rounded-md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-3 w-28 bg-muted rounded-md mt-4" />
                  </div>
                </div>
              </div>
            )
          ) : (
            <>
              {dashboardTab === 'dashboard' && (
                <div className="space-y-8">
                  <StatsBar
                    totalAgents={agents.length}
                    maxAgents={billingInfo?.subscription?.max_agents || 1}
                    minutesUsed={billingInfo?.usage?.minutes_used ?? 0}
                    maxMinutes={billingInfo?.subscription?.max_minutes ?? 100}
                    totalLeads={calls.filter(c => c.leadName && c.leadName !== 'Lead Contact').length || dynamicLeadsCount}
                    avgDuration={dynamicAvgDuration}
                  />
                  <OverviewTab
                    agents={agents}
                    selectedAgentId={selectedAgentId}
                    setSelectedAgentId={setSelectedAgentId}
                    setDashboardTab={setDashboardTab}
                    onNewAgentClick={() => router.push('/onboarding')}
                    agentCalls={agentCalls}
                    allCalls={calls}
                  />
                </div>
              )}

              {dashboardTab === 'leads' && (
                <AgentsTab
                  agentCalls={agentCalls}
                />
              )}

              {dashboardTab === 'pricing' && (
                <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 animate-fade-in-up">
                  <LandingPricing isPricingPage={true} isDashboard={true} />
                </div>
              )}

              {dashboardTab === 'settings' && (
                <SettingsTab
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSubmit={handleEditAgent}
                  onTogglePause={toggleAgentPause}
                  onDeleteAgent={handleDeleteAgent}
                  agentStatus={currentAgent.status}
                  platformVoices={platformVoices}
                  customClonedVoices={customClonedVoices}
                  platformLanguages={platformLanguages}
                  platformModels={platformModels}
                  playingVoiceId={playingVoiceId}
                  voiceGenderFilter={voiceGenderFilter}
                  voiceAccentFilter={voiceAccentFilter}
                  voiceSearchQuery={voiceSearchQuery}
                  setVoiceGenderFilter={setVoiceGenderFilter}
                  setVoiceAccentFilter={setVoiceAccentFilter}
                  setVoiceSearchQuery={setVoiceSearchQuery}
                  onPlayVoice={playVoicePreview}
                  isToneDropdownOpen={isToneDropdownOpen}
                  setIsToneDropdownOpen={setIsToneDropdownOpen}
                  isLlmDropdownOpen={isLlmDropdownOpen}
                  setIsLlmDropdownOpen={setIsLlmDropdownOpen}
                  isLangDropdownOpen={isLangDropdownOpen}
                  setIsLangDropdownOpen={setIsLangDropdownOpen}
                  isGenderDropdownOpen={isGenderDropdownOpen}
                  setIsGenderDropdownOpen={setIsGenderDropdownOpen}
                  isAccentDropdownOpen={isAccentDropdownOpen}
                  setIsAccentDropdownOpen={setIsAccentDropdownOpen}
                  isRecording={isRecording}
                  audioBlob={audioBlob}
                  audioUrl={audioUrl}
                  isCloning={isCloning}
                  recordingSeconds={recordingSeconds}
                  clonedVoiceName={clonedVoiceName}
                  setClonedVoiceName={setClonedVoiceName}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onVoiceUpload={handleVoiceUpload}
                  onCloneVoice={cloneAndApplyVoice}
                  activePlan={billingInfo?.subscription?.plan}
                  editedPrompt={editedPrompt}
                  setEditedPrompt={setEditedPrompt}
                  versions={versions}
                  isDeployingPrompt={isDeployingPrompt}
                  onDeploy={deployPromptVersion}
                  onRestore={(prompt, ver) => { setEditedPrompt(prompt); toast(`Restored Version ${ver}`, 'success'); }}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
