"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

function IconLayout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5M9.75 9.75V20.25" />
    </svg>
  );
}

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

const productCards: {
  title: string;
  description: string;
  path: string;
  cta: string;
  icon: ReactNode;
}[] = [
  {
    title: "Visual builder",
    description:
      "Build forms visually with full control over labels, validation, and behavior. No coding required for day-to-day product teams.",
    path: "/register",
    cta: "Create account to build",
    icon: <IconLayout className="size-6" />,
  },
  {
    title: "Templates",
    description:
      "Job applications, support intakes, lead capture—start from production-shaped examples and adapt in minutes, not days.",
    path: "/templates",
    cta: "Browse library",
    icon: <IconSpark className="size-6" />,
  },
];

const pillars = [
  {
    title: "Business-friendly",
    body: "Designed for operators, founders, and product teams to ship forms quickly without waiting on engineering for every update.",
  },
  {
    title: "Fully customizable",
    body: "Customize field behavior, validation rules, layout patterns, and templates so every workflow matches your brand.",
  },
  {
    title: "Built to extend",
    body: "Scale from startup speed to enterprise complexity while keeping the form experience simple for end users.",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(99,102,241,0.35),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:pb-28 sm:pt-16 lg:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200 backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Formvity — forms that feel like your product
          </div>
          <h1 className="mt-8 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            <span className="text-white">Formvity</span> helps you{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-white to-cyan-200 bg-clip-text text-transparent">
              move beyond basic form tools
            </span>{" "}
            with confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Launch polished, on-brand forms in minutes. Built for teams that outgrow generic survey tools and want a
            serious builder experience.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/25 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Start free
            </button>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Log in
            </button>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
            {[
              ["Rich", "Field types & validation"],
              ["Custom", "Brand and workflow control"],
              ["Reliable", "Built for business use"],
              ["Share", "Publish links for responders"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{k}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Designed for teams shipping
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Product", "People Ops", "Customer success", "RevOps", "Clinical intake", "Internal tools"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Why teams pick this workflow</h2>
            <p className="mt-4 text-slate-600">
              Move beyond basic form tools and ship branded, conversion-focused form experiences your company can rely on.
            </p>
          </div>
          <ul className="mt-14 grid gap-8 sm:grid-cols-3">
            {pillars.map((p) => (
              <li key={p.title} className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
                <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything in one workspace</h2>
            <p className="mt-2 text-slate-600">
              Build in the visual editor, publish share links, and manage forms from your dashboard.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {productCards.map((card) => (
              <article
                key={card.path}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-8 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                  {card.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{card.description}</p>
                <button
                  type="button"
                  onClick={() => router.push(card.path)}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition group-hover:gap-2"
                >
                  {card.cta}
                  <span aria-hidden>→</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">From idea to working form</h2>
          <ol className="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
            {[
              { step: "01", title: "Design", desc: "Start from templates or build forms visually." },
              { step: "02", title: "Publish", desc: "Share a public link when your form is ready." },
              { step: "03", title: "Collect", desc: "Responders fill the form—no account required." },
            ].map((item) => (
              <li key={item.step} className="relative text-center sm:text-left">
                <span className="text-5xl font-black tabular-nums text-indigo-100">{item.step}</span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-indigo-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <blockquote className="text-xl font-medium leading-relaxed text-indigo-100 sm:text-2xl">
            "We upgraded from basic forms to a branded, customizable workflow the whole company can use."
          </blockquote>
          <footer className="mt-6 text-sm font-medium text-indigo-300">
            — Product & engineering teams shipping internal tools
          </footer>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ready to try Formvity?</h2>
            <p className="mt-2 text-slate-600">Start in the visual builder and publish when you are ready.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
            >
              Create free account
            </button>
            <button
              type="button"
              onClick={() => router.push("/templates")}
              className="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Browse templates
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
