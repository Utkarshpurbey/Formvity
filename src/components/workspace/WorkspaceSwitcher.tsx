"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceSummary } from "../../api/types";
import { persistActiveWorkspaceId } from "../../lib/activeWorkspaceStorage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createWorkspace, setActiveWorkspace } from "../../store/slices/workspaceSlice";
import { normalizeWorkspaceSummary } from "../../lib/apiNormalize";
import { notifyError, notifySuccess } from "../ui/AppToast";
import { AppLink } from "../ui/AppLink";
import { Spinner } from "../ui/index";
import { WorkspaceAvatar } from "./WorkspaceAvatar";

type WorkspaceSwitcherProps = {
  activeWorkspaceId: string | null;
  activeWorkspaceName: string;
  collapsed?: boolean;
};

export function WorkspaceSwitcher({
  activeWorkspaceId,
  activeWorkspaceName,
  collapsed = false,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector((s) => s.workspace.list);
  const creating = useAppSelector((s) => s.workspace.creating);
  const [open, setOpen] = useState(false);
  const [creatingInline, setCreatingInline] = useState(false);
  const [newName, setNewName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const switchTo = useCallback(
    (ws: WorkspaceSummary) => {
      persistActiveWorkspaceId(ws.workSpaceId);
      dispatch(setActiveWorkspace(ws.workSpaceId));
      setOpen(false);
      router.push(`/workspaces/${ws.workSpaceId}`);
    },
    [dispatch, router],
  );

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreatingInline(false);
      }
    }
    if (open) document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || creating) return;
    try {
      const raw = await dispatch(createWorkspace(name)).unwrap();
      notifySuccess("Workspace created.");
      const ws = normalizeWorkspaceSummary(raw);
      if (ws.workSpaceId) {
        persistActiveWorkspaceId(ws.workSpaceId);
        dispatch(setActiveWorkspace(ws.workSpaceId));
        setOpen(false);
        setCreatingInline(false);
        setNewName("");
        router.push(`/workspaces/${ws.workSpaceId}`);
      }
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Unable to create workspace.");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {!collapsed ? (
        <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={activeWorkspaceName}
        className={`group flex w-full items-center rounded-lg text-left transition ${
          collapsed
            ? "justify-center p-1.5 hover:bg-slate-100"
            : "gap-2 px-1.5 py-1.5 hover:bg-slate-100/90"
        } ${open && !collapsed ? "bg-slate-100/90" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <WorkspaceAvatar name={activeWorkspaceName} size="sm" />
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-slate-900">{activeWorkspaceName}</span>
              <span className="block truncate text-[11px] text-slate-500">
                {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}
              </span>
            </span>
            <svg
              className={`size-3.5 shrink-0 text-slate-400 transition group-hover:text-slate-600 ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </>
        ) : null}
      </button>

      {open ? (
        <div
          className={`absolute z-50 mt-1 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-lg ring-1 ring-black/[0.04] ${
            collapsed ? "left-0 w-60" : "inset-x-0"
          }`}
          role="listbox"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Switch workspace</p>
            <AppLink
              href="/workspaces"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium text-violet-600 hover:text-violet-700"
            >
              See all
            </AppLink>
          </div>

          <ul className="max-h-52 overflow-y-auto py-1">
            {workspaces.map((ws) => {
              const active = ws.workSpaceId === activeWorkspaceId;
              return (
                <li key={ws.workSpaceId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => switchTo(ws)}
                    className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition ${
                      active ? "bg-violet-50/80" : "hover:bg-slate-50"
                    }`}
                  >
                    <WorkspaceAvatar name={ws.workSpaceName} size="sm" />
                    <span
                      className={`min-w-0 flex-1 truncate text-xs ${active ? "font-semibold text-violet-900" : "font-medium text-slate-700"}`}
                    >
                      {ws.workSpaceName}
                    </span>
                    {active ? (
                      <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                        Active
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-slate-100 p-2">
            {creatingInline ? (
              <div className="space-y-1.5">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Workspace name…"
                  autoFocus
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") setCreatingInline(false);
                  }}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={creating || !newName.trim()}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    {creating ? <Spinner size="sm" className="border-white/30 border-t-white" /> : null}
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatingInline(false)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingInline(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-700"
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New workspace
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
