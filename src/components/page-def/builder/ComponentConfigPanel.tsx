import type { FormAppearanceSettings, FormDef, FormPageDef, PageComponentDef } from "./pageDef";
import { COMPONENT_SPECS, getTypeGroup } from "../../../reference/component-reference-data";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const APPEARANCE_PRESETS: { name: string; tag: string; appearance: FormAppearanceSettings }[] = [
  {
    name: "Indigo",
    tag: "SaaS",
    appearance: {
      primaryColor: "#4f46e5",
      backgroundColor: "#eef2ff",
      surfaceColor: "#ffffff",
      textColor: "#0f172a",
      borderRadius: "md",
      submitStyle: "solid",
      inputStyle: "outline",
    },
  },
  {
    name: "Teal",
    tag: "Care",
    appearance: {
      primaryColor: "#0d9488",
      backgroundColor: "#ecfdf5",
      surfaceColor: "#ffffff",
      textColor: "#0f172a",
      borderRadius: "lg",
      submitStyle: "soft",
      inputStyle: "filled",
    },
  },
  {
    name: "Rose",
    tag: "Bold",
    appearance: {
      primaryColor: "#e11d48",
      backgroundColor: "#fff1f2",
      surfaceColor: "#ffffff",
      textColor: "#1e1b4b",
      borderRadius: "lg",
      submitStyle: "solid",
      inputStyle: "outline",
    },
  },
  {
    name: "Amber",
    tag: "Warm",
    appearance: {
      primaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      surfaceColor: "#ffffff",
      textColor: "#1c1917",
      borderRadius: "md",
      submitStyle: "outline",
      inputStyle: "outline",
    },
  },
  {
    name: "Midnight",
    tag: "Dark",
    appearance: {
      primaryColor: "#38bdf8",
      backgroundColor: "#0f172a",
      surfaceColor: "#1e293b",
      textColor: "#f8fafc",
      borderRadius: "md",
      submitStyle: "solid",
      inputStyle: "filled",
    },
  },
  {
    name: "Slate",
    tag: "Editorial",
    appearance: {
      primaryColor: "#0f172a",
      backgroundColor: "#f1f5f9",
      surfaceColor: "#ffffff",
      textColor: "#0f172a",
      borderRadius: "sm",
      submitStyle: "outline",
      inputStyle: "outline",
    },
  },
];

interface ComponentConfigPanelProps {
  formDef: FormDef;
  selectedComponent: PageComponentDef | null;
  onFormDefChange: (updater: (prev: FormDef) => FormDef) => void;
  onPageChange: (updater: (prev: FormPageDef) => FormPageDef) => void;
  onClearSelection: () => void;
  onDeleteSelected?: () => void;
}

