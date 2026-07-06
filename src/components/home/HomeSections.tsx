import Link from "next/link";
import type { ReactNode } from "react";
import { TEMPLATE_CATALOG } from "../../lib/templates";
import { trackEvent } from "../../lib/googleAnalytics";
import { BreakdownChart } from "../form/analytics/BreakdownChart";
import { ChartViewToggle, type ChartViewMode } from "../form/analytics/ChartViewToggle";
import { ProductMockup } from "./ProductMockup";
import { LazyWalkthroughFull } from "./walkthrough/LazyWalkthrough";
import {
  ANALYTICS_BULLETS,
  FAQ_ITEMS,
  FEATURES,
  HOME_STATS,
  INDUSTRIES,
  USE_CASES,
  VALUE_PROPS,
  WORKFLOW_STEPS,
} from "./homeData";
import "./home.css";

const MOCK_BREAKDOWN = [
  { key: "hotmail", label: "hotmail.com", count: 20, percent: 20 },
  { key: "gmail", label: "gmail.com", count: 15, percent: 15 },
  { key: "tablet", label: "tablet", count: 41, percent: 41 },
];

function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
      {children}
    </span>
  );
}

function SectionHeader({
  badge,
  title,
  description,
  align = "center",
}: {
  badge: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <SectionBadge>{badge}</SectionBadge>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
    </div>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const cls = "size-5";
  const icons: Record<string, ReactNode> = {
    layout: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
    ),
    spark: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09Z" />
    ),
    link: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    ),
    chart: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    ),
    grid: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    ),
    user: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    ),
    build: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
    ),
    publish: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    ),
    analyze: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    ),
  };

  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
      {icons[name] ?? icons.layout}
    </svg>
  );
}

type CtaPair = { primary: { label: string; href: string }; secondary: { label: string; href: string } };

