"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Tag } from "../../api/types";
import {
  assignSubmissionTag,
  createWorkspaceTag,
  getWorkspaceTags,
  removeSubmissionTag,
} from "../../api/client";
import { TAG_COLOR_PRESETS } from "../../lib/tagUtils";
import { notifyError, notifySuccess } from "../ui/AppToast";
import { Spinner } from "../ui/index";
import { TagBadge } from "./TagBadge";

export type BulkTagSelectorProps = {
  workspaceId: string;
  selectedSubmissionIds: string[];
  onBulkCompleted: () => void;
};

export function BulkTagSelector({
  workspaceId,
  selectedSubmissionIds,
  onBulkCompleted,
}: BulkTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaceTags, setWorkspaceTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleApplyTag = async (tag: Tag) => {
    if (selectedSubmissionIds.length === 0 || applying) return;
    setApplying(true);
    try {
      await Promise.all(
        selectedSubmissionIds.map((subId) =>
          assignSubmissionTag(subId, { tagId: tag.id, source: "MANUAL" }),
        ),
      );
      notifySuccess(`Attached tag "${tag.name}" to ${selectedSubmissionIds.length} responses.`);
      setIsOpen(false);
      onBulkCompleted();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to apply tag in bulk");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveTag = async (tag: Tag) => {
    if (selectedSubmissionIds.length === 0 || applying) return;
    setApplying(true);
    try {
      await Promise.all(
        selectedSubmissionIds.map((subId) => removeSubmissionTag(subId, tag.id)),
      );
      notifySuccess(`Removed tag "${tag.name}" from selected responses.`);
      setIsOpen(false);
      onBulkCompleted();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to remove tag in bulk");
    } finally {
      setApplying(false);
    }
  };

  const handleCreateAndApplyTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || creatingTag || selectedSubmissionIds.length === 0) return;

    setCreatingTag(true);
    try {
      const created = await createWorkspaceTag(workspaceId, {
        name: newTagName.trim(),
        hexCode: newTagHex,
      });

      await Promise.all(
        selectedSubmissionIds.map((subId) =>
          assignSubmissionTag(subId, { tagId: created.id, source: "MANUAL" }),
        ),
      );

      notifySuccess(`Tag "${created.name}" created and applied to ${selectedSubmissionIds.length} responses.`);
      setNewTagName("");
      setNewTagHex(TAG_COLOR_PRESETS[0]);
      setIsCreating(false);
      setIsOpen(false);
      onBulkCompleted();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to create & apply tag");
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
        onClick={() => setIsOpen(!isOpen)}
        disabled={selectedSubmissionIds.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50 transition"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
        <span>Bulk Tag ({selectedSubmissionIds.length})</span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 bottom-full mb-1 z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="text-xs font-bold text-slate-800">
              Apply Tag to {selectedSubmissionIds.length} Selected
            </span>
            {(applying || loading) ? <Spinner size="sm" /> : null}
          </div>

          {!isCreating && workspaceTags.length > 4 ? (
            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspace tags..."
                className="w-full rounded-md border border-slate-200 bg-slate-50/70 px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none"
              />
            </div>
          ) : null}

          {loading ? (
            <div className="flex justify-center py-4 text-xs text-slate-400">
              <Spinner size="sm" />
              <span className="ml-2">Loading tags…</span>
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {filteredTags.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-500">
                  {searchQuery ? "No tags matching search." : "No workspace tags yet."}
                </div>
              ) : (
                filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition"
                  >
                    <TagBadge tag={tag} size="sm" showSource={false} />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleApplyTag(tag)}
                        disabled={applying}
                        className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition"
                      >
                        Attach
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={applying}
                        className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                        title="Remove tag from selected"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-slate-100">
            {isCreating ? (
              <form onSubmit={handleCreateAndApplyTag} className="space-y-2">
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
                  placeholder="New tag name..."
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
                <button
                  type="submit"
                  disabled={creatingTag || !newTagName.trim()}
                  className="w-full rounded bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition"
                >
                  {creatingTag ? "Creating..." : "Create & Attach to Selected"}
                </button>
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
                <span>Create & Attach New Tag</span>
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
