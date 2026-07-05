# Formvity

**Build forms. Understand every response.**

Formvity is a modern form builder for teams who need more than a survey link — a visual editor, multi-page flows, publishable share links, workspaces, and built-in analytics. Respondents complete forms without creating an account.

**Live:** [formvity.in](https://formvity.in)

---

## Features

### For form makers

- **Visual builder** — drag-and-drop fields, multi-page forms, respondent intake, and themed appearance
- **Template library** — 20+ production-ready templates (HR, sales, events, healthcare, and more)
- **Workspaces** — organize forms by team or project with role-based access
- **Publishing** — one-click publish with shareable public links (`/r/{slug}`)
- **Analytics** — response timelines, audience breakdowns, question distributions, and submission inbox
- **Collaboration** — invite teammates by email with Editor / Viewer roles

### For respondents

- **No account required** — open a link, complete intake (if configured), fill the form, and submit
- **Branded experience** — per-form colors, typography, and layout via PageDef appearance settings
- **Server-rendered public pages** — form content loads on the server for faster first paint on mobile

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Redux Toolkit |
| Forms | React Hook Form + Zod |
| Analytics | Vercel Analytics & Speed Insights, Google Analytics 4 |
| Backend API | Spring Boot REST API (`/api/v1`) — separate service |

---

## Getting started

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+
- A running Formvity API (hosted on Render, or local Spring on port `8081`)

### Installation

```bash
git clone https://github.com/Utkarshpurbey/Form-Builder-UI.git
cd Form-Builder-UI
npm install
cp .env.example .env
```

### Development

Two API profiles are built in. Pick one with the npm script — do not set `NEXT_PUBLIC_API_*` in `.env.local` or it will override the profile.

| Command | API target | Use when |
|---------|------------|----------|
| `npm run dev` | Render (`api-formvity.onrender.com`) | Default — no local backend needed |
| `npm run dev:local` | `http://localhost:8081` | You are running the Spring API locally |

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
# or
npm run preview   # build + start in one step
```

### Lint

```bash
npm run lint
```

---

## Environment variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend origin (e.g. `https://api-formvity.onrender.com`) |
| `NEXT_PUBLIC_API_DIRECT` | `true` = browser calls API directly; `false` = same-origin `/api/v1` proxy |
| `API_PROXY_TARGET` | Upstream for the Next.js API proxy (local dev) |
| `NEXT_PUBLIC_APP_URL` | Public site URL for SEO, sitemap, and Open Graph |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional Google Analytics 4 ID |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search Console verification tag |

Profile files in `config/` are loaded by the dev scripts:

- `config/render.env` — hosted API (used by `npm run dev`)
- `config/local.env` — local Spring on `:8081` (used by `npm run dev:local`)

---

## Project structure

```
Form-Builder-UI/
├── app/                    # Next.js App Router pages & layouts
│   ├── (app)/              # Authenticated app (workspaces, builder, templates)
│   ├── login/              # Sign-in
│   ├── register/           # Account creation
│   ├── invite/             # Workspace invitation acceptance
│   └── r/[slug]/           # Public responder form (SSR)
├── src/
│   ├── api/                # HTTP client & API types
│   ├── components/         # UI, builder, analytics, publish, workspace
│   ├── hooks/              # Builder & form-loading hooks
│   ├── lib/                # FormDef, validation, SEO, templates
│   └── store/              # Redux slices (auth, workspaces, forms, analytics)
├── config/                 # Dev API profiles (render / local)
├── docs/                   # Product, API, and database documentation
└── scripts/                # Dev server & perf benchmark utilities
```

---

## Key routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Marketing home page |
| `/login`, `/register` | Public | Authentication |
| `/invite` | Public | Accept workspace invitation |
| `/workspaces` | Auth | Workspace list |
| `/workspaces/[id]` | Auth | Forms in a workspace |
| `/workspaces/[id]/forms/[formId]` | Auth | Form overview & publishing |
| `/workspaces/[id]/forms/[formId]/analytics` | Auth | Response analytics |
| `/builder` | Auth | Visual form builder |
| `/templates` | Auth | Template gallery |
| `/r/[slug]` | Public | Live published form for respondents |

---

## Documentation

| Document | Contents |
|----------|----------|
| [docs/README-USER-FEATURES.md](docs/README-USER-FEATURES.md) | Product flows, personas, maker/responder journeys, roadmap |
| [docs/README-BACKEND-APIs.md](docs/README-BACKEND-APIs.md) | API catalog, integration status, endpoint reference |
| [docs/README-DATABASE-SCHEMA.md](docs/README-DATABASE-SCHEMA.md) | Postgres schema for users, workspaces, forms, submissions |

---

## Scripts reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server + Render API |
| `npm run dev:local` | Dev server + local Spring API |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run preview` | Build and start locally |
| `npm run lint` | ESLint |
| `npm run perf:baseline` | Capture build-size baseline |
| `npm run perf` | Capture post-change perf report |

---

## Deployment

The frontend is designed to deploy on **Vercel** (or any Node host that supports Next.js 14).

1. Connect the repository to Vercel.
2. Set environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, etc.).
3. Deploy — `next build` runs automatically.

The API runs separately (currently on **Render** at `api-formvity.onrender.com`). See [docs/README-BACKEND-APIs.md](docs/README-BACKEND-APIs.md) for backend setup.

---

## Contributing

This repository is currently **private**. If you are a collaborator:

1. Create a feature branch from `main`.
2. Keep changes focused; match existing TypeScript and Tailwind conventions.
3. Run `npm run lint` and `npm run build` before opening a pull request.

---

## License

Private — all rights reserved.
