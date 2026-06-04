import { useState } from "react";
import type { FormDef, FormPageDef, PageComponentDef } from "./pageDef";
import { REGISTRY, getVariantProps } from "./registry";
import type { RegistryKey } from "./registry";
import { DRAG_TYPE } from "./ComponentPalette";
import { getDefaultComponentDef } from "./defaults";
import { FormHeader } from "./FormHeader";
import {
  formAccentBarClass,
  formCardShellClass,
  getAppearance,
  getAppearanceStyles,
  getFormCardBoxShadow,
  getInputChromeParentClass,
  getSubmitButtonClass,
} from "./appearance";

const DRAG_COMPONENT_ID = "application/x-pagedef-component-id";

function reorderComponents(
  components: PageComponentDef[],
  draggedId: string,
  dropTargetId: string,
): PageComponentDef[] {
  if (draggedId === dropTargetId) return components;
  const comp = components.find((c) => c.id === draggedId);
  if (!comp) return components;
  const without = components.filter((c) => c.id !== draggedId);
  const dropIndex = without.findIndex((c) => c.id === dropTargetId);
  if (dropIndex === -1) return [...without, comp];
  const next = [...without];
  next.splice(dropIndex, 0, comp);
  return next;
}

interface PageCanvasProps {
  formDef: FormDef;
  page: FormPageDef;
  pageIndex: number;
  totalPages: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onFormDefChange: (updater: (prev: FormDef) => FormDef) => void;
  onPageChange: (updater: (prev: FormPageDef) => FormPageDef) => void;
  isLastPage?: boolean;
  isFirstPage?: boolean;
}

