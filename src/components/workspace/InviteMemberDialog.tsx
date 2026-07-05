"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { WorkspaceRole } from "../../api/types";
import { roleLabel } from "../../lib/permissions";
import { Spinner } from "../ui/index";

export const MEMBER_INVITE_ROLES: WorkspaceRole[] = ["EDITOR", "VIEWER"];

type InviteMemberDialogProps = {
  open: boolean;
  inviting?: boolean;
  onClose: () => void;
  onSubmit: (email: string, role: WorkspaceRole) => void;
  inviteUrl?: string | null;
  lastInviteEmail?: string | null;
};

export function InviteMemberDialog({
  open,
  inviting = false,
  onClose,
  onSubmit,
  inviteUrl,
  lastInviteEmail,
}: InviteMemberDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("EDITOR");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("EDITOR");
      setCopied(false);
    }
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    onSubmit(trimmed, role);
  };

  const handleCopyInviteUrl = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Invite team member</h2>
        <p className="mt-1 text-sm text-slate-600">
          Existing users are added immediately. New users receive a secure link to create their account and join your workspace.
        </p>

        {inviteUrl ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">Invite link ready</p>
            <p className="mt-1 text-emerald-800">
              {lastInviteEmail ? (
                <>
                  Share this link with <span className="font-medium">{lastInviteEmail}</span> to activate their account.
                </>
                ) : (
                  "Share this link so they can create their account and join the workspace."
              )}
            </p>
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="mt-3 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-[11px] text-emerald-900"
              aria-label="Invite URL"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyInviteUrl}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                {copied ? "Copied!" : "Copy invite link"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/50"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@example.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
              >
                {MEMBER_INVITE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={inviting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {inviting ? (
                  <>
                    <Spinner size="sm" className="border-white/30 border-t-white" />
                    Sending…
                  </>
                ) : (
                  "Send invite"
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </dialog>
  );
}
