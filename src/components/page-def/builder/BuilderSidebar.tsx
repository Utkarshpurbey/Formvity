"use client";

import type React from "react";
import type { FormDef, FormPageDef, PageComponentDef, PageComponentType } from "./pageDef";
import { duplicatePage, getPageIndex, newPageId } from "../../../lib/normalizeFormDef";
import { COMPONENT_SPECS, getPaletteSpecs } from "../../../reference/component-reference-data";

const inputClass =
  "min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const iconBtn =
  "flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-sm leading-none text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35";

type PageOperationsPanelProps = {
  formDef: FormDef;
  activePageId: string;
  onActivePageChange: (pageId: string) => void;
  onFormDefChange: (updater: (prev: FormDef) => FormDef) => void;
  onClearSelection: () => void;
};

function PageOperationsPanel({
  formDef,
  activePageId,
  onActivePageChange,
  onFormDefChange,
  onClearSelection,
}: PageOperationsPanelProps) {
  const activePage = formDef.pages.find((p) => p.id === activePageId) ?? formDef.pages[0]!;
  const activeIndex = getPageIndex(formDef, activePage.id);

  const updateActivePage = (updater: (prev: FormPageDef) => FormPageDef) => {
    onFormDefChange((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === activePageId ? updater(p) : p)),
    }));
  };

  const addPage = () => {
    const id = newPageId();
    const page: FormPageDef = {
      id,
      title: `Page ${formDef.pages.length + 1}`,
      description: "",
      components: [],
    };
    onFormDefChange((prev) => ({ ...prev, pages: [...prev.pages, page] }));
    onActivePageChange(id);
    onClearSelection();
  };

  const deletePage = (pageId: string) => {
    if (formDef.pages.length <= 1) return;
    const remaining = formDef.pages.filter((p) => p.id !== pageId);
    onFormDefChange((prev) => ({ ...prev, pages: remaining }));
    if (activePageId === pageId) {
      onActivePageChange(remaining[0]?.id ?? "");
    }
    onClearSelection();
  };

  const movePage = (dir: -1 | 1) => {
    const idx = getPageIndex(formDef, activePage.id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= formDef.pages.length) return;
    onFormDefChange((prev) => {
      const pages = [...prev.pages];
      const [item] = pages.splice(idx, 1);
      pages.splice(target, 0, item!);
      return { ...prev, pages };
    });
  };

  const duplicateActivePage = () => {
    const copy = duplicatePage(activePage);
    onFormDefChange((prev) => ({ ...prev, pages: [...prev.pages, copy] }));
    onActivePageChange(copy.id);
    onClearSelection();
  };

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        <label htmlFor="fb-page-picker" className="sr-only">
          Active page
        </label>
        <select
          id="fb-page-picker"
          value={activePageId}
          aria-label="Select page"
          onChange={(e) => {
            onActivePageChange(e.target.value);
            onClearSelection();
          }}
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white py-1 pl-2 pr-7 text-xs font-medium text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {formDef.pages.map((page, index) => (
            <option key={page.id} value={page.id}>
              {index + 1}. {page.title.trim() || `Page ${index + 1}`} ({page.components.length})
            </option>
          ))}
        </select>
        <span className="shrink-0 text-[10px] tabular-nums text-slate-400">
          {activeIndex + 1}/{formDef.pages.length}
        </span>
        <div className="ml-auto flex gap-0.5">
          <button
            type="button"
            title="Move page up"
            aria-label="Move page up"
            disabled={activeIndex === 0}
            onClick={() => movePage(-1)}
            className={iconBtn}
          >
            ↑
          </button>
          <button
            type="button"
            title="Move page down"
            aria-label="Move page down"
            disabled={activeIndex === formDef.pages.length - 1}
            onClick={() => movePage(1)}
            className={iconBtn}
          >
            ↓
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        <label htmlFor="fb-page-title" className="sr-only">
          Page name
        </label>
        <input
          id="fb-page-title"
          type="text"
          value={activePage.title}
          onChange={(e) => updateActivePage((prev) => ({ ...prev, title: e.target.value }))}
          className={inputClass}
          placeholder={`Page ${activeIndex + 1}`}
          aria-label="Page name"
        />
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={addPage}
          className="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700"
        >
          + Page
        </button>
        <button
          type="button"
          onClick={duplicateActivePage}
          className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          title="Duplicate current page"
        >
          Copy
        </button>
        <button
          type="button"
          disabled={formDef.pages.length <= 1}
          onClick={() => deletePage(activePage.id)}
          className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
          title="Delete page"
        >
          Delete
        </button>
      </div>

      <details className="mt-1.5 border-t border-slate-100 pt-1.5">
        <summary className="cursor-pointer select-none text-[11px] font-medium text-slate-500 hover:text-slate-700">
          Page notes <span className="font-normal text-slate-400">(optional, builder only)</span>
        </summary>
        <label htmlFor="fb-page-notes" className="sr-only">
          Internal page notes
        </label>
        <textarea
          id="fb-page-notes"
          value={activePage.description ?? ""}
          onChange={(e) =>
            updateActivePage((prev) => ({
              ...prev,
              description: e.target.value || undefined,
            }))
          }
          rows={2}
          className="mt-1.5 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          placeholder="Not shown to respondents"
        />
      </details>
    </div>
  );
}

