"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Tag } from "../../api/types";
import {
  bulkAssignSubmissionTags,
  createWorkspaceTag,
  getWorkspaceTags,
} from "../../api/client";
import { TAG_COLOR_PRESETS } from "../../lib/tagUtils";
import { notifyError, notifySuccess } from "../ui/AppToast";
import { Spinner } from "../ui/index";
import { TagBadge } from "./TagBadge";

export type SubmissionTagSelectorProps = {
  workspaceId: string;
  submissionId: string;
  assignedTags: Tag[];
  onTagsUpdated: (newTags: Tag[]) => void;
};

export function SubmissionTagSelector({
  workspaceId,
  submissionId,
  assignedTags,
  onTagsUpdated,
}: SubmissionTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaceTags, setWorkspaceTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Quick inline tag creation state inside popover
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagHex, setNewTagHex] = useState<string>(TAG_COLOR_PRESETS[0]);
  const [creatingTag, setCreatingTag] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  const loadWorkspaceTags = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const tags = await getWorkspaceTags(workspaceId);
      setWorkspaceTags(tags);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to load workspace tags");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (isOpen) {
      loadWorkspaceTags();
      setSearchQuery("");
      setIsCreating(false);
    }
  }, [isOpen, loadWorkspaceTags]);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const assignedTagIds = new Set(assignedTags.map((t) => t.id));

  const handleToggleTag = async (tag: Tag) => {
    const isCurrentlyAssigned = assignedTagIds.has(tag.id);
    let nextTagIds: string[];

    if (isCurrentlyAssigned) {
      nextTagIds = assignedTags.filter((t) => t.id !== tag.id).map((t) => t.id);
    } else {
      nextTagIds = [...assignedTags.map((t) => t.id), tag.id];
    }

    setSaving(true);
    try {
      const updatedSubmissionTags = await bulkAssignSubmissionTags(submissionId, {
        tagIds: nextTagIds,
        source: "MANUAL",
      });
      onTagsUpdated(updatedSubmissionTags);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to update tags");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || creatingTag) return;

    setCreatingTag(true);
    try {
      const created = await createWorkspaceTag(workspaceId, {
        name: newTagName.trim(),
        hexCode: newTagHex,
      });

      // Automatically add newly created tag to submission
      const nextTagIds = [...assignedTags.map((t) => t.id), created.id];
      const updatedSubmissionTags = await bulkAssignSubmissionTags(submissionId, {
        tagIds: nextTagIds,
        source: "MANUAL",
      });

      setWorkspaceTags((prev) => [...prev, created]);
      onTagsUpdated(updatedSubmissionTags);
      setNewTagName("");
      setNewTagHex(TAG_COLOR_PRESETS[0]);
      setIsCreating(false);
      notifySuccess(`Tag "${created.name}" created and assigned.`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  };

  const filteredTags = workspaceTags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600 shadow-2xs hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 transition"
        title="Attach/manage tags"
      >
        <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>Tag</span>
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="text-xs font-bold text-slate-800">Assign Tags</span>
            {saving ? <Spinner size="sm" /> : null}
          </div>

          {!isCreating && workspaceTags.length > 4 ? (
            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full rounded-md border border-slate-200 bg-slate-50/70 px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none"
              />
            </div>
          ) : null}

          {loading ? (
            <div className="flex justify-center py-4 text-xs text-slate-400">
              <Spinner size="sm" />
              <span className="ml-2">Loading workspace tags…</span>
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {filteredTags.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-500">
                  {searchQuery ? "No matching tags." : "No workspace tags yet."}
                </div>
              ) : (
                filteredTags.map((tag) => {
                  const isChecked = assignedTagIds.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      disabled={saving}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-left transition ${
                        isChecked
                          ? "bg-violet-50 text-violet-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <TagBadge tag={tag} size="sm" showSource={false} />
                      {isChecked ? (
                        <svg className="h-3.5 w-3.5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Quick inline create tag form */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            {isCreating ? (
              <form onSubmit={handleCreateNewTag} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">New Tag</span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-[10px] font-medium text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name (e.g. High Priority)"
                  autoFocus
                  required
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {TAG_COLOR_PRESETS.slice(0, 7).map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setNewTagHex(hex)}
                      style={{ backgroundColor: hex }}
                      className={`h-4 w-4 rounded-full shrink-0 transition ${
                        newTagHex.toLowerCase() === hex.toLowerCase() ? "ring-2 ring-slate-900 ring-offset-1" : ""
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="submit"
                    disabled={creatingTag || !newTagName.trim()}
                    className="w-full rounded bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition"
                  >
                    {creatingTag ? "Saving…" : "Create & Assign"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-slate-50 py-1.5 text-[11px] font-semibold text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Create new tag</span>
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
