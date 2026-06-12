import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check } from 'lucide-react';

interface GoogleSheetsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleSheetsHelpModal({ isOpen, onClose }: GoogleSheetsHelpModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const scriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Agent", "Caller Phone", "Duration", "Summary", "Date & Time"]);
    }
    
    // Append the call details
    sheet.appendRow([
      data.name || "Anonymous",
      data.phone || "Not provided",
      data.duration || "N/A",
      data.summary || "No details.",
      data.timestamp || new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop with solid dimming and blur to overlay entire page */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-white border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border/60">
          <div>
            <h2 className="text-base font-bold text-foreground">Connect Google Sheets Webhook</h2>
            <p className="text-xs text-muted-foreground font-medium">Follow these steps to log call transcripts in Google Sheets automatically.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          
          {/* Step 1 */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground-blue/10 text-foreground-blue text-xs flex items-center justify-center font-extrabold">1</span>
              Copy Webhook Script Code
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed pl-7">
              Copy the Google Apps Script code below. This code handles receiving the call summary details and inserting them into your spreadsheet.
            </p>
            <div className="pl-7 relative">
              <pre className="bg-secondary/40 border border-border/80 rounded-xl p-4 text-xs font-mono text-foreground overflow-x-auto max-h-32 leading-relaxed">
                {scriptCode}
              </pre>
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-3 top-3 bg-white hover:bg-secondary/80 border border-border text-foreground text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground-blue/10 text-foreground-blue text-xs flex items-center justify-center font-extrabold">2</span>
              Open Apps Script in your Spreadsheet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed pl-7">
              Open your Google Sheet, click on <strong>Extensions</strong> in the top menu bar, and select <strong>Apps Script</strong>. Paste the code you just copied into the editor. Make sure to click the <strong>Save (floppy disk) icon</strong> at the top of the editor.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground-blue/10 text-foreground-blue text-xs flex items-center justify-center font-extrabold">3</span>
              Deploy as Web App
            </h3>
            <div className="pl-7 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click the blue <strong>Deploy</strong> button (top-right) and select <strong>New deployment</strong>. Configure it exactly like this:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 font-medium">
                <li>Click the gear icon next to "Select type" and select <strong>Web app</strong>.</li>
                <li>Set Execute as to: <strong>Me (your account)</strong>.</li>
                <li>Set Who has access to: <strong>Anyone</strong> (this is crucial for webhook visibility).</li>
                <li>Click <strong>Deploy</strong>.</li>
                <li>Click <strong>Authorize Access</strong>, log in to your account, click <strong>Advanced</strong>, and click <strong>Go to Project (unsafe)</strong> to approve permissions.</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground-blue/10 text-foreground-blue text-xs flex items-center justify-center font-extrabold">4</span>
              Paste Web App URL in settings
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed pl-7">
              Copy the generated <strong>Web App URL</strong> (which starts with <code>https://script.google.com/macros/s/...</code>) and paste it into the Google Sheet input box in your agent settings.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-secondary/20 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="bg-foreground text-background hover:bg-foreground/95 text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