export function HomeHero({ cta }: { cta: CtaPair }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-40 top-0 size-[28rem] rounded-full bg-violet-600/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-1/4 size-[32rem] rounded-full bg-cyan-500/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 home-shimmer-border" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:pb-28 sm:pt-16 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-violet-200 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Form builder with analytics built in
            </div>

            <h1 className="mt-8 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Build forms.
              <br />
              <span className="home-gradient-text">Understand every response.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl">
              Formvity is the modern form platform for teams who need more than a survey link — visual building,{" "}
              {TEMPLATE_CATALOG.length} templates, and built-in analytics in one place.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={cta.primary.href}
                onClick={() =>
                  trackEvent("cta_click", {
                    cta_location: "hero",
                    cta_label: cta.primary.label,
                    cta_href: cta.primary.href,
                  })
                }
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-slate-950 shadow-xl shadow-violet-500/20 transition hover:bg-slate-100"
              >
                {cta.primary.label}
              </Link>
              <Link
                href={cta.secondary.href}
                onClick={() =>
                  trackEvent("cta_click", {
                    cta_location: "hero",
                    cta_label: cta.secondary.label,
                    cta_href: cta.secondary.href,
                  })
                }
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                {cta.secondary.label}
              </Link>
              <a
                href="#product-tour"
                className="inline-flex h-12 items-center justify-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
              >
                <span className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5">
                  <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </span>
                Watch product tour
              </a>
            </div>

            <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
              {HOME_STATS.map((stat, i) => (
                <div key={stat.label} className={`bg-slate-950/60 px-4 py-4 backdrop-blur-sm ${i > 0 ? "border-l border-white/10" : ""}`}>
                  <dt className="text-xl font-bold tabular-nums text-white sm:text-2xl">{stat.value}</dt>
                  <dd className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="home-mockup-float lg:pl-6">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeLogoStrip() {
  return (
    <section className="border-b border-slate-200/80 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Trusted by teams across industries
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {INDUSTRIES.map((label) => (
            <span
              key={label}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeValueProps() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm transition hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/25">
                <FeatureIcon name={item.icon} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeFeatures() {
  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          badge="Platform"
          title="Everything you need to ship forms"
          description="From first draft to published link to response insights — without switching tools."
        />

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.02] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 ${feature.span}`}
            >
              <div
                className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
              >
                <FeatureIcon name={feature.icon} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeWorkflow() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((item, i) => (
            <div key={item.step} className="relative">
              {i < WORKFLOW_STEPS.length - 1 ? (
                <div
                  className="absolute left-[calc(100%-0.5rem)] top-8 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-violet-300 to-transparent lg:block"
                  aria-hidden
                />
              ) : null}
              <p className="text-4xl font-black tabular-nums text-violet-100">{item.step}</p>
              <h3 className="mt-2 font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeWalkthrough() {
  return (
    <section
      id="product-tour"
      className="scroll-mt-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 sm:py-28"
      aria-label="Product tour"
    >
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          badge="Product tour"
          title="From template to insights in minutes"
          description="Watch how Formvity takes you from picking a template to collecting and analyzing responses."
        />
        <div className="mt-16 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/[0.03] sm:p-8 [content-visibility:auto] [contain-intrinsic-size:600px]">
          <LazyWalkthroughFull variant="full" />
        </div>
      </div>
    </section>
  );
}

export function HomeAnalytics({
  demoChartView,
  onChartViewChange,
}: {
  demoChartView: ChartViewMode;
  onChartViewChange: (v: ChartViewMode) => void;
}) {
  return (
    <section className="bg-slate-950 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              Analytics
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Insights that go beyond response counts
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Every form gets a full analytics dashboard — overview metrics, audience breakdowns, per-question
              distributions, and searchable individual responses.
            </p>
            <ul className="mt-8 space-y-4">
              {ANALYTICS_BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
              {["Overview", "Audience & traffic", "Questions", "Responses"].map((tab, i) => (
                <span
                  key={tab}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    i === 1 ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 ring-1 ring-white/10"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Unique respondents", value: "101" },
                { label: "With metadata", value: "101" },
                { label: "Avg completion", value: "100%" },
                { label: "Peak hour", value: "12 PM" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{m.label}</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-white">{m.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sample breakdown</p>
              <ChartViewToggle value={demoChartView} onChange={onChartViewChange} />
            </div>
            <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
              <BreakdownChart items={MOCK_BREAKDOWN} viewMode={demoChartView} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeUseCases() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          badge="Use cases"
          title={`${TEMPLATE_CATALOG.length} templates, endless workflows`}
          description="Start from a curated template or build your own — every workflow is one click from the builder."
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((item) => (
            <li
              key={item.team}
              className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:bg-white hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-xl shadow-lg`}
              >
                {item.emoji}
              </div>
              <h3 className="mt-4 font-bold text-slate-900">{item.team}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.forms}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <Link
            href="/templates"
            className="inline-flex h-12 items-center rounded-xl bg-violet-600 px-8 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-700"
          >
            Explore template library →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeFaq() {
  return (
    <section className="border-t border-slate-200/80 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeader
          badge="FAQ"
          title="Common questions"
          description="Everything you need to know before you start building."
        />
        <dl className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm open:shadow-md"
            >
              <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-slate-400 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function HomeCta({
  user,
  primaryCta,
}: {
  user: boolean;
  primaryCta: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(139,92,246,0.35),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-violet-600/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {user ? "Ready to build your next form?" : "Start building better forms today"}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
          {user
            ? "Jump into your workspace, pick a template, or open the builder."
            : "Free to start. No credit card. Publish and collect responses in minutes."}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={primaryCta.href}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-slate-950 shadow-xl transition hover:bg-slate-100"
          >
            {primaryCta.label}
          </Link>
          <Link
            href={user ? "/builder" : "/login"}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            {user ? "Open builder" : "Sign in"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
                <FeatureIcon name="layout" />
              </div>
              <span className="text-lg font-bold text-slate-900">Formvity</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              The modern form platform with visual building, templates, and built-in analytics — so your team ships
              faster and understands every response.
            </p>
          </div>
          <nav className="flex flex-col gap-3 text-sm" aria-label="Product">
            <p className="font-bold text-slate-900">Product</p>
            <Link href="/templates" className="text-slate-600 transition hover:text-violet-700">
              Templates
            </Link>
            <Link href="/register" className="text-slate-600 transition hover:text-violet-700">
              Create account
            </Link>
            <Link href="/login" className="text-slate-600 transition hover:text-violet-700">
              Sign in
            </Link>
            <a href="#product-tour" className="text-slate-600 transition hover:text-violet-700">
              Product tour
            </a>
          </nav>
          <nav className="flex flex-col gap-3 text-sm" aria-label="Legal">
            <p className="font-bold text-slate-900">Legal</p>
            <Link href="/privacy" className="text-slate-600 transition hover:text-violet-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-600 transition hover:text-violet-700">
              Terms of Service
            </Link>
            <Link href="/license" className="text-slate-600 transition hover:text-violet-700">
              License
            </Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Formvity. All rights reserved.</p>
          <p className="text-sm text-slate-400">Built for teams who care about every response.</p>
        </div>
      </div>
    </footer>
  );
}
