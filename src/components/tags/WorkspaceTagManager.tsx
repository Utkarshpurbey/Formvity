"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Tag } from "../../api/types";
import {
  createWorkspaceTag,
  deleteTag,
  getWorkspaceTags,
  updateTag,
} from "../../api/client";
import { TAG_COLOR_PRESETS } from "../../lib/tagUtils";
import { notifyError, notifySuccess } from "../ui/AppToast";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Spinner } from "../ui/index";
import { TagBadge } from "./TagBadge";

export type WorkspaceTagManagerProps = {
  workspaceId: string;
  canManage?: boolean;
  onTagsChanged?: (tags: Tag[]) => void;
};

export function WorkspaceTagManager({
  workspaceId,
  canManage = true,
  onTagsChanged,
}: WorkspaceTagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // New tag form state
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState<string>(TAG_COLOR_PRESETS[0]);
  const [isCreatingOpen, setIsCreatingOpen] = useState(false);

  // Edit tag state
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation state
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTags = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await getWorkspaceTags(workspaceId);
      setTags(data);
      if (onTagsChanged) onTagsChanged(data);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to load workspace tags");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, onTagsChanged]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;

    setCreating(true);
    try {
      const created = await createWorkspaceTag(workspaceId, {
        name: newName.trim(),
        hexCode: newHex,
      });
      const updated = [...tags, created];
      setTags(updated);
      if (onTagsChanged) onTagsChanged(updated);
      setNewName("");
      setNewHex(TAG_COLOR_PRESETS[0]);
      setIsCreatingOpen(false);
      notifySuccess(`Tag "${created.name}" created successfully.`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditHex(tag.hexCode);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editName.trim() || savingEdit) return;

    setSavingEdit(true);
    try {
      const updated = await updateTag(editingTag.id, {
        name: editName.trim(),
        hexCode: editHex,
      });
      const nextTags = tags.map((t) => (t.id === updated.id ? updated : t));
      setTags(nextTags);
      if (onTagsChanged) onTagsChanged(nextTags);
      setEditingTag(null);
      notifySuccess(`Tag updated successfully.`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to update tag");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!tagToDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteTag(tagToDelete.id);
      const nextTags = tags.filter((t) => t.id !== tagToDelete.id);
      setTags(nextTags);
      if (onTagsChanged) onTagsChanged(nextTags);
      notifySuccess(`Tag "${tagToDelete.name}" deleted.`);
      setTagToDelete(null);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to delete tag");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Workspace Tags</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Create and organize tags to label responses and submissions across this workspace.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => setIsCreatingOpen(!isCreatingOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>{isCreatingOpen ? "Cancel" : "Create Tag"}</span>
          </button>
        ) : null}
      </div>

      {/* New Tag Form */}
      {isCreatingOpen ? (
        <form onSubmit={handleCreate} className="mt-4 rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-800">New Tag</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="block text-xs text-slate-600 mb-1">Tag Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Critical Bug, Lead, Follow up"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Color Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newHex}
                  onChange={(e) => setNewHex(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                  title="Choose custom hex code"
                />
                <span className="font-mono text-xs text-slate-600 uppercase">{newHex}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1.5">Preset Swatches</label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_COLOR_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setNewHex(hex)}
                  style={{ backgroundColor: hex }}
                  className={`h-6 w-6 rounded-full transition transform hover:scale-110 ${
                    newHex.toLowerCase() === hex.toLowerCase() ? "ring-2 ring-slate-900 ring-offset-2" : ""
                  }`}
                  title={hex}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
            >
              {creating ? <Spinner size="sm" /> : null}
              <span>Save Tag</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingOpen(false)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {/* Edit Modal / Inline Overlay */}
      {editingTag ? (
        <form onSubmit={handleSaveEdit} className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-800">Edit Tag</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="block text-xs text-slate-600 mb-1">Tag Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Color Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editHex}
                  onChange={(e) => setEditHex(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                />
                <span className="font-mono text-xs text-slate-600 uppercase">{editHex}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={savingEdit || !editName.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {savingEdit ? <Spinner size="sm" /> : null}
              <span>Update Tag</span>
            </button>
            <button
              type="button"
              onClick={() => setEditingTag(null)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {/* Tags List */}
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-6 text-sm text-slate-400">
            <Spinner size="sm" />
            <span className="ml-2">Loading tags…</span>
          </div>
        ) : tags.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
            No tags created yet. Click <span className="font-semibold text-slate-700">Create Tag</span> to get started.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 hover:bg-slate-100/70 transition"
              >
                <TagBadge tag={tag} showSource={false} />
                {canManage ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(tag)}
                      className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 transition"
                      title="Edit tag"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagToDelete(tag)}
                      className="rounded p-1 text-slate-400 hover:bg-white hover:text-rose-600 transition"
                      title="Delete tag"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(tagToDelete)}
        title="Delete tag?"
        description={
          <>
            Tag <span className="font-semibold text-slate-900">{tagToDelete?.name}</span> will be removed from the workspace and unattached from submissions.
          </>
        }
        confirmLabel="Delete tag"
        confirmingLabel="Deleting…"
        confirming={deleting}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
