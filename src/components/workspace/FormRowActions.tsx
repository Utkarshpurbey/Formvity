"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import type { FormSummary } from "../../api/types";
import { FormStatusBadge } from "../ui/FormStatusBadge";
import { ShareLinkPopover } from "../publish/ShareLinkPopover";
import { Spinner } from "../ui/Spinner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { archiveForm } from "../../store/slices/formsSlice";
import { useClickOutside } from "../../hooks/useClickOutside";

type FormRowActionsProps = {
  form: FormSummary;
  workspaceId: string;
};

export function FormRowActions({ form, workspaceId }: FormRowActionsProps) {
  const dispatch = useAppDispatch();
  const archiving = useAppSelector((s) => Boolean(s.forms.archivingFormIds[form.id]));
  const [shareOpen, setShareOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPublished = form.status === "PUBLISHED";

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const handleArchive = () => {
    if (archiving) return;
    setMenuOpen(false);
    dispatch(archiveForm({ workspaceId, formId: form.id }))
      .unwrap()
      .then(() => toast.info("Form archived."))
      .catch((e: Error) => toast.error(e.message));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FormStatusBadge status={form.status} showLiveDot />
      <Link
        href={`/builder?workspaceId=${workspaceId}&formId=${form.id}`}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Edit
      </Link>
      {isPublished ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShareOpen((o) => !o);
              setMenuOpen(false);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Share
          </button>
          {shareOpen ? (
            <ShareLinkPopover workspaceId={workspaceId} formId={form.id} onClose={() => setShareOpen(false)} />
          ) : null}
        </div>
      ) : null}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => {
            setMenuOpen((o) => !o);
            setShareOpen(false);
          }}
          aria-label="More actions"
          className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          ⋯
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleArchive}
              disabled={archiving}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {archiving ? (
                <>
                  <Spinner size="sm" />
                  Archiving…
                </>
              ) : (
                "Archive"
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