const DRAG_TYPE = "application/x-pagedef-component-type";

const iconClass = "size-9 text-indigo-600/90 stroke-[1.5]";

/** Icons for each palette item (by palette id). */
const PALETTE_ICONS: Record<string, React.ReactNode> = {
  TextField: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  ),
  Number: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17h4l2-8 2 8h4M7 10h10" />
    </svg>
  ),
  TextArea: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 10h16M4 14h10M4 18h8" />
    </svg>
  ),
  Select: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
      <path d="M4 4h16v4H4z" />
    </svg>
  ),
  Choice: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  Checkbox: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" strokeWidth="1.5" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  DateAndTime: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Rating: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  ),
  Scale: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18h16M6 14h12M8 10h8M10 6h4" />
    </svg>
  ),
  Section: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 10h10M4 14h14M4 18h8" />
    </svg>
  ),
  FileUpload: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  ),
  Signature: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17c3-6 8-10 14-12 2 4 1 9-3 12-4 3-9 3-11 0z" />
      <path d="M14 5c2 2 3 5 2 8" />
    </svg>
  ),
};

interface ComponentPaletteProps {
  onDragStart?: (type: string) => void;
  builderVersion?: "v1" | "v2";
}

function ComponentPalette({ onDragStart, builderVersion = "v1" }: ComponentPaletteProps) {
  const paletteSpecs = getPaletteSpecs(builderVersion);
  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <header className="shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-semibold text-slate-800">Components</h2>
        <p className="text-xs text-slate-500 mt-0.5">Drag fields onto the canvas, then configure them in the panel on the right.</p>
      </header>
      <div className="flex-1 overflow-auto p-4 space-y-2.5 min-h-0">
        {paletteSpecs.map((spec) => (
          <div
            key={spec.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_TYPE, spec.id);
              e.dataTransfer.effectAllowed = "copy";
              onDragStart?.(spec.id);
            }}
            className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl border border-slate-100 bg-white text-slate-700 cursor-grab active:cursor-grabbing shadow-sm transition-shadow hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50/60"
          >
            <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600/90 ring-1 ring-indigo-100/80 group-hover:bg-indigo-100 group-hover:ring-indigo-200/60 transition-colors">
              {PALETTE_ICONS[spec.id] ?? (
                <span className="text-base font-semibold text-indigo-500">{spec.label.slice(0, 1)}</span>
              )}
            </span>
            <div className="min-w-0 flex-1 py-0.5">
              <div className="text-sm font-medium text-slate-800">{spec.label}</div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


type BuilderSidebarProps = {
  formDef: FormDef;
  activePageId: string;
  onActivePageChange: (pageId: string) => void;
  onFormDefChange: (updater: (prev: FormDef) => FormDef) => void;
  onClearSelection: () => void;
  builderVersion?: "v1" | "v2";
};

export default function BuilderSidebar({
  formDef,
  activePageId,
  onActivePageChange,
  onFormDefChange,
  onClearSelection,
  builderVersion = "v1",
}: BuilderSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="max-h-[36%] min-h-0 shrink-0 overflow-auto border-b border-slate-200">
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white px-3 py-2">
          <h2 className="text-xs font-semibold text-slate-800">Pages</h2>
        </header>
        <div className="p-2">
          <PageOperationsPanel
            formDef={formDef}
            activePageId={activePageId}
            onActivePageChange={onActivePageChange}
            onFormDefChange={onFormDefChange}
            onClearSelection={onClearSelection}
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ComponentPalette builderVersion={builderVersion} />
      </div>
    </div>
  );
}

export { DRAG_TYPE };

/** Short random hex (4 chars) for autogenerated ids, e.g. "0da1". */
function shortId(): string {
  return Math.random().toString(16).slice(2, 6);
}

/** Autogenerated id: type lowercase + short hex, e.g. "number0da1", "texta3f2". */
function generateComponentId(type: PageComponentType): string {
  return `${type.toLowerCase()}${shortId()}`;
}

/** Resolve palette id (e.g. "TextField") to concrete PageComponentType (e.g. "text"). */
function resolveToConcreteType(paletteIdOrType: string, builderVersion: "v1" | "v2" = "v1"): PageComponentType | null {
  const palette = getPaletteSpecs(builderVersion).find((p) => p.id === paletteIdOrType);
  if (palette) return palette.defaultType as PageComponentType;
  if (COMPONENT_SPECS.some((s) => s.type === paletteIdOrType)) return paletteIdOrType as PageComponentType;
  return null;
}

/** Return default PageComponentDef for a palette id (e.g. "TextField") or concrete type (e.g. "text"). */
export function getDefaultComponentDef(
  paletteIdOrType: string,
  builderVersion: "v1" | "v2" = "v1",
): PageComponentDef | null {
  const type = resolveToConcreteType(paletteIdOrType, builderVersion);
  if (!type) return null;
  const spec = COMPONENT_SPECS.find((s) => s.type === type);
  const example = spec ? (spec.exampleJson as Record<string, unknown>) : {};
  return {
    ...example,
    id: generateComponentId(type),
    type,
    label: spec?.defaultLabel ?? (example.label as string) ?? type,
  } as PageComponentDef;
}
