"use client";

import { useCallback, useState } from "react";

type PublicLinkPanelProps = {
  publicUrl: string;
  compact?: boolean;
  emptyMessage?: string;
};

export function PublicLinkPanel({ publicUrl, compact, emptyMessage }: PublicLinkPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [publicUrl]);

  if (!publicUrl) {
    return emptyMessage ? <p className="text-sm text-slate-500">{emptyMessage}</p> : null;
  }

  const inputClass = compact
    ? "w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800"
    : "min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800";

  const btnClass = compact
    ? "rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
    : "shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

  const primaryBtnClass = compact
    ? "flex-1 rounded-lg bg-indigo-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
    : "shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

  return (
    <div className={compact ? "mt-2" : "mt-5"}>
      <div className={`flex gap-2 ${compact ? "flex-col sm:flex-row" : ""}`}>
        <input type="text" readOnly value={publicUrl} className={inputClass} />
        <div className="flex gap-2">
          <button type="button" onClick={handleCopy} className={compact ? primaryBtnClass : btnClass}>
            {copied ? "Copied!" : compact ? "Copy link" : "Copy"}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnClass}
          >
            Open
          </a>
        </div>
      </div>
    </div>
  );
}
