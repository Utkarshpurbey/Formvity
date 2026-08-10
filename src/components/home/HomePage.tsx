"use client";

import Link from "next/link";
import { useAppSelector } from "../../store/hooks";
import { trackEvent } from "../../lib/googleAnalytics";
import { ProductMockup } from "./ProductMockup";

const PILLARS = [
  {
    title: "Organize by workspace",
    description:
      "Every team gets its own space — forms, members, tags, and settings stay together. Switch workspaces in one click when you wear multiple hats.",
  },
  {
    title: "Build and publish fast",
    description:
      "Design multi-page forms in a visual builder, start from templates when you need a head start, and share a public link the moment you're ready.",
  },
  {
    title: "Understand every response",
    description:
      "Analytics, audience breakdowns, and searchable submissions live beside your forms — so you spend less time exporting spreadsheets.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Create your workspace",
    description: "Set up a home for your team, invite collaborators, and keep projects separated.",
  },
  {
    step: "2",
    title: "Design and publish",
    description: "Build the form you need, configure intake and validation, then publish a shareable link.",
  },
  {
    step: "3",
    title: "Review and improve",
    description: "Watch responses arrive, tag submissions, and use analytics to spot patterns early.",
  },
];

function trackCta(location: string, label: string, href: string) {
  trackEvent("cta_click", { cta_location: location, cta_label: label, cta_href: href });
}

export function HomePage() {
  const user = useAppSelector((s) => s.auth.user);

  const primaryCta = user
    ? { label: "Go to workspace", href: "/workspaces" }
    : { label: "Get started free", href: "/register" };
  const secondaryCta = user
    ? { label: "Open builder", href: "/builder" }
    : { label: "Sign in", href: "/login" };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto scroll-smooth bg-slate-50">
      {/* Hero — light with a touch more violet depth than pure white */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-50">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(139,92,246,0.16),transparent)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:pb-24 lg:pt-20">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              Form builder for modern teams
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              The form platform your team actually stays in.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-[17px]">
              Formvity helps teams design forms, publish them instantly, and review responses in one workspace —
              without duct-taping surveys, spreadsheets, and analytics tools together.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={primaryCta.href}
                onClick={() => trackCta("hero", primaryCta.label, primaryCta.href)}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-700"
              >
                {primaryCta.label}
              </Link>
              <Link
                href={secondaryCta.href}
                onClick={() => trackCta("hero", secondaryCta.label, secondaryCta.href)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {secondaryCta.label}
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">Free to start · No credit card required</p>
          </div>

          <div className="mt-12 lg:mt-0">
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="border-b border-slate-200/80 bg-slate-100/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              One place for forms, teams, and answers
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Most teams outgrow generic form links quickly. Formvity is built around how you already work — in
              workspaces, with clear ownership, and with insight next to the data.
            </p>
          </div>

          <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <li
                key={pillar.title}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.02]"
              >
                <h3 className="text-sm font-semibold text-slate-900">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Product story */}
      <section className="border-b border-slate-200/80 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600">How teams use it</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              From first draft to published form in minutes
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Open a workspace, create a form in the builder, and publish when it looks right. Respondents fill it
              through a clean public page — no account required on their side.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              When responses come in, your team reviews them alongside analytics: timelines, completion rates, and
              per-question breakdowns. Tag submissions to triage leads, support cases, or applicants without leaving
              the app.
            </p>
            <Link
              href="/templates"
              onClick={() => trackCta("product_story", "Browse templates", "/templates")}
              className="mt-6 inline-flex text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Browse templates →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-100 to-violet-50/40 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Typical flow</p>
            <ol className="mt-4 space-y-4">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="border-b border-slate-200/80 bg-slate-100/50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Built for teams that collect information for a living
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            HR onboarding, sales lead capture, event registration, customer feedback, internal requests — if your
            workflow starts with someone filling out a form, Formvity gives you a professional home for it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["HR & People", "Sales", "Support", "Operations", "Events", "Product"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {user ? "Your workspace is ready" : "Start with your first workspace"}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            {user
              ? "Pick up where you left off — create a form, review responses, or invite a teammate."
              : "Create an account, set up a workspace, and publish your first form in a single session."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              onClick={() => trackCta("footer_cta", primaryCta.label, primaryCta.href)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-violet-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              {primaryCta.label}
            </Link>
            <Link
              href={user ? "/templates" : "/register"}
              onClick={() =>
                trackCta("footer_cta", user ? "Templates" : "Create account", user ? "/templates" : "/register")
              }
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {user ? "Browse templates" : "Create account"}
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
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Form builder with workspaces, publishing, and analytics — for teams who need clarity, not clutter.
              </p>
              <p className="mt-3 text-xs text-slate-400">© {new Date().getFullYear()} Formvity</p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
              <nav className="flex flex-col gap-2" aria-label="Product">
                <p className="font-semibold text-slate-900">Product</p>
                <Link href="/templates" className="text-slate-600 hover:text-slate-900">
                  Templates
                </Link>
                <Link href="/register" className="text-slate-600 hover:text-slate-900">
                  Sign up
                </Link>
                <Link href="/login" className="text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
              </nav>
              <nav className="flex flex-col gap-2" aria-label="Legal">
                <p className="font-semibold text-slate-900">Legal</p>
                <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
                  Privacy
                </Link>
                <Link href="/terms" className="text-slate-600 hover:text-slate-900">
                  Terms
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
