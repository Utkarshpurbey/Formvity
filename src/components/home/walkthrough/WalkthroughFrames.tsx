import { memo } from "react";
import {
  ANALYTICS_METRICS,
  ANALYTICS_TABS,
  TIMELINE_BARS,
  WALKTHROUGH_CATEGORIES,
  WALKTHROUGH_FORM_FIELDS,
  WALKTHROUGH_PALETTE,
  WALKTHROUGH_TEMPLATES,
} from "./walkthroughData";

type FrameProps = { compact?: boolean };

export const TemplatesFrame = memo(function TemplatesFrame({ compact }: FrameProps) {
  const templates = compact ? WALKTHROUGH_TEMPLATES.slice(0, 2) : WALKTHROUGH_TEMPLATES;

  return (
    <div className={`wt-scene-enter bg-slate-50 ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-violet-50/60 p-3 ring-1 ring-slate-900/[0.03] sm:p-4">
        <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600 sm:text-[10px]">Template library</p>
        <p className="mt-0.5 text-xs font-bold text-slate-900 sm:text-sm">Start with a modern template</p>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-hidden">
        {WALKTHROUGH_CATEGORIES.slice(0, compact ? 3 : 5).map((cat, i) => (
          <span
            key={cat}
            className={`wt-stagger shrink-0 rounded-lg px-2 py-1 text-[9px] font-semibold sm:text-[10px] ${
              i === 0
                ? "bg-violet-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2"}`}>
        {templates.map((t, i) => (
          <article
            key={t.title}
            className={`wt-stagger overflow-hidden rounded-xl border bg-white shadow-sm ${
              t.selected
                ? "wt-highlight border-violet-300 ring-2 ring-violet-200"
                : "border-slate-200/80"
            }`}
            style={{ animationDelay: `${120 + i * 80}ms` }}
          >
            <div className="relative h-14 bg-gradient-to-br from-slate-100 to-violet-50 sm:h-16">
              <span
                className={`absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ring-1 ring-inset sm:text-[9px] ${t.categoryStyle}`}
              >
                {t.badge}
              </span>
            </div>
            <div className="p-2 sm:p-2.5">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                {t.category}
              </p>
              <p className="text-[10px] font-semibold text-slate-900 sm:text-[11px]">{t.title}</p>
              <p className="mt-0.5 text-[8px] text-slate-500 sm:text-[9px]">{t.fields} fields</p>
            </div>
          </article>
        ))}
      </div>

      <div className="wt-slide-up mt-3 flex justify-end" style={{ animationDelay: "0.6s" }}>
        <span className="rounded-lg bg-violet-600 px-2.5 py-1 text-[9px] font-semibold text-white sm:text-[10px]">
          Edit in builder →
        </span>
      </div>
    </div>
  );
});

export const BuilderFrame = memo(function BuilderFrame({ compact }: FrameProps) {
  return (
    <div
      className={`wt-scene-enter grid bg-gradient-to-br from-slate-100 via-white to-violet-50/80 ${
        compact ? "grid-cols-[72px_1fr]" : "grid-cols-[88px_1fr_72px] sm:grid-cols-[100px_1fr_88px]"
      }`}
    >
      {/* Left — Components palette (matches BuilderSidebar) */}
      <aside className="border-r border-slate-200/80 bg-white p-2">
        <p className="text-[8px] font-semibold text-slate-800 sm:text-[9px]">Components</p>
        <p className="mt-0.5 text-[7px] leading-tight text-slate-500 sm:text-[8px]">Drag onto canvas</p>
        <div className="mt-2 space-y-1">
          {WALKTHROUGH_PALETTE.slice(0, compact ? 3 : 4).map((item, i) => (
            <div
              key={item.label}
              className="wt-stagger rounded-lg border border-slate-100 bg-white px-1.5 py-1.5 shadow-sm"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-[8px] font-medium text-slate-800 sm:text-[9px]">{item.label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Center — Top bar + canvas (matches BuilderTopBar + PageCanvas) */}
      <div className="min-w-0 p-2">
        <header className="mb-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2 py-1.5 shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-semibold text-slate-900 sm:text-[10px]">Event Registration</p>
            <p className="text-[7px] text-slate-500 sm:text-[8px]">Saved</p>
          </div>
          <nav className="flex rounded-lg bg-slate-100 p-0.5" aria-hidden>
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[7px] font-semibold text-slate-600 sm:text-[8px]">
              Intake
            </span>
            <span className="rounded-md px-1.5 py-0.5 text-[7px] font-semibold text-violet-700 shadow-sm sm:text-[8px]">
              Form pages
            </span>
          </nav>
          {!compact && (
            <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[7px] font-semibold text-white sm:text-[8px]">
              Publish
            </span>
          )}
        </header>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 rounded-t-xl bg-violet-600" />
          <div className="p-2.5 sm:p-3">
            <p className="text-[10px] font-bold text-slate-900 sm:text-xs">Event Registration</p>
            <p className="mt-0.5 text-[8px] text-slate-500 sm:text-[9px]">Register for our upcoming event</p>
            <div className="mt-3 space-y-2">
              {WALKTHROUGH_FORM_FIELDS.map((field, i) => (
                <div
                  key={field.label}
                  className="wt-field-appear"
                  style={{ animationDelay: `${300 + i * 350}ms` }}
                >
                  <p className="text-[8px] font-medium text-slate-700 sm:text-[9px]">
                    {field.label}
                    {field.required ? <span className="text-rose-500"> *</span> : null}
                  </p>
                  <div className="mt-0.5 h-6 rounded-lg border border-slate-200 bg-slate-50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Config panel (matches ComponentConfigPanel) */}
      {!compact && (
        <aside className="border-l border-slate-200/80 bg-white p-2">
          <p className="text-[8px] font-semibold text-slate-800 sm:text-[9px]">Field config</p>
          <div className="wt-slide-up mt-2 space-y-2" style={{ animationDelay: "0.8s" }}>
            <div>
              <p className="text-[7px] text-slate-500 sm:text-[8px]">Label</p>
              <div className="mt-0.5 h-5 rounded border border-slate-200 bg-slate-50 px-1 text-[8px] leading-5 text-slate-700">
                Full name
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-3 rounded bg-violet-600" />
              <span className="text-[7px] text-slate-600 sm:text-[8px]">Required</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
});

export const PublishFrame = memo(function PublishFrame({ compact }: FrameProps) {
  return (
    <div className={`wt-scene-enter relative bg-slate-100/80 ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className="absolute inset-0 bg-slate-900/20" aria-hidden />
      <div className="relative mx-auto max-w-xs rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:p-4">
        <p className="text-[10px] font-bold text-slate-900 sm:text-xs">Publish form</p>
        <p className="mt-0.5 text-[8px] text-slate-500 sm:text-[9px]">Event Registration · 9 fields · 2 pages</p>

        <div className="mt-3">
          <label className="text-[8px] font-medium text-slate-600 sm:text-[9px]">Public URL slug</label>
          <div className="wt-slide-up mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
            <span className="text-[8px] text-slate-400 sm:text-[9px]">formvity.in/r/</span>
            <span className="text-[8px] font-semibold text-slate-900 sm:text-[9px]">event-registration</span>
          </div>
        </div>

        <div className="wt-fade-in mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[8px] font-semibold text-emerald-700 sm:text-[9px]">Live</span>
          </div>
          <p className="mt-1 truncate text-[8px] text-emerald-800 sm:text-[9px]">formvity.in/r/event-registration</p>
          <span className="wt-slide-up mt-1.5 inline-block rounded-md bg-white px-2 py-0.5 text-[8px] font-semibold text-slate-700 ring-1 ring-slate-200">
            Copy link ✓
          </span>
        </div>

        {!compact && (
          <p className="wt-slide-up mt-3 text-center text-[8px] text-slate-500" style={{ animationDelay: "0.7s" }}>
            Share via email, chat, or embed — no respondent account needed
          </p>
        )}
      </div>
    </div>
  );
});

export const AnalyticsFrame = memo(function AnalyticsFrame({ compact }: FrameProps) {
  return (
    <div className={`wt-scene-enter bg-slate-50 ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600 sm:text-[10px]">Analytics</p>
          <p className="text-xs font-bold text-slate-900 sm:text-sm">Event Registration</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15 sm:text-[9px]">
          <span className="size-1 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <nav className="mt-3 flex gap-0.5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 p-0.5" aria-hidden>
        {ANALYTICS_TABS.map((tab, i) => (
          <span
            key={tab}
            className={`shrink-0 rounded-md px-1.5 py-1 text-[7px] font-semibold sm:text-[8px] ${
              i === 1
                ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-600"
            }`}
          >
            {compact && tab.length > 10 ? tab.split(" ")[0] : tab}
          </span>
        ))}
      </nav>

      <div className={`mt-3 grid gap-1.5 ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
        {ANALYTICS_METRICS.slice(0, compact ? 3 : 4).map((m, i) => (
          <div
            key={m.label}
            className="wt-stagger rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <p className="text-[7px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[8px]">{m.label}</p>
            <p className="text-sm font-bold tabular-nums text-slate-900 sm:text-base">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[9px]">
          Response timeline
        </p>
        <div className="mt-2 flex h-12 items-end gap-0.5 sm:h-14">
          {TIMELINE_BARS.map((h, i) => (
            <div
              key={i}
              className="wt-bar-grow flex-1 rounded-t bg-gradient-to-t from-violet-600 to-violet-400"
              style={{ height: `${h * 2.5}px`, animationDelay: `${150 + i * 40}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
