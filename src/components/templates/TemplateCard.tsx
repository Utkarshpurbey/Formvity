import type { TemplateCatalogEntry } from "../../lib/templates";
import { getTemplatePreviewImage, TEMPLATE_PREVIEW_DIMENSIONS } from "../../lib/templates/preview-image";
import { getTemplateFieldStats } from "../../lib/templates/template-utils";

type TemplateCardProps = {
  entry: TemplateCatalogEntry;
  onPreview: (key: string) => void;
};

const CATEGORY_STYLES: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 ring-slate-200",
  hr: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  sales: "bg-amber-50 text-amber-800 ring-amber-100",
  events: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
  support: "bg-teal-50 text-teal-700 ring-teal-100",
  operations: "bg-cyan-50 text-cyan-800 ring-cyan-100",
  healthcare: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  product: "bg-pink-50 text-pink-700 ring-pink-100",
  education: "bg-sky-50 text-sky-700 ring-sky-100",
  hospitality: "bg-orange-50 text-orange-700 ring-orange-100",
};

export function TemplateCard({ entry, onPreview }: TemplateCardProps) {
  const previewImage = getTemplatePreviewImage(entry.pageDef.title, entry.preview);
  const categoryStyle = CATEGORY_STYLES[entry.category] ?? "bg-slate-100 text-slate-600 ring-slate-200";
  const stats = getTemplateFieldStats(entry.pageDef.components);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <button
        type="button"
        onClick={() => onPreview(entry.key)}
        className="relative w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
      >
        <img
          src={previewImage}
          alt={`${entry.pageDef.title} preview`}
          width={TEMPLATE_PREVIEW_DIMENSIONS.width}
          height={TEMPLATE_PREVIEW_DIMENSIONS.height}
          className="block h-auto w-full max-w-full transition-transform duration-300 group-hover:scale-[1.02]"
          decoding="async"
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${categoryStyle}`}
        >
          {entry.preview.badge}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {entry.categoryLabel}
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">{entry.pageDef.title}</h2>
          </div>
          <div className="shrink-0 text-right">
            <span className="block rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-600">
              {stats.total} fields
            </span>
            <span className="mt-1 block text-[10px] text-slate-500">
              {stats.required} required
            </span>
          </div>
        </div>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {entry.longDescription}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Ideal for:</span>{" "}
          {entry.idealFor.join(" · ")}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <ul className="mt-3 space-y-1 text-xs text-slate-500">
          {entry.highlights.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap gap-1">
          {stats.byType.slice(0, 4).map((item) => (
            <span
              key={item.label}
              className="rounded bg-violet-50/80 px-1.5 py-0.5 text-[10px] font-medium text-violet-600"
            >
              {item.count}× {item.label}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-xs text-slate-500">~{entry.estimatedMinutes} min to complete</span>
          <button
            type="button"
            onClick={() => onPreview(entry.key)}
            className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100"
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}
