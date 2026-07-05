"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "../../store/hooks";
import { TEMPLATE_CATALOG } from "../../lib/templates";
import { trackEvent } from "../../lib/googleAnalytics";
import { BreakdownChart } from "../form/analytics/BreakdownChart";
import { ChartViewToggle, type ChartViewMode } from "../form/analytics/ChartViewToggle";
import { ProductMockup } from "./ProductMockup";

const MOCK_BREAKDOWN = [
  { key: "hotmail", label: "hotmail.com", count: 20, percent: 20 },
  { key: "gmail", label: "gmail.com", count: 15, percent: 15 },
  { key: "tablet", label: "tablet", count: 41, percent: 41 },
];

const FEATURES = [
  {
    title: "Visual builder",
    description: "Drag-and-drop fields, multi-page flows, intake steps, and themed appearance — no code required.",
    icon: "layout",
    color: "from-violet-500 to-indigo-600",
  },
  {
    title: "Template library",
    description: `${TEMPLATE_CATALOG.length} production-ready templates for HR, sales, events, healthcare, and more.`,
    icon: "spark",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    title: "Publish & share",
    description: "One-click publish with public links. Respondents fill forms without creating an account.",
    icon: "link",
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Analytics & insights",
    description: "Response timelines, audience breakdowns, device traffic, question distributions, and individual responses.",
    icon: "chart",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Workspaces",
    description: "Organize forms by team or project. Manage drafts, publish status, and lifecycle from one dashboard.",
    icon: "grid",
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Respondent intake",
    description: "Capture name, email, and custom attributes before the form — with full control over fields and validation.",
    icon: "user",
    color: "from-rose-500 to-red-600",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Start from a template or blank",
    description: "Pick from 20 curated templates or open the visual builder to design from scratch.",
  },
  {
    step: "02",
    title: "Customize & publish",
    description: "Configure fields, intake, branding, and validation. Publish a shareable link when ready.",
  },
  {
    step: "03",
    title: "Collect & analyze",
    description: "Track responses in real time. Explore analytics, audience insights, and per-question breakdowns.",
  },
];

const USE_CASES = [
  { team: "HR & People", forms: "Job applications, onboarding, exit interviews" },
  { team: "Sales & Marketing", forms: "Lead capture, demo requests, newsletter signups" },
  { team: "Events", forms: "Registration, webinars, volunteer signup" },
  { team: "Support & IT", forms: "Support tickets, bug reports, helpdesk requests" },
  { team: "Healthcare", forms: "Patient intake, appointment requests" },
  { team: "Education", forms: "Course enrollment, scholarship applications" },
];

function FeatureIcon({ name }: { name: string }) {
  const cls = "size-5";
  switch (name) {
    case "layout":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
        </svg>
      );
    case "spark":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      );
    case "link":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      );
    case "grid":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      );
  }
}

