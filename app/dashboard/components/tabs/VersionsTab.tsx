'use client';

import React from 'react';

interface AgentVersion {
  version: number;
  date: string;
  prompt: string;
  tone: string;
  services: string;
}

interface VersionsTabProps {
  editedPrompt: string;
  setEditedPrompt: (val: string) => void;
  versions: AgentVersion[];
  isDeployingPrompt: boolean;
  onDeploy: (promptText: string) => void;
  onRestore: (prompt: string, version: number) => void;
}

export default function VersionsTab({
  editedPrompt,
  setEditedPrompt,
  versions,
  isDeployingPrompt,
  onDeploy,
  onRestore,
}: VersionsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Prompt Editor */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6 border border-border/60">
        <div className="flex justify-between items-center">
          <h3 className=" text-foreground font-semibold text-sm">System Prompt Template</h3>
        </div>

        <textarea
          rows={10}
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          className="w-full bg-card border border-border rounded-xl p-4 text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
        />

        <div className="flex justify-end">
          <button
            disabled={isDeployingPrompt}
            onClick={() => onDeploy(editedPrompt)}
            className="bg-foreground-blue hover:bg-foreground-blue/90 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeployingPrompt ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating Prompt...
              </>
            ) : (
              'Save Prompt'
            )}
          </button>
        </div>
      </div>

      {/* Version History */}
      <div className="glass-panel p-6 rounded-2xl border border-border/60 space-y-4 flex flex-col justify-between">
        <h3 className=" text-foreground text-sm font-semibold">Deployment Backups</h3>
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1.5 p-1.5 scrollbar-thin">
          {versions.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-muted-foreground font-semibold border border-border/60">
              No versions archived yet.
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.version}
                className="glass-panel p-5 rounded-2xl space-y-3 relative group border border-border/60 hover:border-border transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-extrabold text-foreground text-xs">
                      Version {ver.version}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{ver.date}</div>
                  </div>
                  <button
                    onClick={() => onRestore(ver.prompt, ver.version)}
                    className="text-[9px]  text-foreground bg-secondary border border-border px-2 py-1 rounded hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    Restore
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground truncate font-mono bg-card p-2 rounded-lg border border-border/40">
                  &quot;{ver.prompt.substring(0, 60)}...&quot;
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
