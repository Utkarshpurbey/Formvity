"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PAGE_DEF_TEMPLATES } from "../../../src/lib/page-def-templates";
import { MultiPageForm } from "../../../src/components/page-def/runtime/MultiPageForm";
import { cloneTemplatePageDef, toBuilderFormDef } from "../../../src/lib/template-to-builder-page-def";

type TemplateEntry = [string, (typeof PAGE_DEF_TEMPLATES)[string]];

interface PreviewTheme {
  start: string;
  end: string;
  badge: string;
  fieldRows: [number, number, number];
  cta: string;
}

const PREVIEW_THEMES: Record<string, PreviewTheme> = {
  "job-application": { start: "#4f46e5", end: "#2563eb", badge: "Hiring", fieldRows: [470, 420, 370], cta: "Apply" },
  "customer-support-request": { start: "#0f766e", end: "#0ea5e9", badge: "Support", fieldRows: [470, 440, 390], cta: "Submit Ticket" },
  "event-registration": { start: "#7c3aed", end: "#ec4899", badge: "Events", fieldRows: [460, 420, 400], cta: "Register" },
  "patient-intake": { start: "#0f766e", end: "#16a34a", badge: "Healthcare", fieldRows: [450, 430, 380], cta: "Save Intake" },
  "lead-capture": { start: "#b45309", end: "#f59e0b", badge: "Sales", fieldRows: [465, 430, 385], cta: "Capture Lead" },
};

const escapeSvgText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const truncatePreviewTitle = (value: string, max = 48) =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;

const PREVIEW_SVG_W = 600;
const PREVIEW_SVG_H = 220;

const getTemplatePreviewImage = (templateKey: string, title: string) => {
  const theme = PREVIEW_THEMES[templateKey] ?? PREVIEW_THEMES["job-application"];
  const safeTitle = escapeSvgText(truncatePreviewTitle(title));
  const safeBadge = escapeSvgText(theme.badge);
  const safeCta = escapeSvgText(theme.cta);

  const cardX = 44;
  const cardY = 44;
  const cardW = 512;
  const cardH = 156;
  const pad = 24;
  const innerLeft = cardX + pad;
  const innerTop = cardY + 16;
  const innerW = cardW - pad * 2;
  const titleBarW = Math.min(280, innerW);
  const row1 = Math.min(theme.fieldRows[0], innerW);
  const row2 = Math.min(theme.fieldRows[1], innerW);
  const row3 = Math.min(theme.fieldRows[2], innerW);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${PREVIEW_SVG_W}" height="${PREVIEW_SVG_H}" viewBox="0 0 ${PREVIEW_SVG_W} ${PREVIEW_SVG_H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.start}" />
      <stop offset="100%" stop-color="${theme.end}" />
    </linearGradient>
  </defs>
  <rect width="${PREVIEW_SVG_W}" height="${PREVIEW_SVG_H}" fill="url(#bg)" rx="18" />
  <rect x="24" y="12" width="86" height="20" rx="10" fill="rgba(255,255,255,0.22)" />
  <text x="36" y="26" font-size="11" font-weight="600" font-family="system-ui, Arial, sans-serif" fill="#ffffff">${safeBadge}</text>
  <text x="120" y="26" font-size="14" font-weight="600" font-family="system-ui, Arial, sans-serif" fill="#ffffff">${safeTitle}</text>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="14" fill="rgba(255,255,255,0.96)" />
  <rect x="${innerLeft}" y="${innerTop}" width="${titleBarW}" height="12" rx="6" fill="#cbd5e1" />
  <rect x="${innerLeft}" y="${innerTop + 20}" width="${row1}" height="9" rx="4" fill="#e2e8f0" />
  <rect x="${innerLeft}" y="${innerTop + 36}" width="${row2}" height="9" rx="4" fill="#e2e8f0" />
  <rect x="${innerLeft}" y="${innerTop + 52}" width="${row3}" height="9" rx="4" fill="#e2e8f0" />
  <rect x="${innerLeft}" y="${innerTop + 72}" width="152" height="24" rx="8" fill="${theme.start}" />
  <text x="${innerLeft + 12}" y="${innerTop + 88}" font-size="11" font-weight="600" font-family="system-ui, Arial, sans-serif" fill="#ffffff">${safeCta}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function TemplatesRoutePage() {
  const router = useRouter();
  const templateEntries = useMemo(() => Object.entries(PAGE_DEF_TEMPLATES) as TemplateEntry[], []);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  const previewTemplate = useMemo(() => {
    if (!previewKey) return null;
    return PAGE_DEF_TEMPLATES[previewKey] ?? null;
  }, [previewKey]);

  const previewBuilderFormDef = useMemo(
    () => (previewKey ? toBuilderFormDef(cloneTemplatePageDef(PAGE_DEF_TEMPLATES[previewKey])) : null),
    [previewKey],
  );

  const closePreview = useCallback(() => setPreviewKey(null), []);

  const handleEditInBuilder = (templateKey: string) => {
    setPreviewKey(null);
    router.push(`/builder/v2?template=${encodeURIComponent(templateKey)}`);
  };

  useEffect(() => {
    if (!previewKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewKey, closePreview]);

  return (
    <div className="bg-slate-50 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Preview shows the real form UI. Use <strong className="text-slate-800">Edit in visual builder</strong> only when you want
          to edit the template.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templateEntries.map(([key, template]) => {
          const previewImage = getTemplatePreviewImage(key, template.title);
          return (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <button
                type="button"
                onClick={() => setPreviewKey(key)}
                className="w-full text-left rounded-lg border border-slate-100 bg-slate-50 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <img
                  src={previewImage}
                  alt={`${template.title} preview`}
                  width={PREVIEW_SVG_W}
                  height={PREVIEW_SVG_H}
                  className="w-full h-auto block max-w-full pointer-events-none"
                  decoding="async"
                />
              </button>
              <div className="flex items-start justify-between gap-2">
                <h2 className="mt-3 text-base font-semibold text-slate-800">{template.title}</h2>
                <span className="mt-3 text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {key}
                </span>
              </div>
              {template.description && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{template.description}</p>
              )}
              <p className="text-xs text-slate-500 mt-3">Components: {template.components.length}</p>
              <button
                type="button"
                onClick={() => setPreviewKey(key)}
                className="mt-4 w-full px-3 py-2 rounded-lg text-sm font-medium bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                Preview template
              </button>
            </div>
          );
        })}
      </div>

      {previewKey && previewTemplate && previewBuilderFormDef && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="presentation"
          onClick={closePreview}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-preview-title"
            className="relative flex w-full max-w-3xl max-h-[90vh] flex-col rounded-2xl border border-slate-200 bg-slate-100 shadow-xl shadow-slate-900/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
              <div className="min-w-0 pr-4">
                <h2 id="template-preview-title" className="text-lg font-semibold text-slate-900">
                  Template preview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  <span className="font-mono">{previewKey}</span>
                  <span className="mx-1.5">·</span>
                  {previewTemplate.components.length} fields
                </p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Close preview"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <MultiPageForm formDef={previewBuilderFormDef} />
            </div>

            <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={closePreview}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => previewKey && handleEditInBuilder(previewKey)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Edit in Formvity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