export default function PageCanvas({
  formDef,
  page,
  pageIndex,
  totalPages,
  selectedId,
  onSelect,
  onFormDefChange,
  onPageChange,
  isLastPage = true,
  isFirstPage = true,
}: PageCanvasProps) {
  const progressPct = totalPages > 1 ? ((pageIndex + 1) / totalPages) * 100 : 100;
  const appearance = getAppearance(formDef);
  const appearanceVars = getAppearanceStyles(formDef);
  const inputChromeParent = getInputChromeParentClass(appearance);
  const submitButtonClass = getSubmitButtonClass(appearance);
  const [values, setValues] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const [dropZoneOver, setDropZoneOver] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes(DRAG_COMPONENT_ID) ? "move" : "copy";
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const draggedId = e.dataTransfer.getData(DRAG_COMPONENT_ID);
    const type = e.dataTransfer.getData(DRAG_TYPE);
    if (draggedId) {
      onPageChange((prev) => {
        const comp = prev.components.find((c) => c.id === draggedId);
        if (!comp) return prev;
        const rest = prev.components.filter((c) => c.id !== draggedId);
        return { ...prev, components: [...rest, comp] };
      });
      return;
    }
    if (!type) return;
    const def = getDefaultComponentDef(type);
    if (!def) return;
    onPageChange((prev) => ({
      ...prev,
      components: [...prev.components, def],
    }));
    onSelect(def.id);
  };

  const handleRowDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData(DRAG_COMPONENT_ID, id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleInsertBefore = (e: React.DragEvent, dropTargetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData(DRAG_COMPONENT_ID);
    const type = e.dataTransfer.getData(DRAG_TYPE);
    if (draggedId) {
      onPageChange((prev) => ({
        ...prev,
        components: reorderComponents(prev.components, draggedId, dropTargetId),
      }));
      return;
    }
    if (type) {
      const def = getDefaultComponentDef(type);
      if (def) {
        const dropIndex = page.components.findIndex((c) => c.id === dropTargetId);
        if (dropIndex === -1) return;
        onPageChange((prev) => ({
          ...prev,
          components: [...prev.components.slice(0, dropIndex), def, ...prev.components.slice(dropIndex)],
        }));
        onSelect(def.id);
      }
    }
  };

  const dropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes(DRAG_COMPONENT_ID)) e.dataTransfer.dropEffect = "move";
    else if (e.dataTransfer.types.includes(DRAG_TYPE)) e.dataTransfer.dropEffect = "copy";
  };

  const handleChange = (id: string) => (value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.2rem] border border-slate-300/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
      style={{
        ...appearanceVars,
        backgroundColor: "var(--fb-bg)",
        color: "var(--fb-text)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 75% at 50% -28%, color-mix(in srgb, var(--fb-primary) 30%, transparent), transparent 52%)",
        }}
      />
      <div className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col p-3 sm:p-4">
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--fb-muted)]">
          Preview · Page {pageIndex + 1} of {totalPages}
        </p>
        <div
          className={`${formCardShellClass} flex min-h-0 flex-1 flex-col overflow-hidden bg-[color:var(--fb-surface)] text-[color:var(--fb-text)]`}
          style={{ boxShadow: getFormCardBoxShadow(formDef) }}
        >
          <div className={formAccentBarClass} />
          <FormHeader
            variant="editable"
            pageDef={{ title: formDef.title, description: formDef.description }}
            onTitleChange={(title) => onFormDefChange((prev) => ({ ...prev, title }))}
            onDescriptionChange={(description) => onFormDefChange((prev) => ({ ...prev, description }))}
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-0 flex-1 flex-col overflow-auto px-4 py-4 pb-6 transition-colors duration-200 sm:px-6 sm:py-5 ${inputChromeParent} ${
              dragOver ? "bg-[color:color-mix(in_srgb,var(--fb-primary)_7%,var(--fb-surface))]" : ""
            }`}
          >
            {page.components.length === 0 && (
              <div className="flex min-h-[220px] items-center justify-center text-center text-sm text-[color:var(--fb-muted)]">
                Drag fields from the palette onto this page.
              </div>
            )}
            <div className="space-y-8">
              {page.components.map((comp) => {
                const { id, type, onChange: _ignoredOnChange, ...rawProps } = comp;
                void _ignoredOnChange;
                const Component = REGISTRY[type as RegistryKey];
                const isSelected = selectedId === id;
                if (!Component)
                  return (
                    <div key={id} className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
                      Unknown: {type}
                    </div>
                  );
                const value = values[id] ?? "";
                const props: Record<string, unknown> = {
                  value,
                  onChange: handleChange(id),
                  ...rawProps,
                  ...getVariantProps(type),
                };
                if ((type === "select" || type === "radio" || type === "multiselect") && !Array.isArray(props.options))
                  props.options = [];

                return (
                  <div key={id} className="relative">
                    <div
                      className={`flex min-h-[32px] items-center justify-center rounded transition-all ${
                        dropZoneOver === `before-${id}`
                          ? "min-h-[48px] border-2 border-dashed border-indigo-400 bg-indigo-100"
                          : "border-2 border-transparent"
                      }`}
                      onDragOver={(e) => {
                        dropZoneDragOver(e);
                        setDropZoneOver(`before-${id}`);
                      }}
                      onDragLeave={() => setDropZoneOver(null)}
                      onDrop={(e) => {
                        setDropZoneOver(null);
                        handleInsertBefore(e, id);
                      }}
                    >
                      {dropZoneOver === `before-${id}` ? (
                        <span className="text-xs font-medium text-indigo-600">Drop to insert above</span>
                      ) : (
                        <span className="text-xs text-slate-300">·</span>
                      )}
                    </div>
                    <div
                      draggable
                      onDragStart={(e) => handleRowDragStart(e, id)}
                      onDragOver={(e) => {
                        if (
                          e.dataTransfer.types.includes(DRAG_COMPONENT_ID) ||
                          e.dataTransfer.types.includes(DRAG_TYPE)
                        ) {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.dataTransfer.types.includes(DRAG_COMPONENT_ID)) e.dataTransfer.dropEffect = "move";
                          else e.dataTransfer.dropEffect = "copy";
                          setDropZoneOver(`row-${id}`);
                        }
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropZoneOver(null);
                      }}
                      onDrop={(e) => {
                        setDropZoneOver(null);
                        handleInsertBefore(e, id);
                      }}
                      onClick={() => onSelect(id)}
                      className={`group mt-2 flex cursor-pointer items-start gap-2 rounded-xl border-2 transition-all ${
                        dropZoneOver === `row-${id}`
                          ? "border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-500/30"
                          : isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/20"
                            : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <span
                        className="mt-4 shrink-0 cursor-grab rounded p-1.5 text-slate-400 active:cursor-grabbing hover:text-slate-600"
                        title="Drag to reorder"
                        aria-hidden
                      >
                        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="9" cy="6" r="1.5" />
                          <circle cx="9" cy="12" r="1.5" />
                          <circle cx="9" cy="18" r="1.5" />
                          <circle cx="15" cy="6" r="1.5" />
                          <circle cx="15" cy="12" r="1.5" />
                          <circle cx="15" cy="18" r="1.5" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1 py-0.5">
                        <Component {...props} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 border-t border-[color:color-mix(in_srgb,var(--fb-text)_8%,var(--fb-surface))] pt-5 sm:pt-6">
              {totalPages > 1 ? (
                <div className="mb-5 space-y-2">
                  <div
                    className="h-0.5 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--fb-text)_12%,var(--fb-surface))]"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-[color:var(--fb-primary)]"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[color:var(--fb-muted)]">
                    Page {pageIndex + 1} of {totalPages}
                  </p>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-[4.5rem]">
                  {!isFirstPage ? (
                    <span className="text-sm font-medium text-[color:var(--fb-primary)] opacity-60">Back</span>
                  ) : null}
                </div>
                <button type="button" className={submitButtonClass} onClick={() => undefined}>
                  {isLastPage ? "Submit" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
