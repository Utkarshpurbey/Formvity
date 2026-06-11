"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateCard } from "../../../src/components/templates/TemplateCard";
import { TemplatePreviewModal } from "../../../src/components/templates/TemplatePreviewModal";
import { cloneTemplatePageDef, toBuilderFormDef } from "../../../src/lib/template-to-builder-page-def";
import {
  getTemplateCatalogEntry,
  getTemplatesByCategory,
  TEMPLATE_CATALOG,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ORDER,
  type TemplateCategory,
} from "../../../src/lib/templates";

type CategoryFilter = TemplateCategory | "all";

export default function TemplatesRoutePage() {
  const router = useRouter();
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filteredTemplates = useMemo(
    () => getTemplatesByCategory(category),
    [category],
  );

  const previewEntry = useMemo(
    () => (previewKey ? getTemplateCatalogEntry(previewKey) ?? null : null),
    [previewKey],
  );

  const previewBuilderFormDef = useMemo(
    () =>
      previewEntry
        ? toBuilderFormDef(cloneTemplatePageDef(previewEntry.pageDef))
        : null,
    [previewEntry],
  );

  const closePreview = useCallback(() => setPreviewKey(null), []);

  const handleEditInBuilder = (templateKey: string) => {
    setPreviewKey(null);
    router.push(`/builder/v2?template=${encodeURIComponent(templateKey)}`);
  };

  const categoriesWithCounts = useMemo(() => {
    const counts = TEMPLATE_CATEGORY_ORDER.map((cat) => ({
      id: cat as CategoryFilter,
      label: TEMPLATE_CATEGORY_LABELS[cat],
      count: TEMPLATE_CATALOG.filter((t) => t.category === cat).length,
    })).filter((c) => c.count > 0);
    return [{ id: "all" as const, label: "All templates", count: TEMPLATE_CATALOG.length }, ...counts];
  }, []);

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-violet-50/60 p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Template library</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Start with a modern template</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Professionally structured forms with themed styling, realistic fields, and ready-to-publish layouts.
          Preview the live UI, then open any template in the visual builder to customize it.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200">
            {TEMPLATE_CATALOG.length} templates
          </span>
          <span className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200">
            6–10 fields each
          </span>
          <span className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200">
            Use cases & workflows
          </span>
          <span className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200">
            Themed appearance presets
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categoriesWithCounts.map((item) => {
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {item.label}
              <span className={`ml-1.5 tabular-nums ${active ? "text-violet-200" : "text-slate-400"}`}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((entry) => (
          <TemplateCard key={entry.key} entry={entry} onPreview={setPreviewKey} />
        ))}
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No templates in this category yet.
        </div>
      ) : null}

      {previewEntry && previewBuilderFormDef ? (
        <TemplatePreviewModal
          entry={previewEntry}
          formDef={previewBuilderFormDef}
          onClose={closePreview}
          onEdit={handleEditInBuilder}
        />
      ) : null}
    </div>
  );
}
