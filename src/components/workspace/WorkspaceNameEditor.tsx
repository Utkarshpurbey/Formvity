"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Spinner } from "../ui/index";

type WorkspaceNameEditorProps = {
  name: string;
  canEdit: boolean;
  saving?: boolean;
  onSave: (workspaceName: string) => void;
};

export function WorkspaceNameEditor({
  name,
  canEdit,
  saving = false,
  onSave,
}: WorkspaceNameEditorProps) {
  const [value, setValue] = useState(name);
  const dirty = value.trim() !== name.trim() && value.trim().length > 0;

  useEffect(() => {
    setValue(name);
  }, [name]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed === name.trim()) return;
    onSave(trimmed);
  };

  if (!canEdit) {
    return <p className="mt-1 font-medium text-slate-900">{name}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={80}
        className="h-10 min-w-[12rem] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
        aria-label="Workspace name"
      />
      <button
        type="submit"
        disabled={!dirty || saving}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <>
            <Spinner size="sm" className="border-white/30 border-t-white" />
            Saving…
          </>
        ) : (
          "Save name"
        )}
      </button>
    </form>
  );
}