export function HomePage() {
  const user = useAppSelector((s) => s.auth.user);
  const [demoChartView, setDemoChartView] = useState<ChartViewMode>("pie");

  const primaryCta = user
    ? { label: "Open workspaces", href: "/workspaces" }
    : { label: "Start free", href: "/register" };
  const secondaryCta = user
    ? { label: "Browse templates", href: "/templates" }
    : { label: "View templates", href: "/templates" };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-violet-600/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-32 top-1/3 size-96 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-violet-200 backdrop-blur-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Form builder with analytics built in
              </div>

              <h1 className="mt-8 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Formvity — build forms.
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-200 bg-clip-text text-transparent">
                  Understand every response.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                Formvity is a modern form platform for teams who need more than a survey link — visual building,
                {TEMPLATE_CATALOG.length} templates, publish workflows, and built-in analytics in one place.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={primaryCta.href}
                  onClick={() =>
                    trackEvent("cta_click", {
                      cta_location: "hero",
                      cta_label: primaryCta.label,
                      cta_href: primaryCta.href,
                    })
                  }
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-500/25 transition hover:bg-slate-100"
                >
                  {primaryCta.label}
                </Link>
                <Link
                  href={secondaryCta.href}
                  onClick={() =>
                    trackEvent("cta_click", {
                      cta_location: "hero",
                      cta_label: secondaryCta.label,
                      cta_href: secondaryCta.href,
                    })
                  }
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  {secondaryCta.label}
                </Link>
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  [`${TEMPLATE_CATALOG.length}+`, "Templates"],
                  ["6", "Analytics views"],
                  ["Multi-page", "Form flows"],
                  ["No code", "Required"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-bold tabular-nums text-white">{value}</dt>
                    <dd className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:pl-4">
              <ProductMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Logos / teams */}
      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Built for teams across
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Product", "HR", "Sales", "Support", "Healthcare", "Education", "Events", "Operations"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  {label}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Platform</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to ship forms
            </h2>
            <p className="mt-4 text-slate-600">
              From first draft to published link to response insights — without switching tools.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:border-violet-200 hover:shadow-md"
              >
                <div
                  className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                >
                  <FeatureIcon name={feature.icon} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Analytics highlight */}
      <section className="border-y border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Analytics</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Insights that go beyond response counts
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Every form gets a full analytics dashboard — overview metrics, audience & traffic breakdowns,
                per-question distributions, and searchable individual responses with metadata.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Response timeline with 7d / 30d / 90d windows",
                  "Bar & pie chart toggle on every breakdown",
                  "Question breakdowns with top answers",
                  "Completion rates and publication version tracking",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/40 p-6 shadow-sm">
              <div className="flex gap-2 border-b border-slate-200 pb-4">
                {["Overview", "Audience & traffic", "Questions", "Responses"].map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      i === 1 ? "bg-violet-600 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"
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
                  <div key={m.label} className="rounded-xl bg-white p-3 ring-1 ring-slate-200/80">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{m.label}</p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sample breakdown</p>
                <ChartViewToggle value={demoChartView} onChange={setDemoChartView} />
              </div>
              <div className="mt-3">
                <BreakdownChart items={MOCK_BREAKDOWN} viewMode={demoChartView} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Workflow</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From template to insights in three steps
            </h2>
          </div>
          <ol className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <span className="text-4xl font-black tabular-nums text-violet-100">{item.step}</span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {TEMPLATE_CATALOG.length} templates, endless use cases
            </h2>
            <p className="mt-4 text-slate-600">
              Start from a curated template or build your own — every workflow is one click from the builder.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((item) => (
              <li
                key={item.team}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 transition hover:border-violet-200 hover:bg-violet-50/30"
              >
                <p className="text-sm font-bold text-slate-900">{item.team}</p>
                <p className="mt-1 text-sm text-slate-600">{item.forms}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link
              href="/templates"
              className="inline-flex h-11 items-center rounded-xl border border-violet-200 bg-violet-50 px-6 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Explore template library →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(139,92,246,0.25),transparent)]" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {user ? "Ready to build your next form?" : "Start building better forms today"}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {user
              ? "Jump into your workspace, pick a template, or open the builder."
              : "Free to start. No credit card. Publish and collect responses in minutes."}
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-slate-100"
            >
              {primaryCta.label}
            </Link>
            <Link
              href={user ? "/builder" : "/login"}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-8 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {user ? "Open builder" : "Sign in"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Formvity</p>
              <p className="mt-1 text-sm text-slate-500">
                © {new Date().getFullYear()} Formvity. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-6">
              <nav className="flex flex-col gap-2 text-sm" aria-label="Site">
                <p className="font-semibold text-slate-900">Product</p>
                <Link href="/templates" className="text-slate-600 hover:text-slate-900">
                  Templates
                </Link>
                <Link href="/register" className="text-slate-600 hover:text-slate-900">
                  Create account
                </Link>
                <Link href="/login" className="text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
              </nav>
              <nav className="flex flex-col gap-2 text-sm" aria-label="Legal">
                <p className="font-semibold text-slate-900">Legal</p>
                <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-slate-600 hover:text-slate-900">
                  Terms of Service
                </Link>
                <Link href="/license" className="text-slate-600 hover:text-slate-900">
                  License
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
