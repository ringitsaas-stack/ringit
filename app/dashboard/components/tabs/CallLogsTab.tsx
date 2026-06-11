'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';

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

interface CallLogsTabProps {
  agentCalls: Call[];
}

export default function CallLogsTab({ agentCalls }: CallLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.portal-tooltip')) {
        return;
      }
      setActiveTooltip(null);
    };
    if (activeTooltip) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [activeTooltip]);

  const filteredCalls = agentCalls.filter((c) => {
    const callerNum = c.caller || '';
    const leadName = c.leadName || '';
    const summary = c.summary || '';
    const intent = c.intent || '';
    const dateStr = c.date || '';

    const matchesSearch =
      callerNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intent.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (dateQuery) {
      const [year, month, day] = dateQuery.split('-');
      const formattedFilterDate = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      matchesDate = dateStr === formattedFilterDate;
    }

    return matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    if (filteredCalls.length === 0) return;
    const headers = ['Phone Number', 'Date', 'Time', 'Duration', 'Summary', 'Transcript'];
    const rows = filteredCalls.map((c) => [
      c.caller,
      c.date || '',
      c.timestamp || '',
      c.duration,
      c.summary || '',
      (c.transcript || c.summary || '').replace(/\n/g, ' '),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `call_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTooltipTrigger = (text: string, displayText: string) => {
    if (!text) return <span className="text-muted-foreground">None</span>;
    return (
      <span
        className="cursor-pointer border-b border-dotted border-muted-foreground/45 hover:text-foreground-blue transition-colors font-semibold"
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          setActiveTooltip({
            text,
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
          });
        }}
      >
        {displayText}
      </span>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6 animate-fade-in border border-border/60 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
          Voice Recordings &amp; Transcript Feed
        </h2>
        {filteredCalls.length > 0 && (
          <button
            onClick={exportToCSV}
            className="bg-secondary text-secondary-foreground text-sm py-1.5 px-3.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm border border-border/40 font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 bg-muted/20 p-4 rounded-xl border border-border/40">
        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <label className="text-[10px] text-muted-foreground font-bold ">Search Call Details</label>
          <input
            type="text"
            placeholder="Search name, phone, intent, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border border-border rounded-lg p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground-blue transition-colors font-semibold"
          />
        </div>
        <div className="w-48 flex flex-col gap-1.5">
          <label className="text-[10px] text-muted-foreground font-bold">Filter By Date</label>
          <input
            type="date"
            value={dateQuery}
            onChange={(e) => setDateQuery(e.target.value)}
            className="bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground-blue transition-colors font-semibold"
          />
        </div>
        {(searchQuery || dateQuery) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setDateQuery('');
              }}
              className="bg-secondary text-secondary-foreground text-sm py-2 px-3 rounded-lg hover:bg-border transition-all font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto w-full border border-border/60 rounded-xl bg-card/40">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
              <th className="p-4 font-bold text-foreground">Number</th>
              <th className="p-4 font-bold text-foreground">Date &amp; Time</th>
              <th className="p-4 font-bold text-foreground">Duration</th>
              <th className="p-4 font-bold text-foreground">Summary</th>
              <th className="p-4 font-bold text-foreground">Transcript</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filteredCalls.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-foreground font-medium">
                  {agentCalls.length === 0 ? 'No transcripts logged for this agent.' : 'No calls matched your filter criteria.'}
                </td>
              </tr>
            ) : (
              filteredCalls.map((call) => {
                const summaryVal = call.summary || 'No summary available.';
                const truncSummary = summaryVal.length > 45 ? `${summaryVal.substring(0, 45)}...` : summaryVal;

                const transcriptVal = call.transcript || call.summary || 'No transcript details.';
                const truncTranscript = transcriptVal.length > 50 ? `${transcriptVal.substring(0, 50)}...` : transcriptVal;

                return (
                  <tr key={call.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-muted-foreground font-bold whitespace-nowrap">
                      {call.caller}
                    </td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {call.date ? `${call.date} @ ${call.timestamp}` : call.timestamp}
                    </td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {call.duration}
                    </td>
                    <td className="p-4 text-muted-foreground min-w-[200px] max-w-xs">
                      {renderTooltipTrigger(summaryVal, truncSummary)}
                    </td>
                    <td className="p-4 min-w-[280px] max-w-sm">
                      {renderTooltipTrigger(transcriptVal, truncTranscript)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Global Fixed Position Tooltip to bypass container overflow clipping (rendered via React Portal) */}
      {activeTooltip && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed p-3.5 bg-zinc-950 text-zinc-100 text-[11.5px] rounded-xl shadow-2xl border border-zinc-800/80 z-[9999] font-sans leading-relaxed whitespace-pre-line max-w-xs max-h-60 overflow-y-auto portal-tooltip cursor-text select-text scrollbar-thin scrollbar-thumb-zinc-800"
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {activeTooltip.text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950" />
        </div>,
        document.body
      )}
    </div>
  );
}
