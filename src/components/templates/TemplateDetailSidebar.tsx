import type { ReactNode } from "react";
import type { TemplateCatalogEntry } from "../../lib/templates";
import {
  formatAppearanceSummary,
  getTemplateFieldStats,
} from "../../lib/templates/template-utils";

type TemplateDetailSidebarProps = {
  entry: TemplateCatalogEntry;
  className?: string;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

export function TemplateDetailSidebar({ entry, className = "" }: TemplateDetailSidebarProps) {
  const stats = getTemplateFieldStats(entry.pageDef.components);
  const appearanceLines = formatAppearanceSummary(entry.appearance);

  return (
    <aside className={`space-y-6 ${className}`}>
      <Section title="Overview">
        <p className="text-sm leading-relaxed text-slate-700">{entry.longDescription}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 px-2.5 py-2 text-center ring-1 ring-slate-200/80">
            <p className="text-lg font-bold tabular-nums text-slate-900">{stats.total}</p>
            <p className="text-[10px] font-medium text-slate-500">Fields</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2 text-center ring-1 ring-slate-200/80">
            <p className="text-lg font-bold tabular-nums text-emerald-700">{stats.required}</p>
            <p className="text-[10px] font-medium text-slate-500">Required</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2 text-center ring-1 ring-slate-200/80">
            <p className="text-lg font-bold tabular-nums text-slate-700">~{entry.estimatedMinutes}m</p>
            <p className="text-[10px] font-medium text-slate-500">Est. time</p>
          </div>
        </div>
      </Section>

      <Section title="Ideal for">
        <ul className="space-y-1.5 text-sm text-slate-700">
          {entry.idealFor.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-violet-500">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Use cases">
        <ul className="space-y-1.5 text-sm text-slate-700">
          {entry.useCases.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-violet-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Workflow">
        <ol className="space-y-2 text-sm text-slate-700">
          {entry.workflow.map((step, index) => (
            <li key={step} className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Included fields">
        <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1 text-sm">
          {stats.fields.map((field) => (
            <li
              key={field.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 ring-1 ring-slate-200/60"
            >
              <span className="min-w-0 truncate text-slate-800">{field.label}</span>
              <span className="shrink-0 text-[10px] font-medium text-slate-500">
                {field.typeLabel}
                {field.required ? " · req" : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {stats.byType.map((item) => (
            <span
              key={item.label}
              className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700"
            >
              {item.count}× {item.label}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Highlights">
        <ul className="space-y-1.5 text-sm text-slate-700">
          {entry.highlights.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-emerald-500">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Built-in capabilities">
        <ul className="space-y-1.5 text-sm text-slate-700">
          {entry.integrations.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-sky-500">◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Theme preset">
        <ul className="space-y-1 text-xs text-slate-600">
          {appearanceLines.map((line) => (
            <li key={line} className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-violet-400" />
              {line}
            </li>
          ))}
        </ul>
      </Section>
    </aside>
  );
}
