# Formvity — Product flows, personas, and roadmap

This document describes the **intended product experience** (form makers and responders), how it differs from **developer-only tools** in the repo today, what to build next, and ideas that help turn Formvity into a credible startup.

---

## Table of contents

1. [Product intent at a glance](#product-intent-at-a-glance)
2. [Personas (who is “the user”)](#personas-who-is-the-user)
3. [Target journeys (your core flow)](#target-journeys-your-core-flow)
4. [Respondent intake vs form fields](#respondent-intake-vs-form-fields)
5. [Form maker: responses inbox](#form-maker-responses-inbox)
6. [Developer / internal tools (not customer “live preview”)](#developer--internal-tools-not-customer-live-preview)
7. [What this repository ships today](#what-this-repository-ships-today)
8. [Gap: from demo UI to your MVP](#gap-from-demo-ui-to-your-mvp)
9. [Startup suggestions (beyond the four flows)](#startup-suggestions-beyond-the-four-flows)
10. [Related docs](#related-docs)

---

## Product intent at a glance

| Actor | Goal |
|-------|------|
| **Form maker** (logged-in customer) | Own forms, edit them, publish a link, collect and review submissions. |
| **Responder** (anonymous visitor with a link) | Provide any **intro / identity** details the maker asked for, then complete the form once. No account required. |
| **Developer** (you or integrators) | Validate **PageDef** JSON, theme behavior, and edge cases using tools that are **not** the responder experience. |

The **hosted form URL** (or lightweight embed) is the responder surface. A **JSON + “live preview”** screen in the admin app is a **developer QA** surface: useful to see how a definition renders, not what you ship as “the product” to respondents.

---

## Personas (who is “the user”)

### Form maker (primary paying user)

- Signs in.
- Sees **My forms** (empty state or list).
- Creates a form **from a template** or **from scratch**.
- Edits fields, validation, look and feel, title/description.
- **Publishes** (or updates publish) and copies a **shareable link**.
- Opens **Responses** for a form: table or detail view of each submission, including **respondent intake** answers + **form field** answers.

### Form responder (secondary user, high volume)

- Opens shared link (email, SMS, website, QR).
- If the maker enabled it: completes a short **intake** step (e.g. name, email, phone, company — whatever the maker configured).
- Completes the form fields and submits.
- Sees a thank-you / confirmation state. Does not need an account.

### Developer / power user

- Uses JSON import, component reference, or an internal “preview definition” tool to debug schemas and widgets.
- Not positioned as the main “Formvity” journey for makers or responders.

---

## Target journeys (your core flow)

### 1. Login → dashboard (“all my forms”)

1. Maker signs up or logs in.
2. Lands on **Dashboard**: list of forms with title, status (draft / published), last edi
ted, response count (optional).
3. Actions: **New form**, **New from template**, open existing form, duplicate, archive.

*Backend:* authentication, list forms scoped to user or workspace. See [README-BACKEND-APIs.md](./README-BACKEND-APIs.md).

---

### 2. Start from a template → it becomes *their* form

1. Maker chooses **New from template** (or browses a template gallery).
2. System **creates a new form record** owned by that user, seeded from the template **PageDef** (copy, not a shared reference).
3. Maker is dropped into the **builder**; any save updates **their** `formId` only.
4. Other users’ forms are unaffected.

*Product rule:* templates are **starters**, not shared live documents. Each “Use template” is a **fork** into the maker’s workspace.

---

### 3. Build from scratch → publish → share link → responder completes

1. Maker creates an empty form, uses the **visual builder** (and optional JSON for power users).
2. Maker configures **respondent intake** (optional): fixed small set of fields shown **before** the main form (see next section).
3. Maker clicks **Publish** (or **Update publish**): system assigns a stable **public slug** and URL, e.g. `https://forms.formvity.com/r/{slug}`.
4. Maker copies link and distributes it.
5. Responder opens link → intake (if any) → main form → submit.
6. Submission is stored against that `formId` / publish version.

*Trust:* validate submissions **server-side** against the published schema (required fields, types), not only in the browser.

---

### 4. Maker views all responses (intake + form answers)

1. Maker opens form → **Responses** tab.
2. Sees a list: submitted time, intake summary columns (e.g. name, email), status (optional).
3. Clicks a row → full detail: **intake payload** + **all field answers** + metadata (device, approximate location if you add it and disclose it).
4. Export CSV, webhook, or email notification (later phases).

---

## Respondent intake vs form fields

Many products conflate “who is filling this” with the form itself. Your flow is clearer if you separate:

| Layer | Purpose | Configured by |
|-------|---------|----------------|
| **Respondent intake** | Stable identity / context the maker wants for **every** response (name, email, employee ID, order number, …) | Maker in form settings (not necessarily part of the marketing form body) |
| **Form fields** | The actual survey or application questions | Builder canvas |

**UX:** one page or a short wizard: Step 1 intake → Step 2 form → Submit. Alternatively, intake fields at the top of a single scrolling page (simpler MVP).

**Data model:** store `respondent` (or `intake`) object and `answers` map in the same submission document so the responses table can show columns from both.

---

## Form maker: responses inbox

Minimum useful inbox:

- Sort by newest first, pagination.
- Search across intake + answers (post-MVP if costly).
- Row click → detail drawer or page.
- **PII:** show retention policy; support delete/export for compliance.

---

## Developer / internal tools (not customer “live preview”)

The current app’s **“Live preview”** screen (JSON editor + apply + submit without persistence) is best framed as:

- **Definition QA** for builders and engineers (“does this PageDef render and validate?”).
- **Not** the responder product surface.

**Customer-facing** preview for makers can instead be:

- **“Preview as responder”** inside the authenticated app (same runtime component as public link, but not editable JSON), or
- Open the real **publish URL** in a new tab while still in draft (preview token) if you want parity with production.

That keeps a clear story: responders only ever see the **published** experience at a **clean URL**.

---

## What this repository ships today

This UI repo is a **Next.js frontend** integrated with the Spring API:

- **JWT auth** — login/register, Bearer token on maker routes, protected dashboard/builder.
- **Workspaces & forms** — list, create, autosave, publish, archive via `/workspace/**` APIs.
- **Public responder** — `/r/[slug]` loads `GET /public/forms/:slug`.
- **Templates** — static gallery; fork into builder client-side.
- **Submit** on public forms is **local thank-you only** until `POST …/submissions` is wired.

See [Integration status](./README-BACKEND-APIs.md#integration-status) for the full done/pending matrix.

---

## Gap: from demo UI to your MVP

| Target capability | Today (repo) | Build |
|-------------------|--------------|--------|
| Login / JWT | **Done** — register, login, Bearer on maker APIs | `POST /auth/refresh`, richer `/auth/me` |
| My forms list | **Done** — dashboard + workspace APIs | Filters, search |
| Template → owned form | Client-side fork into builder | `POST …/forms { templateId }` |
| Publish + share link | **Done** — publish modal + **`/r/[slug]`** | Harden publish-status edge cases |
| Responder intake + form | Form fields only on `/r/[slug]` | Intake step + settings |
| Stored submissions | **Pending** — local thank-you only | `POST …/submissions` + inbox UI |
| Dev-only JSON QA | **Removed** (`/live-preview`, `/forms`) | Builder Preview/JSON tab only |

---

## Startup suggestions (beyond the four flows)

These are practical additions that help you ship, sell, and stay safe—not extra random features.

**Trust and compliance**

- Privacy policy, terms, cookie notice if you use analytics cookies.
- Data retention defaults + delete/export for submissions (GDPR-style requests).
- Clear statement of where data is hosted (region matters for EU customers).

**Go-to-market**

- Narrow first niche (e.g. “job applications for SMBs” or “course waitlists”) so templates and copy resonate.
- Generous free tier (limited forms or responses/month) + paid for team features and removals of branding.

**Product polish**

- Thank-you page editor per form (redirect URL, message).
- Email notifications to maker on new response (simple win).
- Duplicate form, archive, restore.

**Technical**

- Rate limits and CAPTCHA on public submit from day one (abuse is real on public URLs).
- Separate **draft** vs **published** definition so edits do not break an in-flight responder session; optional “publish v2” when they’re ready.
- Observability: structured logs, alerts on publish/submit errors.

**Differentiation**

- Strong **branding / appearance** (you already have appearance tokens)—market “on-brand forms without engineers.”
- Fast public page (SSR or static shell + API for definition) for SEO and perceived quality.

---

## Related docs

- [README-BACKEND-APIs.md](./README-BACKEND-APIs.md) — **[Integration status](./README-BACKEND-APIs.md#integration-status)** (done vs pending), [JWT auth catalog](./README-BACKEND-APIs.md#jwt-api-by-category), [Which APIs to build first](./README-BACKEND-APIs.md#which-apis-to-build-first), Spring Boot guide, endpoint tables.
- [API.txt](./API.txt) — quick reference aligned with JWT integration.
- [README-DATABASE-SCHEMA.md](./README-DATABASE-SCHEMA.md) — relational tables, field list per table, and MVP SQL sketch.
- Repository root [README.md](../README.md) — build and deploy notes.