export default function ComponentConfigPanel({
  formDef,
  selectedComponent,
  onFormDefChange,
  onPageChange,
  onClearSelection,
  onDeleteSelected,
}: ComponentConfigPanelProps) {
  const updateSelected = (updates: Partial<PageComponentDef>) => {
    if (!selectedComponent) return;
    onPageChange((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === selectedComponent.id ? { ...c, ...updates } : c
      ),
    }));
  };

  if (!selectedComponent) {
    const appearance = formDef.formSettings?.appearance ?? {};
    const updateAppearance = (updates: Record<string, unknown>) => {
      onFormDefChange((prev) => ({
        ...prev,
        formSettings: {
          ...prev.formSettings,
          appearance: {
            ...(prev.formSettings?.appearance ?? {}),
            ...updates,
          },
        },
      }));
    };

    const applyPreset = (preset: FormAppearanceSettings) => {
      onFormDefChange((prev) => ({
        ...prev,
        formSettings: {
          ...prev.formSettings,
          appearance: { ...preset },
        },
      }));
    };

    return (
      <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-slate-50 to-white">
        <header className="shrink-0 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-900">Look &amp; feel</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Themes and colors for the respondent preview.
          </p>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-auto p-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Themes</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {APPEARANCE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p.appearance)}
                  className="group overflow-hidden rounded-xl border border-slate-200/90 bg-white text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <div
                    className="relative h-11 w-full"
                    style={{ background: p.appearance.backgroundColor ?? "#f8fafc" }}
                  >
                    <div
                      className="absolute bottom-2 left-2 flex h-7 w-[calc(100%-1rem)] items-center gap-2 rounded-md px-2 shadow-sm ring-1 ring-black/5"
                      style={{ background: p.appearance.surfaceColor ?? "#fff" }}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full shadow-inner ring-1 ring-black/10"
                        style={{ background: p.appearance.primaryColor ?? "#4f46e5" }}
                        aria-hidden
                      />
                      <span className="truncate text-[11px] font-semibold text-slate-800">{p.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{p.tag}</span>
                    <span className="text-[10px] font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">
                      Apply
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Custom colors</p>
            <div className="mt-3 space-y-3">
              <ColorRow
                label="Accent"
                value={String(appearance.primaryColor ?? "#4f46e5")}
                onChange={(v) => updateAppearance({ primaryColor: v })}
              />
              <ColorRow
                label="Page"
                value={String(appearance.backgroundColor ?? "#eef2ff")}
                onChange={(v) => updateAppearance({ backgroundColor: v })}
              />
              <ColorRow
                label="Card"
                value={String(appearance.surfaceColor ?? "#ffffff")}
                onChange={(v) => updateAppearance({ surfaceColor: v })}
              />
              <ColorRow
                label="Text"
                value={String(appearance.textColor ?? "#0f172a")}
                onChange={(v) => updateAppearance({ textColor: v })}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Corners
              </label>
              <select
                value={String(appearance.borderRadius ?? "md")}
                onChange={(e) => updateAppearance({ borderRadius: e.target.value })}
                className={inputClass}
              >
                <option value="sm">Tight</option>
                <option value="md">Balanced</option>
                <option value="lg">Soft</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Primary button
              </label>
              <select
                value={String(appearance.submitStyle ?? "solid")}
                onChange={(e) => updateAppearance({ submitStyle: e.target.value })}
                className={inputClass}
              >
                <option value="solid">Solid + glow</option>
                <option value="soft">Soft tint</option>
                <option value="outline">Outline</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Fields
              </label>
              <select
                value={String(appearance.inputStyle ?? "outline")}
                onChange={(e) => updateAppearance({ inputStyle: e.target.value })}
                className={inputClass}
              >
                <option value="outline">Outline</option>
                <option value="filled">Filled</option>
              </select>
            </div>
          </div>

          <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
            Select a field on the canvas to edit labels, validation, and options.
          </p>
        </div>
      </div>
    );
  }

  const spec = COMPONENT_SPECS.find((s) => s.type === selectedComponent.type);
  const comp = selectedComponent as Record<string, unknown>;

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <header className="shrink-0 px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Config</h2>
          <p className="text-xs text-slate-500 mt-0.5">Edit selected component</p>
        </div>
        <div className="flex gap-1">
          {onDeleteSelected && (
            <button
              type="button"
              onClick={onDeleteSelected}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClearSelection}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">ID</label>
          <input
            type="text"
            value={String(comp.id ?? "")}
            onChange={(e) => updateSelected({ id: e.target.value })}
            className={inputClass}
            placeholder="e.g. number0da1"
          />
          <p className="text-xs text-slate-500 mt-0.5">Auto-generated as type + short id; you can edit.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
          {(() => {
            const typeGroup = getTypeGroup(String(comp.type ?? ""));
            if (typeGroup && typeGroup.length > 0) {
              return (
                <select
                  value={String(comp.type ?? "")}
                  onChange={(e) => updateSelected({ type: e.target.value as PageComponentDef["type"] })}
                  className={inputClass}
                >
                  {typeGroup.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              );
            }
            return (
              <input
                type="text"
                value={String(comp.type ?? "")}
                disabled
                className={inputClass + " opacity-70 bg-slate-50 cursor-not-allowed"}
              />
            );
          })()}
          {getTypeGroup(String(comp.type ?? "")) && (
            <p className="text-xs text-slate-500 mt-0.5">Change type in this group</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
          <input
            type="text"
            value={String(comp.label ?? "")}
            onChange={(e) => updateSelected({ label: e.target.value })}
            className={inputClass}
            placeholder="Label"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Helper text</label>
          <input
            type="text"
            value={String(comp.helperText ?? "")}
            onChange={(e) => updateSelected({ helperText: e.target.value })}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(comp.required)}
            onChange={(e) => updateSelected({ required: e.target.checked })}
            className="size-4 rounded border-slate-300 text-indigo-600"
          />
          <span className="text-sm text-slate-700">Required</span>
        </label>
        {(spec?.specificProps?.some((p) => p.name === "placeholder") ?? true) && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Placeholder</label>
            <input
              type="text"
              value={String(comp.placeholder ?? "")}
              onChange={(e) => updateSelected({ placeholder: e.target.value })}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        )}
        {(selectedComponent.type === "select" ||
          selectedComponent.type === "radio" ||
          selectedComponent.type === "multiselect") && (
          <>
            <OptionsEditor
              options={Array.isArray(comp.options) ? (comp.options as string[]) : []}
              onChange={(options) => updateSelected({ options })}
            />
            {(selectedComponent.type === "radio" || selectedComponent.type === "multiselect") && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedComponent.type === "multiselect"}
                  onChange={(e) =>
                    updateSelected(
                      e.target.checked ? { type: "multiselect" } : { type: "radio" }
                    )
                  }
                  className="size-4 rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm text-slate-700">Multi select (checkboxes)</span>
              </label>
            )}
          </>
        )}
        {selectedComponent.type === "textarea" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Rows</label>
            <input
              type="number"
              value={Number(comp.rows) || 4}
              onChange={(e) => updateSelected({ rows: e.target.value ? Number(e.target.value) : undefined })}
              className={inputClass}
              min={1}
            />
          </div>
        )}
        {selectedComponent.type === "checkbox" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Checkbox label</label>
            <input
              type="text"
              value={String(comp.checkboxLabel ?? "Yes")}
              onChange={(e) => updateSelected({ checkboxLabel: e.target.value })}
              className={inputClass}
            />
          </div>
        )}
        {(selectedComponent.type === "number" || selectedComponent.type === "date" || selectedComponent.type === "time") && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Min</label>
              <input
                type={selectedComponent.type === "number" ? "number" : "text"}
                value={comp.min != null ? String(comp.min) : ""}
                onChange={(e) =>
                  updateSelected({
                    min: selectedComponent.type === "number" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value || undefined,
                  })
                }
                className={inputClass}
                placeholder={selectedComponent.type === "number" ? undefined : "e.g. 1900-01-01"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max</label>
              <input
                type={selectedComponent.type === "number" ? "number" : "text"}
                value={comp.max != null ? String(comp.max) : ""}
                onChange={(e) =>
                  updateSelected({
                    max: selectedComponent.type === "number" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value || undefined,
                  })
                }
                className={inputClass}
                placeholder={selectedComponent.type === "number" ? undefined : "e.g. 2025-12-31"}
              />
            </div>
          </>
        )}
        {selectedComponent.type === "rating" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Max stars</label>
            <input
              type="number"
              min={1}
              max={10}
              value={Number(comp.maxStars) || 5}
              onChange={(e) => updateSelected({ maxStars: e.target.value ? Number(e.target.value) : 5 })}
              className={inputClass}
            />
          </div>
        )}
        {selectedComponent.type === "scale" && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Min label</label>
              <input
                type="text"
                value={String(comp.minLabel ?? "")}
                onChange={(e) => updateSelected({ minLabel: e.target.value || undefined })}
                className={inputClass}
                placeholder="Not likely"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max label</label>
              <input
                type="text"
                value={String(comp.maxLabel ?? "")}
                onChange={(e) => updateSelected({ maxLabel: e.target.value || undefined })}
                className={inputClass}
                placeholder="Very likely"
              />
            </div>
          </>
        )}
        {selectedComponent.type === "section" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Body text</label>
            <textarea
              value={String(comp.body ?? "")}
              onChange={(e) => updateSelected({ body: e.target.value || undefined })}
              rows={4}
              className={inputClass}
              placeholder="Instructions or description for this section"
            />
          </div>
        )}
        {selectedComponent.type === "file" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Accepted files</label>
            <input
              type="text"
              value={String(comp.accept ?? "")}
              onChange={(e) => updateSelected({ accept: e.target.value || undefined })}
              className={inputClass}
              placeholder=".pdf,.doc,image/*"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const safe = /^#[0-9a-fA-F]{6}$/i.test(value.trim()) ? value.trim() : "#4f46e5";
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[11px] font-medium text-slate-600">{label}</span>
      <input
        type="color"
        aria-label={`${label} color`}
        value={safe}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5 shadow-inner"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          const t = value.trim();
          if (/^#[0-9a-fA-F]{6}$/i.test(t)) onChange(t);
        }}
        spellCheck={false}
        className={`${inputClass} flex-1 font-mono text-xs`}
      />
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const add = () => onChange([...options, `Option ${options.length + 1}`]);
  const remove = (i: number) => onChange(options.filter((_, j) => j !== i));
  const update = (i: number, value: string) =>
    onChange(options.map((o, j) => (j === i ? value : o)));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-slate-600">Options</label>
        <button
          type="button"
          onClick={add}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + Add
        </button>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={opt}
              onChange={(e) => update(i, e.target.value)}
              className={inputClass + " flex-1"}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="px-2 text-slate-400 hover:text-rose-500 shrink-0"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-slate-500">No options. Click + Add.</p>
        )}
      </div>
    </div>
  );
}
