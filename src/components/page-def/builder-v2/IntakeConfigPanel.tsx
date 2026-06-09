"use client";

import type { RespondentIntakeField, RespondentFieldType, RespondentIntakeSettings } from "../builder/pageDef";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400";

const FIELD_TYPES: RespondentFieldType[] = ["text", "email", "phone", "number"];

type IntakeConfigPanelProps = {
  intake: RespondentIntakeSettings;
  onChange: (updater: (prev: RespondentIntakeSettings) => RespondentIntakeSettings) => void;
};

export function IntakeConfigPanel({ intake, onChange }: IntakeConfigPanelProps) {
  const updateField = (index: number, patch: Partial<RespondentIntakeField>) => {
    onChange((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }));
  };

  const addField = () => {
    onChange((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: `field-${Date.now().toString(36).slice(-4)}`,
          type: "text",
          label: "New field",
          required: false,
        },
      ],
    }));
  };

  const removeField = (index: number) => {
    onChange((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="shrink-0 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Respondent intake</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Shown before your form. Collect name, email, or custom fields.
        </p>
      </header>
      <div className="flex-1 space-y-4 overflow-auto p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Step title</label>
          <input
            type="text"
            value={intake.title ?? ""}
            onChange={(e) => onChange((p) => ({ ...p, title: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
          <textarea
            value={intake.description ?? ""}
            onChange={(e) => onChange((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fields</p>
            <button
              type="button"
              onClick={addField}
              className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700"
            >
              + Add field
            </button>
          </div>
          {intake.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  className={`${inputClass} flex-1`}
                  placeholder="Label"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, { type: e.target.value as RespondentFieldType })}
                  className="rounded-lg border border-slate-200 px-2 text-sm"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={field.id}
                onChange={(e) => updateField(index, { id: e.target.value })}
                className={inputClass}
                placeholder="Field id (key in submission)"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={field.required === true}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                  />
                  Required
                </label>
                {intake.fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-xs font-medium text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
