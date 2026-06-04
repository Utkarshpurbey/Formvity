"use client";

import { useRef } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { usePublishPublicUrl } from "../../hooks/usePublishPublicUrl";
import { PublicLinkPanel } from "./PublicLinkPanel";

type ShareLinkPopoverProps = {
  workspaceId: string;
  formId: string;
  onClose: () => void;
};

export function ShareLinkPopover({ workspaceId, formId, onClose }: ShareLinkPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { publicUrl, loading, error } = usePublishPublicUrl(workspaceId, formId);

  useClickOutside(ref, onClose, true);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10"
      role="dialog"
      aria-label="Share form link"
    >
      <p className="text-xs font-semibold text-slate-800">Share link</p>
      {loading ? (
        <p className="mt-2 text-xs text-slate-500">Loading…</p>
      ) : error ? (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      ) : (
        <PublicLinkPanel publicUrl={publicUrl} compact />
      )}
    </div>
  );
}
