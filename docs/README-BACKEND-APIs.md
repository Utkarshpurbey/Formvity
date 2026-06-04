# Formvity — Backend API catalog & implementation guide

**Start here:** [Integration status](#integration-status) (done vs pending) · [Which APIs to build first](#which-apis-to-build-first) — numbered steps **1 → 15**.

This document also lists **all endpoints**, explains **why / where** they are used, and includes a longer Spring Boot guide below.

**Actors**

- **Form maker** (authenticated workspace member): dashboard, builder, publish, responses inbox — subject to **workspace role** (see [Roles & RBAC](#roles--rbac)).
- **Responder** (public): share link → optional intake → form → submit — **no** workspace role.
- **Platform staff** (optional): internal `/admin/**` support tools — separate from workspace **owner**.
- **Developer / internal**: JSON QA is not the responder product; public `GET` returns a **sanitized** PageDef.

The current UI repo is **frontend-only**; these endpoints replace `localStorage`. Product flows: [README-USER-FEATURES.md](./README-USER-FEATURES.md).

**Conventions**

- Paths are **illustrative** (`:workspaceId`, `:formId`, `:slug`). Align with your router.
- **Auth transport (current integration):** **JWT Bearer** — see [Integration status](#integration-status) and [JWT authentication](#jwt-api-by-category).
  - **`POST /auth/login`** returns `{ "token", "id", "displayName" }` (no wrapper on login).
  - **Protected routes:** `Authorization: Bearer <token>` on every maker request.
  - **Public (no token):** `POST /auth/register`, `POST /auth/login`, `GET /public/**`.
  - **SPA storage:** access token in `localStorage` (`formvity_auth_token`); cleared on **401** or logout.
  - **Dev proxy:** Next.js `app/api/v1/[...path]` forwards to Spring on `:8081`; strips `WWW-Authenticate` on 401.
  - **Alternatives (not used by this SPA today):** session cookies (`JSESSIONID`), HTTP Basic — document only if you support other clients.
- **Auth column** in tables below uses **minimum workspace role** (or **Public** / **Staff**). See [Roles & RBAC](#roles--rbac) for definitions and the permission matrix.
- Endpoints marked **Public** are unauthenticated (still rate-limit). All other maker routes require an **authenticated** user who is a **member** of `:workspaceId` with a role that satisfies the column.
- Prefer **JSON** bodies and **cursor-based pagination** for lists.
- **API prefix (current Spring integration):** `{base}/api/v1/…` — e.g. `http://localhost:8081/api/v1/…`. Maker form routes use singular **`/workspace/:workspaceId`** (not `/workspaces`); public routes use **`/public/forms/:slug`**. The catalog tables below use `/workspaces` as the logical name; map to your controller paths.
- **JSON envelope:** successful reads that return a PageDef use **`{ "data": { "formDef": { … } } }`** unless noted. See [§8 — Response envelope & UI call](#response-envelope--ui-call).
- **Production layout:** responders use **`/r/:slug`** + **`GET /public/forms/:slug`**; makers use authenticated workspace routes. See [Production architecture](#production-architecture).

---

<a id="integration-status"></a>

## Integration status (backend + frontend)

Last aligned with the **Form-Builder-UI** repo (JWT auth, Next.js dev proxy). Use this to see what is **live in the product** vs what the **API catalog** still describes for later phases.

### Done (implemented & wired in UI)

| Area | Backend (Spring) | Frontend (this repo) |
|------|------------------|----------------------|
| **Auth — JWT** | `POST /auth/login` issues HS384-signed JWT; filter validates `Authorization: Bearer` | `src/utils/authHeaders.ts` stores token; `src/api/http.ts` sends Bearer on all maker calls |
| **Auth — register / logout / me** | `POST /auth/register`, `POST /auth/logout`, `GET /auth/me` | `src/api/authApi.ts`, Redux `authSlice`, `AuthBootstrap` hydrates on protected routes |
| **Workspaces** | `GET/POST /workspace`, `GET/DELETE /workspace/{id}`, `GET …/members` | `workspaceApi.ts`, dashboard workspace switcher |
| **Forms CRUD** | List, create, get draft, `PATCH` autosave, archive (`DELETE ?hard=false`) | `formsApi.ts`, builder load/save, workspace form list |
| **Publish** | `POST …/publish`, `GET …/publish-status` (per backend readiness) | Publish modal, share link, `/r/[slug]` public route |
| **Public read** | `GET /public/forms/:slug` | `app/r/[slug]/page.tsx` + `useFormDef` |
| **Dev API path** | `{base}/api/v1/…` on `:8081` | Browser calls same-origin `/api/v1/…` on `:3000` (proxy route handler) |

**Login response (actual contract today):**

```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9…",
  "id": "b9f56efd-4bc4-4088-8121-fa2b5d657b06",
  "displayName": "uttu"
}
```

**Example protected request:**

```http
GET /api/v1/workspace HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9…
Accept: application/json
```

### Pending (documented or partial — not fully productized)

| Area | Notes |
|------|--------|
| **`POST /auth/refresh`** | No refresh-token rotation in UI; user re-logs in when JWT expires |
| **Rich `GET /auth/me`** | Target shape includes `email`, `workspaces[]` with `role`; UI today uses `{ id, displayName }` (+ email from login form in Redux) |
| **Workspace RBAC** | `owner` / `editor` / `viewer` matrix — backend may not enforce on all routes; UI does not gate Publish/archive by role yet |
| **Public submit** | `POST /public/forms/:slug/submissions` — responder UI shows thank-you locally; **no API persist** yet |
| **Submissions inbox** | `GET …/forms/:formId/submissions` — not built in UI |
| **Template fork API** | Templates are **static** in UI; no `POST …/forms { templateId }` to backend |
| **Users admin** | `GET /users` — not used by SPA |
| **Password reset / SSO** | `/auth/password/*`, `/auth/sso/*` — catalog only |
| **Webhooks, analytics, CSV export** | Later-phase endpoints |
| **Token storage hardening** | Consider httpOnly cookie or refresh flow for production XSS posture (SPA uses `localStorage` today) |

### Removed from UI (no longer applicable)

- Standalone maker preview routes `/forms`, `/live-preview`, `/components` (builder in-app Preview/JSON and template modal remain).
- Session cookie (`JSESSIONID`) and HTTP Basic on maker APIs.
- Dev-only `HARDCODED_FORM_DEF_API` and `/forms?slug=` load path.

---

<a id="roles--rbac"></a>

## Roles & RBAC

Authorization is **workspace-scoped**: every maker request under `/workspaces/:workspaceId/**` must resolve the caller’s **membership** and **role** for that workspace. The server must **never** trust `workspaceId` or `userId` from the client body for access control.

Roles are stored on [`workspace_members.role`](./README-DATABASE-SCHEMA.md#3-workspace_members) (Postgres `VARCHAR(32)`). Use exactly these enum values in API and DB:

| Role | Stored value | Who gets it | Summary |
|------|--------------|-------------|---------|
| **Owner** | `owner` | Workspace creator; at least one per workspace | Full control: billing/workspace settings, member invites, destructive actions, integrations. |
| **Editor** | `editor` | Invited teammate who builds and publishes | Create/edit/publish forms, webhooks, exports; **cannot** manage members or delete the workspace. |
| **Viewer** | `viewer` | Invited teammate who only consumes data | Read forms, definitions, submissions inbox, analytics; **cannot** change drafts or publish. |

**Not workspace roles**

| Actor | Auth | Notes |
|-------|------|-------|
| **Responder** | **Public** on `/public/**` only | No user account; rate-limited submit. |
| **Authenticated user (no workspace)** | Session / JWT | May call `/auth/*`, `GET /me`, `POST /workspaces` (create own workspace). |
| **Platform staff** | **Staff** on `/admin/**` | Internal support; not stored in `workspace_members`. |

### Role hierarchy

For permission checks, treat roles as ordered (higher includes lower):

`owner` → `editor` → `viewer`

**Shorthand in endpoint tables**

| Column label | Meaning |
|--------------|---------|
| **Public** | No login required. |
| **User** | Any authenticated user (identity only; workspace membership not required). |
| **Viewer+** | Member of `:workspaceId` with role `viewer`, `editor`, or `owner`. |
| **Editor+** | Member with role `editor` or `owner`. |
| **Owner** | Member with role `owner` only. |
| **Staff** | Platform operator (separate principal / allow-list). |

**HTTP status when denied**

| Situation | Status |
|-----------|--------|
| Not logged in | **401** Unauthorized |
| Logged in but not a member of the workspace | **403** Forbidden |
| Member but role too low (e.g. viewer calls `PATCH` form) | **403** Forbidden |
| Resource not in workspace / wrong id | **404** Not Found (optional: hide existence) |

### Permission matrix (workspace)

| Capability | Viewer | Editor | Owner |
|------------|:------:|:------:|:-----:|
| List / open forms (`GET …/forms`, `GET …/forms/:id`) | ✓ | ✓ | ✓ |
| Create / edit draft (`POST`/`PATCH`/`PUT …/forms/:id`) | | ✓ | ✓ |
| Publish / unpublish / change slug | | ✓ | ✓ |
| Duplicate form / restore version | | ✓ | ✓ |
| Delete / archive form | | | ✓ |
| List / view submissions & export CSV | ✓ | ✓ | ✓ |
| Delete submission(s) (GDPR) | | | ✓ |
| Form webhooks (read config) | ✓ | ✓ | ✓ |
| Form webhooks (write / test) | | ✓ | ✓ |
| Workspace metadata (`GET …/workspaces/:id`) | ✓ | ✓ | ✓ |
| Update workspace settings (`PATCH …/workspaces/:id`) | | | ✓ |
| List members | ✓ | ✓ | ✓ |
| Invite / change role / remove member | | | ✓ |
| Workspace integrations (OAuth connect/disconnect) | | | ✓ |
| Delete workspace | | | ✓ |

**Solo MVP:** On `POST /auth/register`, create one workspace and one `workspace_members` row with `role = owner`. Until invites ship, every user is effectively **owner** of their default workspace; still enforce checks so team APIs are safe when enabled.

### `GET /auth/me` (and `/me`) response shape

Hydrate the SPA after login and on protected navigation. Include **per-workspace roles** so the UI can hide builder actions for viewers.

```json
{
  "id": "uuid",
  "email": "you@company.com",
  "name": "…",
  "defaultWorkspaceId": "uuid",
  "workspaces": [
    { "workspaceId": "uuid", "name": "My workspace", "role": "owner" }
  ]
}
```

- **`role`** must be one of `owner` | `editor` | `viewer`.
- For the active workspace, the client uses `workspaces[].role` for route guards (e.g. disable **Publish** for `viewer`).
- **Server:** resolve role from `workspace_members` (or implicit owner for solo MVP); on **401**, SPA clears JWT and redirects to `/login`.

### Enforcement (Spring Boot)

1. **Authentication** — validate JWT (`Authorization: Bearer`); populate `SecurityContext` with `userId` from `sub` claim.
2. **Workspace gate** — for `/workspaces/{workspaceId}/**`, load membership; if missing → **403**.
3. **Role gate** — map endpoint → minimum role (`Viewer+`, `Editor+`, `Owner`) using a single policy table or `@PreAuthorize` SpEL, e.g. `@PreAuthorize("@workspaceAuth.hasRole(#workspaceId, 'EDITOR')")`.
4. **Audit** — log **owner** actions on members, workspace delete, submission purge, and all **Staff** impersonation.

**Frontend (this repo):** hide or disable UI by role; **backend remains source of truth** (never rely on UI-only checks).

---

<a id="jwt-api-by-category"></a>

## JWT authentication — API grouped by category

This block is the **contract** for the **JWT-based** auth layer used by the Formvity SPA. It complements the long-form tables in [§4](#4-authentication-and-session)–[§7](#7-forms-pagedef-crud).

### Category A — Platform & health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/internal/health` | Internal / public | Liveness for probes and deploy smoke tests. |

### Category B — Authentication (JWT)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | **Public** | Create account. Body `{ "displayName", "email", "password" }` (min 8 chars). **200/201** + user summary in `ApiResponse` wrapper. Does **not** need to return JWT (SPA calls login after register). |
| `POST` | `/auth/login` | **Public** | Validate credentials. **200** + **plain JSON** (no wrapper): `{ "token", "id", "displayName" }`. `token` is the access JWT for subsequent requests. |
| `POST` | `/auth/logout` | **Bearer** | Optional server-side denylist / audit; SPA clears stored token regardless. |
| `POST` | `/auth/refresh` | Refresh token | **Pending** — rotate access token when refresh tokens are added. |

**JWT semantics (backend must)**

- Sign with a server secret (e.g. HS384); include `sub` (user id), `displayName`, `iat`, `exp`.
- Reject expired or malformed tokens with **401** JSON body — **do not** send `WWW-Authenticate: Basic` (breaks SPA fetch in some browsers).
- **`/auth/login`** and **`/auth/register`** stay **permitAll**; all `/workspace/**` maker routes require valid Bearer token.

**Spring Security (typical)**

- `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`, or OAuth2 Resource Server with `JwtDecoder`.
- CORS: allow `Authorization` header from app origin (`http://localhost:3000` dev, production app URL).

### Category C — Current user

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/auth/me` | **Bearer** | Current user profile. **Today:** `{ "id", "displayName" }` or wrapped in `ApiResponse`. **Target:** add `email`, `workspaces[]` with `role` ([RBAC](#roles--rbac)). **401** if token missing/invalid. |
| `PATCH` | `/me` | **Bearer** | Update profile (optional, later). |

### Category D — Workspaces (tenancy)

See [§6 Workspaces](#6-workspaces-tenancy). Spring paths use **`/workspace`** (singular). All routes require **Bearer JWT** except public invite URLs (later).

### Category E — Forms (PageDef)

See [§7 Forms](#7-forms-pagedef-crud). Routes under **`/workspace/{workspaceId}/forms/**`** require **Bearer JWT**.

### Category F — Publishing & public runtime

See [§8 Publishing and public runtime](#8-publishing-and-public-runtime). **`GET /public/forms/:slug`** stays **Public** (no JWT).

### Category G — Submissions

See [§9 Submissions](#9-submissions). **`POST /public/forms/:slug/submissions`** is **Public**; inbox endpoints require **Bearer JWT** + workspace role (**pending** in UI).

### Category H — Password recovery & SSO (optional, later)

See [§4](#4-authentication-and-session) rows for `/auth/password/*`, `/auth/providers`, `/auth/sso/*`.

**Legacy catalog alias:** [Session API catalog](#session-api-by-category) — renamed; session-cookie flow is **not** used by this SPA.

<a id="session-api-by-category"></a>
<!-- Deprecated anchor: see jwt-api-by-category -->

## Which APIs to build first

Use this **strict order**. Do not skip ahead: each step should work in Postman (or tests) before you start the next.

Until **step 11**, treat the maker as a **dev stub** (fixed `workspaceId`, `permitAll` on maker routes, or `X-Dev-User-Id` header). Steps **12–14 (JWT login/me)** are **partially done** in the current stack — see [Integration status](#integration-status).

| Step | API | What “done” looks like |
|------|-----|-------------------------|
| **1** | `GET /internal/health` | 200 OK from your deploy / local run. |
| **2** | `POST /workspaces` + `GET /workspaces` | You have a real `workspaceId` (or seed one row in SQL and skip POST until users exist). |
| **3** | `POST /workspaces/:workspaceId/forms` | Creates a row; returns `formId` (new empty form). |
| **4** | `GET /workspaces/:workspaceId/forms` | Returns a list (even one item) for the future dashboard. |
| **5** | `GET /workspaces/:workspaceId/forms/:formId` | Returns full **PageDef** JSON for the builder to load. |
| **6** | `PATCH /workspaces/:workspaceId/forms/:formId` | Saving draft JSON updates DB; reload GET shows changes. |
| **7** | `POST /workspaces/:workspaceId/forms/:formId/publish` | Draft copied to **published** storage; **slug** exists and is unique. |
| **8** | `GET /public/forms/:slug` | Anonymous read returns **sanitized** published JSON; 404 if not published. |
| **9** | `POST /public/forms/:slug/submissions` | Body `{ respondent, answers }` validated and **persisted**; 201 + id. |
| **10** | `GET /workspaces/:workspaceId/forms/:formId/submissions` | Paginated list includes the row from step 9. |
| **11** | `GET /workspaces/:workspaceId/forms/:formId/submissions/:submissionId` | Full detail for inbox drill-down. |

**Then wire real accounts (before or with Spring Security):**

| Step | API |
|------|-----|
| **12** | `POST /auth/register` |
| **13** | `POST /auth/login` |
| **14** | `GET /auth/me` (include `workspaces[].role`) |

**Last:**

| Step | Work |
|------|------|
| **15** | **Spring Security + RBAC** — JWT filter on `/workspace/**` and `/auth/me`; **permitAll** on `/public/**`, `/auth/register`, `/auth/login`; enforce **Viewer+ / Editor+ / Owner** on each maker route ([matrix](#permission-matrix-workspace)); CORS with `Authorization` header. **JWT issuance: done; full RBAC: pending.** |

**Only after 1–15:** `POST /auth/refresh`, `POST /auth/logout`, `GET …/publish-status`, CSV export, `POST …/forms` with `{ templateId }`, file uploads, webhooks, analytics (see endpoint sections **§4–§19** below).

**Note:** `GET /internal/health` is listed under [§16 Admin](#16-admin-and-support) in the reference tables; build it first anyway (step **1**).

---

## Table of contents

**Build order:** [Which APIs to build first](#which-apis-to-build-first)

**Database:** [README-DATABASE-SCHEMA.md](./README-DATABASE-SCHEMA.md) (tables + fields + DDL sketch)

**Session auth (by category):** [JWT API catalog](#jwt-api-by-category) · [Integration status](#integration-status)

**Authorization:** [Roles & RBAC](#roles--rbac)

1. [Getting started — comprehensive guide](#1-getting-started--comprehensive-guide) (Spring Security **last**)
2. [Minimal MVP set](#2-minimal-mvp-set)
3. [Why each API exists and where to call it](#3-why-each-api-exists-and-where-to-call-it)
4. [Authentication and session](#4-authentication-and-session)
5. [Users and profile](#5-users-and-profile)
6. [Workspaces (tenancy)](#6-workspaces-tenancy)
7. [Forms (PageDef CRUD)](#7-forms-pagedef-crud)
8. [Publishing and public runtime](#8-publishing-and-public-runtime) — [Slug generation](#slug-generation), [Production architecture](#production-architecture), [Response envelope & UI call](#response-envelope--ui-call)
9. [Submissions](#9-submissions)
10. [Templates (optional server catalog)](#10-templates-optional-server-catalog)
11. [File uploads](#11-file-uploads)
12. [Webhooks and outbound integrations](#12-webhooks-and-outbound-integrations)
13. [Integrations configuration (inbound)](#13-integrations-configuration-inbound)
14. [Analytics and events](#14-analytics-and-events)
15. [Anti-abuse and platform](#15-anti-abuse-and-platform)
16. [Admin and support](#16-admin-and-support)
17. [Non-HTTP infrastructure](#17-non-http-infrastructure)
18. [Security: PageDef actions and code execution](#18-security-pagedef-actions-and-code-execution)
19. [Related docs](#19-related-docs)

---

## 1. Getting started — comprehensive guide

The **canonical implementation order** is the numbered table in [Which APIs to build first](#which-apis-to-build-first) (steps **1 → 15**). This section adds **Spring Boot** detail and a phase lens; it does not replace that order.

Use this if you are building a **Spring Boot** (or similar) API from zero. The idea is to **prove domain behavior first**, then **lock down with Spring Security** so you are not fighting filters and CORS while you still change DTOs daily.

### 1.1 Prerequisites

- **JDK 21** (or 17 LTS) + **Spring Boot 3.x** project (`spring-boot-starter-web`, `spring-boot-starter-data-jpa` or JDBC, `spring-boot-starter-validation`).
- **PostgreSQL** (recommended) for relational data: users, workspaces, forms, published snapshots, submissions.
- **OpenAPI** optional but useful (`springdoc-openapi`) for contract tests with the React app.
- This repo’s **PageDef** JSON as the document you persist (text/JSONB column or normalized—your choice for v1 JSONB is fine).

### 1.2 Two HTTP “surfaces” from day one

| Surface | Example path prefix | Who calls it |
|---------|---------------------|--------------|
| **Maker API** | `/workspaces/{id}/...` | Authenticated SPA (later); during dev, Postman/curl |
| **Public API** | `/public/forms/{slug}` | Responder page, no login |

Keep controllers in **separate packages** (`...api.maker`, `...api.public`) so when you add Spring Security you can write: `authorizeHttpRequests(r -> r.requestMatchers("/public/**").permitAll()...)`.

### 1.3 Phase plan (Spring Security **last**)

Rough map to [Which APIs to build first](#which-apis-to-build-first): phases **0–1** → steps **1–2** (+ DB); **2–4** → steps **3–8**; **5–6** → steps **9–11**; **LAST** → steps **12–15**.

| Phase | Goal | Spring Security |
|-------|------|-----------------|
| **0** | Empty app runs; `GET /internal/health` returns OK. | **None** or single `permitAll()` for everything (dev only). |
| **1** | JPA entities + Flyway/Liquibase: `User`, `Workspace` (1 per user OK), `Form` (draft JSON), optional `PublishedSnapshot` (slug + JSON + version). | Still **permitAll** for maker routes, or a fixed `X-Dev-User-Id` header your service reads—**no** JWT yet. |
| **2** | `GET /public/forms/:slug` reads **published** JSON; 404 if unpublished. | `permitAll` for `/public/**` only; maker routes still open **or** dev header. |
| **3** | `POST/PATCH/GET …/forms` CRUD: create list, load builder doc, save draft. | Same: identify “maker” via dev stub. |
| **4** | `POST …/publish`: copy draft → published row, assign `slug`, uniqueness check. | Same. |
| **5** | `POST /public/.../submissions`: validate `respondent` + `answers` against published definition; persist `Submission`. | Rate limit can start as **simple** (bucket in DB/Redis) before full edge rules. |
| **6** | `GET …/submissions` + by id for inbox UI. | Maker identification still stub until Phase LAST. |
| **7** | Nice-to-haves: CSV export, `GET /templates`, webhooks via `@Async` or queue. | Optional: restrict `/admin/**` with HTTP Basic **only** on a management port (still not full app JWT). |
| **LAST** | **Spring Security + RBAC**: `SecurityFilterChain` (session, JWT, and/or Basic on `/auth/me`), **CORS** for SPA, **`/public/**` permitAll**, **`/auth/register`**, **`/auth/login` permitAll**, **authenticated** `/workspaces/**` + `/auth/me`, password hashing (`BCryptPasswordEncoder`), **`workspace_members.role`** checks on every maker route ([Roles & RBAC](#roles--rbac)), `@PreAuthorize` or centralized policy service, **CSRF** policy per cookie vs JWT. Replace dev header with real `Authentication` principal. | Delete `permitAll` on maker paths; return **403** when role is insufficient. |

**Why Spring Security last:** your controllers, validation rules, and DB schema will churn. Early Security means every 401 blocks frontend integration. Once `POST /submissions` and `GET …/forms` behave correctly, securing them is mostly configuration + token issuance.

### 1.4 Spring Boot specifics (non-security)

- **DTOs + `@Valid`** for request bodies; map to entities in a service layer.
- **`@ControllerAdvice`** for consistent error JSON (`problem+json` or simple `{ "message", "code" }`).
- **Transaction boundaries** on publish + submit (single `@Transactional` service methods).
- **Idempotency** (optional): `Idempotency-Key` header on submit for double-clicks.

### 1.5 When you finally add Spring Security (Phase LAST)

1. Add **`spring-boot-starter-security`** (and **`spring-boot-starter-oauth2-resource-server`** if JWT).
2. Define a **`SecurityFilterChain`** bean: public routes, auth routes, then `anyRequest().authenticated()`.
3. Implement **`UserDetailsService`** (or custom `AuthenticationProvider`) backed by your `User` table.
4. Issue **JWT** on login (`/auth/login`) or use **session** for same-site SPA—pick one and stick to it.
5. **CORS**: allow credentials only if you use cookies; for Bearer JWT, configure allowed origins/methods/headers for your Vite dev server + prod app URL.
6. **Integration test** with `@SpringBootTest` + `MockMvc` and `@WithMockUser` for maker routes; `MockMvc` without auth for `/public/**`.

### 1.6 Wiring the React app (current — JWT)

See [Integration status](#integration-status) for done vs pending.

- **Login:** `POST /auth/login` with `{ "userName", "password" }` → store `token` from response.
- **Maker APIs:** every `fetch` to `/workspace/**` includes `Authorization: Bearer <token>` (`src/utils/authHeaders.ts`, `src/api/http.ts`).
- **Hydration:** on protected routes, if token exists and Redux has no user, call `GET /auth/me`; on **401**, clear token and treat as logged out.
- **Logout:** `POST /auth/logout` (optional) + clear token client-side.
- **Dev:** browser hits `http://localhost:3000/api/v1/…`; Next.js proxies to `http://localhost:8081/api/v1/…`.
- **Responder:** **no** JWT; only `GET` + `POST` on `/public/**`; route `/r/[slug]`.

**Not used by this SPA:** session cookies (`credentials: "include"`), HTTP Basic, `POST /auth/refresh` (until implemented).

---

## 2. Minimal MVP set

**Order to implement:** follow [Which APIs to build first](#which-apis-to-build-first) (steps **1 → 15**). The table below is a **capability checklist**, not the sequence to code in (e.g. auth rows appear before forms in the table, but you build **forms + public + submissions** first with a dev stub).

Smallest backend that supports **login → my forms → create (template or scratch) → publish link → responder (intake + form) → maker sees responses**.

Assume `workspaceId` is implicit (single workspace per user) or resolved server-side from `GET /me` to keep paths short in v1.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/auth/register` | Public | Sign up |
| `POST` | `/auth/login` | Public | **JWT:** return `{ "token", "id", "displayName" }` (plain JSON, no wrapper) |
| `POST` | `/auth/logout` | User | End session |
| `GET` | `/auth/me` | User | Profile + `workspaces[].role` ([RBAC](#roles--rbac)) |
| `GET` | `/workspaces/:workspaceId/forms` | Viewer+ | **Dashboard:** list forms |
| `POST` | `/workspaces/:workspaceId/forms` | Editor+ | **New:** empty body or `{ templateId }` → new `formId` |
| `GET` | `/workspaces/:workspaceId/forms/:formId` | Viewer+ | Load **PageDef** for builder (read-only UI for viewer) |
| `PATCH` | `/workspaces/:workspaceId/forms/:formId` | Editor+ | Save draft definition + settings |
| `POST` | `/workspaces/:workspaceId/forms/:formId/publish` | Editor+ | Publish / update public slug |
| `GET` | `/public/forms/:slug` | **Public** | Sanitized definition for **responder** runtime (no secrets) |
| `POST` | `/public/forms/:slug/submissions` | **Public** | Body includes **`respondent`** (intake) + **`answers`** (form fields); rate-limited |
| `GET` | `/workspaces/:workspaceId/forms/:formId/submissions` | Viewer+ | **Inbox:** paginated list |
| `GET` | `/workspaces/:workspaceId/forms/:formId/submissions/:submissionId` | Viewer+ | Full row: intake + answers + metadata |

**Optional v1:** `POST /auth/refresh`, `GET …/submissions/export?format=csv`, CAPTCHA verify inside submit or separate token endpoint.

Single-user startups can collapse `workspaceId` to a default workspace created on registration.

---

## 3. Why each API exists and where to call it

Use this while implementing controllers **and** React routes. For each block: **Why** = product/security reason; **Where** = screen or trigger; **Backend must** = non-negotiable server behavior.

**Two clients**

| Client | Example host | Calls mostly |
|--------|--------------|--------------|
| **Maker SPA** | `app.formvity.com` | Auth, `GET /auth/me` (roles), `GET …/forms`, `PATCH …/forms/:id` (Editor+), `POST …/publish` (Editor+), `GET …/submissions` (Viewer+) |
| **Responder** | `forms.formvity.com` / `/r/:slug` | `GET /public/forms/:slug`, `POST …/submissions`, optional uploads + analytics |

Same **PageDef** shape; **public GET** returns **sanitized** JSON only.

```mermaid
sequenceDiagram
  participant M as Maker browser
  participant API as Your API
  participant R as Responder browser

  M->>API: login / session
  M->>API: PATCH form (draft)
  M->>API: publish
  R->>API: GET public form by slug
  R->>API: POST submission
  M->>API: GET submissions list
```

### 3.1 Authentication and session

**Why:** Maker routes must be tied to an identity (ownership, billing).

**Where:** Register/login pages; logout in header; refresh in HTTP interceptor on 401; password reset flows; SSO redirects.

**Backend must:** Hash passwords, throttle logins, issue tokens or secure sessions.

### 3.2 Current user (`/auth/me`)

**Why:** Client needs **user id**, **default workspace id**, and **per-workspace `role`** to prefix requests and gate UI ([Roles & RBAC](#roles--rbac)).

**Where:** App shell after auth—on load and on protected route changes (not on public `/login`, `/register`, `/templates`, etc.).

**Backend must:** Resolve user from session/JWT/Basic; return `workspaces[].role`; **401** if unauthenticated; never trust client `userId` for authorization.

### 3.3 Workspaces and members

**Why:** Shared forms, **role-based** access, billing container. Solo: auto-create one workspace with **`owner`** on register.

**Where:** Workspace page (members & roles), workspace switcher, invite accept flow.

**Backend must:** Load `workspace_members.role` on every `…/workspaces/:workspaceId/...` call; enforce **Viewer+ / Editor+ / Owner** per endpoint; **403** when role is too low.

### 3.4 Forms (CRUD)

**Why:** Persist **PageDef**; builder is only in-memory until saved.

**Where:** Dashboard list (`GET …/forms`, **Viewer+**); new form / template fork (`POST`, **Editor+**); builder mount (`GET`, **Viewer+** read / **Editor+** write); autosave (`PATCH`, **Editor+**); publish (**Editor+**); delete form (**Owner**).

**Backend must:** Validate shape (strict on publish); enforce role on every mutating route; return **403** if a **viewer** attempts `PATCH` or `publish`.

### 3.5 Publishing and public read

**Why:** Responders need stable **slug** URL; no secrets in response.

**Where:** Publish button; copy-link UI (`publish-status`); **responder** page mount at `/r/:slug` → `GET /public/forms/:slug`. Maker **builder** uses `GET …/forms/:formId` (authenticated); optional in-app draft preview does not use the share link.

**Backend must:** Sanitize public JSON; strip unsafe `actions` / webhook secrets; return **`data.formDef`** envelope; **generate slugs on the server** at publish time ([Slug generation](#slug-generation)); never expose workspace/form UUIDs as the public share URL.

### 3.6 Submissions

**Why:** Persist answers; maker inbox.

**Where:** Responder submit button (`POST` public); responses tab (`GET` list/detail/export); compliance delete.

**Backend must:** Validate `respondent` + `answers` against **published** definition; rate limit; optional CAPTCHA.

### 3.7 Templates, uploads, webhooks, integrations, analytics

- **Templates API:** Gallery if templates are server-driven; else `POST …/forms` with enum `templateId` only.
- **Uploads:** File field in responder flow → presign → PUT to storage → complete → reference keys in `answers`.
- **Webhooks:** Settings UI saves URL; **worker** POSTs to customer after submit (never browser → customer URL).
- **Inbound OAuth:** Integrations settings; connect/disconnect flows.
- **Analytics:** Responder beacons; maker analytics dashboard.
- **Anti-abuse / health:** Edge or filter on public POST; probes on `/internal/health`.

### 3.8 Build order (reminder)

Use the single checklist: [Which APIs to build first](#which-apis-to-build-first) (steps **1 → 15**). Do not maintain a second mental stack here.

---

## 4. Authentication and session

**Current SPA integration:** **JWT Bearer** only — see [JWT API catalog](#jwt-api-by-category) and [Integration status](#integration-status).

For **`POST /auth/login`**, return the access token in JSON (not `Set-Cookie`). Optional **`POST /auth/refresh`** for long-lived sessions (not wired in UI yet).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | Public | Create user. Body `{ "displayName", "email", "password" }`. |
| `POST` | `/auth/login` | Public | Validate credentials; **200** + `{ "token", "id", "displayName" }`. Body `{ "userName", "password" }`. |
| `POST` | `/auth/logout` | Bearer | Optional invalidate; SPA clears token either way. |
| `POST` | `/auth/refresh` | Refresh token | **Pending** — rotate access token. |
| `POST` | `/auth/password/forgot` | Public | Start reset flow (email link). |
| `POST` | `/auth/password/reset` | Public | Complete reset with token. |
| `GET` | `/auth/providers` | Public | List enabled SSO providers (optional). |
| `GET` | `/auth/sso/:provider/start` | Public | Begin OIDC (optional). |
| `GET` | `/auth/sso/:provider/callback` | Public | OIDC callback (optional). |

---

## 5. Users and profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/auth/me` | User | Id, email, name, `defaultWorkspaceId`, `workspaces: [{ workspaceId, name, role }]`. |
| `GET` | `/me` | User | Optional alias of `/auth/me`. |
| `PATCH` | `/me` | User | Update profile (not workspace roles). |
| `GET` | `/me/sessions` | User | List active sessions (optional). |
| `DELETE` | `/me/sessions/:sessionId` | User | Revoke session (optional). |

---

## 6. Workspaces (tenancy)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/workspaces` | User | List workspaces the user belongs to (each item includes `role`). |
| `POST` | `/workspaces` | User | Create workspace; caller becomes **`owner`**. |
| `GET` | `/workspaces/:workspaceId` | Viewer+ | Workspace metadata. |
| `PATCH` | `/workspaces/:workspaceId` | Owner | Rename, billing email, etc. |
| `DELETE` | `/workspaces/:workspaceId` | Owner | Soft-delete workspace (policy-dependent). |
| `GET` | `/workspaces/:workspaceId/members` | Viewer+ | List members and roles (`owner` \| `editor` \| `viewer`). |
| `POST` | `/workspaces/:workspaceId/members` | Owner | Invite by email; body `{ "email", "role": "editor" \| "viewer" }` (cannot create another `owner` via invite—transfer ownership is a separate flow if needed). |
| `PATCH` | `/workspaces/:workspaceId/members/:userId` | Owner | Change role; cannot demote/remove the last `owner`. |
| `DELETE` | `/workspaces/:workspaceId/members/:userId` | Owner | Remove member; cannot remove the last `owner`. |
| `GET` | `/workspaces/:workspaceId/invites/:token` | Public | Accept invite landing (optional). |
| `POST` | `/workspaces/:workspaceId/invites/:token/accept` | User | Accept invite; assigns role from invite record. |

---

## 7. Forms (PageDef CRUD)

Treat **FormDef** (multi-page) as the canonical JSON document your builder saves in `forms.draft_page_def` / `form_publications.published_page_def`. Legacy single-page **PageDef** (root-level `components[]` only) is accepted on ingest and normalized to FormDef v1.

#### FormDef schema (v1)

```json
{
  "version": 1,
  "id": "form-uuid-or-slug",
  "title": "Dashboard / form name",
  "description": "Optional form-level intro",
  "formSettings": { "appearance": { "primaryColor": "#4f46e5", ... } },
  "actions": { "logName": "..." },
  "startPageId": "page-1",
  "pages": [
    {
      "id": "page-1",
      "title": "Step title",
      "description": "Optional step copy",
      "components": [ { "id": "email", "type": "email", "label": "Email", "required": true } ],
      "navigation": { "defaultNextPageId": "page-2" }
    }
  ]
}
```

| Field | Scope | Notes |
|-------|--------|--------|
| `version` | Root | Must be `1` for multi-page documents. |
| `title` | Form | Keep in sync with `forms.title` on PATCH. |
| `formSettings` | Form | Global appearance; served on public GET (sanitized). |
| `actions` | Form | Optional; strip unsafe entries on publish ([§18](#18-security-pagedef-actions-and-code-execution)). |
| `pages[]` | Form | Ordered steps; linear respondent flow uses array order for Back/Next. |
| `pages[].components[]` | Page | Same field types as before (`text`, `email`, `select`, …). |
| `pages[].navigation` | Page | Reserved for branching; v1 uses optional `defaultNextPageId` only. |

**Legacy migration:** If the JSON has `components` at the root and no `pages`, the UI wraps it as a single-page form (`pages: [{ … }]`) with `version: 1`.

See [§18](#18-security-pagedef-actions-and-code-execution) for `actions` security.

Include in **`formSettings`** (names illustrative) anything the **public** runtime needs without a second round-trip, for example:

- **`appearance`** — theming (already in the UI repo).
- **`respondentIntake`** — optional step: which “basic details” responders must fill before `components` (drives validation of `respondent` on `POST …/submissions`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/workspaces/:workspaceId/forms` | Viewer+ | List forms (filters: status, search). |
| `POST` | `/workspaces/:workspaceId/forms` | Editor+ | Create empty form or `{ templateId }`. |
| `GET` | `/workspaces/:workspaceId/forms/:formId` | Viewer+ | Full definition for builder (viewer: read-only in UI). Response: `{ data: { formDef } }` — see [§8](#response-envelope--ui-call). |
| `PATCH` | `/workspaces/:workspaceId/forms/:formId` | Editor+ | Partial or full document update. |
| `PUT` | `/workspaces/:workspaceId/forms/:formId` | Editor+ | Full replace (optional if you prefer PUT). |
| `DELETE` | `/workspaces/:workspaceId/forms/:formId` | Owner | Archive or hard delete. |
| `POST` | `/workspaces/:workspaceId/forms/:formId/duplicate` | Editor+ | Clone form + definition. |
| `GET` | `/workspaces/:workspaceId/forms/:formId/versions` | Viewer+ | Version list (if versioning on). |
| `GET` | `/workspaces/:workspaceId/forms/:formId/versions/:versionId` | Viewer+ | Read historical definition. |
| `POST` | `/workspaces/:workspaceId/forms/:formId/versions/:versionId/restore` | Editor+ | Restore snapshot as new draft. |

---

## 8. Publishing and public runtime

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/workspaces/:workspaceId/forms/:formId/publish` | Editor+ | Promote draft to published; allocate/update `slug`. |
| `POST` | `/workspaces/:workspaceId/forms/:formId/unpublish` | Editor+ | Take live form offline. |
| `GET` | `/workspaces/:workspaceId/forms/:formId/publish-status` | Viewer+ | Draft vs published, slug, last published at. |
| `PATCH` | `/workspaces/:workspaceId/forms/:formId/slug` | Editor+ | Change public slug (availability check). |
| `GET` | `/public/forms/:slug` | **Public** | Sanitized **PageDef** for rendering (strip secrets, unsafe `actions`). Response: `{ data: { formDef } }`. |
| `GET` | `/public/forms/:slug/meta` | **Public** | Open Graph / SEO title, description, favicon (optional). |

**Embed** is usually the same `GET /public/forms/:slug` consumed by a small embed script or iframe `src`.

<a id="slug-generation"></a>

### Slug generation

The **slug** is the stable, globally unique URL segment responders use. It is stored on [`form_publications.slug`](./README-DATABASE-SCHEMA.md#5-form_publications) and resolved by `GET /public/forms/:slug`.

#### When a slug is allocated

| Trigger | Behavior |
|---------|----------|
| **First publish** (`POST …/forms/:formId/publish`) | Server **generates** a slug if the body omits `slug`, or **validates** the client-provided slug. |
| **Re-publish** (draft updated) | **Keep** the existing slug by default; bump `version` / `published_page_def`. Optional body `{ "regenerateSlug": true }` only if product allows link rotation. |
| **Custom slug** | `POST …/publish` or `PATCH …/forms/:formId/slug` with `{ "slug": "my-team-contact" }`. Server checks uniqueness and format. |
| **Unpublish** | Slug may remain reserved (404 on public GET) or be released — pick one policy and document it. |

#### Format rules (validation)

Apply on **generate** and on **PATCH slug**:

| Rule | Value |
|------|--------|
| Pattern | `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| Length | **3–64** characters recommended (`VARCHAR(160)` max in DB) |
| Case | **Lowercase only** (normalize on input) |
| Uniqueness | **Globally unique** across all workspaces (DB `UNIQUE (slug)`) |
| Reserved | Reject: `api`, `admin`, `auth`, `login`, `public`, `workspace`, `workspaces`, `forms`, `health`, `me`, `r`, `static`, `assets`, and your own route prefixes |

**HTTP status**

| Case | Status |
|------|--------|
| Slug taken | **409 Conflict** `{ "message": "Slug already in use" }` |
| Invalid format | **400 Bad Request** |
| Publish OK | **200** or **201** with slug in `data` |

#### Default generation algorithm (server)

Use this when the client does not send `slug` on first publish:

1. **Base string** — slugify the draft **`formDef.title`**:
   - Lowercase; Unicode NFKD + strip combining marks (e.g. `Café` → `cafe`).
   - Replace any run of non `[a-z0-9]` with a single `-`.
   - Trim leading/trailing `-`.
2. **Fallback** — if the result is empty or shorter than 3 chars, use `form-{first8(formId)}` (hex, lowercase, no hyphens in the suffix segment).
3. **Truncate** — max 56 chars for the base (leave room for a suffix).
4. **Collision** — if `slug` exists, append `-2`, `-3`, … up to `-99`, then `-` + 4 random `[a-z0-9]` chars.
5. **Persist** — insert `form_publications` row with `is_current = true`, copy **sanitized** draft JSON to `published_page_def`.

Example: title `"Contact Us!"` → `contact-us`; collision → `contact-us-2`.

#### Publish & publish-status response shapes

**`POST /workspaces/:workspaceId/forms/:formId/publish`**

Request (all optional):

```json
{
  "slug": "my-custom-slug"
}
```

Response:

```json
{
  "data": {
    "formId": "cf955d08-8c59-4302-a5ef-1aa8158a49a9",
    "slug": "contact-us",
    "publicUrl": "https://forms.formvity.com/r/contact-us",
    "version": 1,
    "publishedAt": "2026-05-23T10:00:00Z"
  }
}
```

**`GET /workspaces/:workspaceId/forms/:formId/publish-status`**

```json
{
  "data": {
    "status": "published",
    "slug": "contact-us",
    "publicUrl": "https://forms.formvity.com/r/contact-us",
    "lastPublishedAt": "2026-05-23T10:00:00Z",
    "draftChangedSincePublish": false
  }
}
```

`status`: `draft` | `published` | `unpublished`. UI uses this for **Copy link** and publish badge on the dashboard.

<a id="production-architecture"></a>

### Production architecture (maker vs responder)

In production, treat **maker** and **responder** as two clients. They share the PageDef JSON shape but use **different routes, hosts, and API endpoints**. Do not ship the dev pattern (hardcoded workspace URL on a single `/forms` page) to production.

#### Two clients

| Client | Example host | Primary UI routes | API calls |
|--------|--------------|-------------------|-----------|
| **Maker SPA** | `app.formvity.com` | `/builder`, `/workspace`, dashboard | **JWT Bearer**; `PATCH …/forms/:id`; `POST …/publish` |
| **Responder** | `forms.formvity.com` | **`/r/:slug`** (recommended) | **No auth**; `GET /public/forms/:slug`; `POST /public/forms/:slug/submissions` |

Same **PageDef** document; **public GET** returns a **sanitized** published snapshot only (no secrets, no executable `actions`).

#### Slug ownership (production rule)

| Do | Don't |
|----|--------|
| Server generates slug on **`POST …/publish`** (or validates optional `{ "slug" }` in body) | Generate slugs in the browser for production |
| Store slug on `form_publications.slug`; return `data.slug` + `data.publicUrl` to maker UI | Put `workspaceId` / `formId` in the share link |
| Re-publish keeps the same slug; bump published **version** / JSON | Rotate slug on every publish unless product explicitly allows it |
| Copy-link UI reads **`GET …/publish-status`** or publish response | Rely on client-only state for the public URL |

#### Responder flow (production)

1. Maker publishes → API returns e.g. `publicUrl: "https://forms.formvity.com/r/contact-us"`.
2. Responder opens **`/r/contact-us`** (Next.js: `app/r/[slug]/page.tsx` or separate responder app).
3. Page reads **slug from the path** (not query params, not env vars).
4. `GET /api/v1/public/forms/contact-us` → `{ data: { formDef } }`.
5. Render form (full-page appearance); submit → `POST /api/v1/public/forms/contact-us/submissions`.

No login, no JWT, no workspace UUIDs in the URL.

#### Maker flow (production)

| Screen | How form JSON is loaded |
|--------|---------------------------|
| **Builder** | `GET /api/v1/workspace/{workspaceId}/forms/{formId}` on mount; `PATCH` on save |
| **In-app preview (optional)** | Session draft from builder context, **or** authenticated workspace `GET` inside the app only |
| **Share link** | **Never** the workspace URL — always `publicUrl` with **slug** |

Workspace `GET` is for **authenticated makers** only. Responders must not receive or bookmark `…/workspace/…/forms/{formId}`.

#### Dev vs production (this repo)

| | **Status** | **Notes** |
|--|------------|-----------|
| Responder route | **Done:** `/r/[slug]` | `app/r/[slug]/page.tsx` |
| Public load | **Done:** `publicFormApi(slug)` | `GET /public/forms/:slug` |
| Maker auth | **Done:** JWT Bearer | Token from `POST /auth/login` |
| Dev proxy | **Done:** `/api/v1` on `:3000` → `:8081` | `app/api/v1/[...path]/route.ts` |
| Public submit | **Pending** | UI toast only; wire `POST …/submissions` |
| Removed | `/forms`, `/live-preview`, hardcoded dev URLs | Use `/r/[slug]` and workspace APIs |

Public slug resolution in production (implemented in `app/r/[slug]/page.tsx`):

```typescript
const loadSource = slug ? { type: "public" as const, slug } : null;
```

<a id="response-envelope--ui-call"></a>

### Response envelope & UI call (this repo)

The form **runtime** renders a PageDef with full-page `formSettings.appearance` (`FormPageShell`). Public responders use **`/r/[slug]`**; makers edit via the **builder** with workspace-scoped `GET`/`PATCH`.

#### Envelope — `GET` form definition

Both **maker** and **public** read endpoints return the same core shape:

```json
{
  "data": {
    "formDef": {
      "id": "page-1",
      "title": "Contact us",
      "description": "…",
      "components": [ { "id": "name", "type": "text", "label": "Name", "required": true } ],
      "formSettings": {
        "appearance": {
          "primaryColor": "#4f46e5",
          "backgroundColor": "#eef2ff",
          "surfaceColor": "#ffffff",
          "textColor": "#0f172a"
        }
      }
    }
  }
}
```

| Endpoint (logical) | Spring path (example) | Auth | Used by UI (production) |
|--------------------|------------------------|------|-------------------------|
| `GET /public/forms/:slug` | `GET /api/v1/public/forms/:slug` | **Public** | **`/r/[slug]`** responder page |
| `GET /workspaces/:workspaceId/forms/:formId` | `GET /api/v1/workspace/:workspaceId/forms/:formId` | **Viewer+** | **Builder** mount; optional authenticated preview (not share link) |

**Public `formDef`** must be **sanitized** (no secrets, no executable `actions`). Maker `GET` may return the full draft including `actions`.

Optional maker fields alongside `formDef`:

```json
{
  "data": {
    "formId": "cf955d08-8c59-4302-a5ef-1aa8158a49a9",
    "slug": "contact-us",
    "status": "published",
    "formDef": { }
  }
}
```

The UI parser accepts, in order: `data.formDef`, `data` (if it is a PageDef), `formDef`, or a bare PageDef root — but **`data.formDef` is the canonical contract**.

#### Frontend wiring

| Piece | Location | Role |
|-------|----------|------|
| URL builders | `src/utils/apiPath.ts` | `publicFormApi(slug)`, `workspaceFormApi(workspaceId, formId)`; dev same-origin `/api/v1` |
| Fetch + parse | `src/lib/formDefFromApi.ts` | `fetchFormDef()`, `formDefFromApiPayload()` |
| Hook | `src/hooks/useFormDef.ts` | Loading / error / `pageDef` for public slug |
| Responder page | `app/r/[slug]/page.tsx` | `GET /public/forms/:slug`; no maker shell |
| JWT auth | `src/utils/authHeaders.ts`, `src/api/http.ts` | `Authorization: Bearer`; token in `localStorage`; clear on 401 |
| Dev proxy | `app/api/v1/[...path]/route.ts` | Proxy to Spring; strip `WWW-Authenticate` |
| Full-page shell | `src/components/page-def/builder/FormPageShell.tsx` | Responder appearance (used by `/r/[slug]`) |

**Environment (production)**

```bash
NEXT_PUBLIC_API_URL=https://api.formvity.com
NEXT_PUBLIC_API_PATH=api/v1
```

**Environment (local dev)**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_API_PATH=api/v1
# Browser uses http://localhost:3000/api/v1/* (Next proxy) unless NEXT_PUBLIC_API_DIRECT=true
API_PROXY_TARGET=http://localhost:8081
```

**How the UI chooses the endpoint**

| UI route | API called | Auth |
|----------|------------|------|
| **`/r/contact-us`** | `GET {API}/public/forms/contact-us` | None |
| **`/builder?workspaceId=&formId=`** | `GET/PATCH {API}/workspace/{id}/forms/{formId}` | Bearer |
| **Login / dashboard** | `POST /auth/login`, `GET /workspace`, `GET …/forms` | Bearer after login |

#### Example `fetch` (maker load)

```typescript
import { getApiHeaders } from "@/src/utils/authHeaders";
import { workspaceFormApi } from "@/src/utils/apiPath";

const res = await fetch(workspaceFormApi(workspaceId, formId), {
  method: "GET",
  headers: getApiHeaders(), // Authorization: Bearer …
});
const json = await res.json();
const pageDef = json.data?.formDef ?? json.data?.draftPageDef;
```

#### Example `fetch` (login)

```typescript
const res = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  body: JSON.stringify({ userName: "you@company.com", password: "…" }),
});
const { token, id, displayName } = await res.json();
localStorage.setItem("formvity_auth_token", token);
```

#### Example `fetch` (public slug — responder)

```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/forms/${slug}`, {
  method: "GET",
  headers: { Accept: "application/json" },
});
const json = await res.json();
const pageDef = json.data.formDef;
```

#### Product URLs vs API paths

| Layer | Production example |
|-------|---------------------|
| **Share link (responder)** | `https://forms.formvity.com/r/contact-us` |
| **Responder UI route** | `/r/contact-us` → reads slug from path |
| **API (public read)** | `GET /api/v1/public/forms/contact-us` |
| **API (public submit)** | `POST /api/v1/public/forms/contact-us/submissions` |
| **API (publish)** | `POST /api/v1/workspace/{workspaceId}/forms/{formId}/publish` → `data.slug`, `data.publicUrl` |
| **Maker builder (not shared)** | `https://app.formvity.com/builder?formId=…` → workspace `GET` / `PATCH` |

```mermaid
sequenceDiagram
  participant Maker as app.formvity.com
  participant API as Spring API
  participant R as forms.formvity.com/r/slug

  Maker->>API: PATCH workspace/…/forms/{id} (draft)
  Maker->>API: POST …/publish
  API-->>Maker: data.slug, data.publicUrl
  Note over Maker: Copy link shows publicUrl
  R->>API: GET /api/v1/public/forms/{slug}
  API-->>R: data.formDef (sanitized)
  R->>R: Render FormPageShell + fields
  R->>API: POST /api/v1/public/forms/{slug}/submissions
  Maker->>API: GET workspace/…/forms/{id}/submissions (inbox)
```

#### End-to-end checklist (production)

1. **Publish** returns `slug` + `publicUrl`; slug stored in `form_publications`.
2. **Share link** uses slug only (`/r/:slug`), not workspace/form UUIDs.
3. **Responder** calls **`GET /public/forms/:slug`** (no auth).
4. **Submit** calls **`POST /public/forms/:slug/submissions`**; server validates against **published** JSON.
5. **Maker inbox** uses workspace-scoped submission APIs (authenticated).
6. **CORS** allows responder origin on `/public/**` only.
7. Remove dev hardcoded URLs and env-based form ids from production builds.

---

## 9. Submissions

### Payload shape (intake + answers)

```json
{
  "respondent": { "fullName": "…", "email": "…" },
  "answers": { "fieldIdA": "…", "fieldIdB": "…" },
  "metadata": { "userAgent": "…", "referrer": "…" }
}
```

- **`respondent`**: validated against **`formSettings.respondentIntake`** on the **published** definition.
- **`answers`**: map of component `id` → value; validate against published `components`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/public/forms/:slug/submissions` | **Public** | Create submission; body: `{ respondent?, answers, metadata? }` plus optional `captchaToken`. |
| `GET` | `/workspaces/:workspaceId/forms/:formId/submissions` | Viewer+ | Paginated list; query: `cursor`, `limit`, `from`, `to`, `fieldId`, `q`. |
| `GET` | `/workspaces/:workspaceId/forms/:formId/submissions/:submissionId` | Viewer+ | Single row with full payload. |
| `DELETE` | `/workspaces/:workspaceId/forms/:formId/submissions/:submissionId` | Owner | GDPR delete. |
| `GET` | `/workspaces/:workspaceId/forms/:formId/submissions/export` | Viewer+ | `?format=csv` or `xlsx` (stream). |
| `POST` | `/workspaces/:workspaceId/forms/:formId/submissions/bulk-delete` | Owner | Batch delete by ids or filter (optional). |

**Server-side validation**: validate **`respondent`** and **`answers`** against the published schema.

Optional:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/public/forms/:slug/submissions/draft` | **Public** | Save partial progress (session key in cookie). |
| `PATCH` | `/public/forms/:slug/submissions/draft/:draftId` | **Public** | Update draft. |
| `POST` | `/public/forms/:slug/submissions/draft/:draftId/finalize` | **Public** | Convert draft to final. |

---

## 10. Templates (optional server catalog)

If templates are not only bundled in the frontend:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/templates` | Public or User | List template metadata. |
| `GET` | `/templates/:templateId` | Public or User | Full starter **PageDef** (or reference only). |

Creation already covered by `POST /workspaces/:workspaceId/forms` with `{ templateId }`.

---

## 11. File uploads

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/workspaces/:workspaceId/forms/:formId/uploads` | Editor+ | Dev-only: test upload policy (optional). |
| `POST` | `/public/forms/:slug/uploads` | **Public** | Request presigned URL or multipart ticket for a field. |
| `POST` | `/public/forms/:slug/uploads/:uploadId/complete` | **Public** | Finalize after client PUT to object storage. |

Often implemented as:

- `POST …/uploads` returns `{ url, fields }` for S3 POST policy or a short-lived signed PUT URL.
- Submission payload references `uploadId` / object keys.

---

## 12. Webhooks and outbound integrations

Browser does **not** call customer webhooks directly for security and reliability. Use **workers**:

- On successful submission, enqueue **OutboundWebhookJob** with payload, HMAC signature, retries, DLQ.

Optional **management APIs**:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/workspaces/:workspaceId/forms/:formId/integrations/webhook` | Viewer+ | Masked URL, enabled flag. |
| `PUT` | `/workspaces/:workspaceId/forms/:formId/integrations/webhook` | Editor+ | Set URL, secret, event types. |
| `POST` | `/workspaces/:workspaceId/forms/:formId/integrations/webhook/test` | Editor+ | Send sample signed payload. |
| `GET` | `/workspaces/:workspaceId/forms/:formId/integrations/webhook/deliveries` | Viewer+ | Recent delivery attempts (optional). |

Same pattern for **Slack**, **email via ESP**, **Zapier/Make** triggers: either dedicated endpoints or generic **integration** resource.

---

## 13. Integrations configuration (inbound)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/workspaces/:workspaceId/integrations` | Viewer+ | List connected services. |
| `POST` | `/workspaces/:workspaceId/integrations/:provider/connect` | Owner | OAuth start. |
| `GET` | `/workspaces/:workspaceId/integrations/:provider/callback` | Owner | OAuth callback. |
| `DELETE` | `/workspaces/:workspaceId/integrations/:provider` | Owner | Disconnect. |

---

## 14. Analytics and events

Either first-party:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/public/forms/:slug/events` | **Public** | Beacon: `view`, `start`, `complete`, `field_blur` (privacy-aware). |
| `GET` | `/workspaces/:workspaceId/forms/:formId/analytics` | Viewer+ | Aggregates and funnels. |

Or delegate to **Segment / PostHog / GA4** from the client with your measurement IDs served from config.

---

## 15. Anti-abuse and platform

Often **edge** or **middleware**, not always a dedicated “API”:

| Concern | Implementation |
|---------|----------------|
| Rate limit public submit | Per IP + per slug (e.g. Cloudflare, API gateway). |
| CAPTCHA | `POST /public/forms/:slug/submissions` accepts `captchaToken`; server verifies with provider. |
| Bot detection | Same request or edge plugin. |
| CORS | Restrict admin APIs to your app origin; public form API may allow embed origins explicitly. |

Optional explicit endpoint:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/public/verify-captcha` | Public | Verify token only (if separated from submit). |

---

## 16. Admin and support

Platform **Staff** is not a `workspace_members` role. Protect `/admin/**` with a separate principal (e.g. internal IdP group, API key, or IP allow-list) and audit every call.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/internal/health` | Internal | Liveness/readiness. |
| `GET` | `/admin/workspaces` | Staff | Support search (highly restricted). |
| `POST` | `/admin/workspaces/:workspaceId/impersonate` | Staff | Break-glass impersonation token (audited). |

---

## 17. Non-HTTP infrastructure

These are not REST “resources” but are **required** for a serious backend:

| Component | Role |
|-----------|------|
| **Object storage** | File uploads, exports, static assets. |
| **Queue / worker** | Webhooks, emails, heavy exports, search indexing. |
| **Scheduler** | Retries, scheduled publish, retention jobs. |
| **Email** | Invites, password reset, submission copies. |
| **Secrets store** | Webhook signing keys, OAuth client secrets. |
| **Audit log** | Immutable append-only log for admin actions. |

---

## 18. Security: PageDef actions and code execution

If **PageDef** includes **client-executed** or string-based **actions** (for example dynamic handlers), **do not** execute equivalent arbitrary code on the server. For production:

- Store **typed** integration actions (enum + parameters) and run them in **trusted workers**.
- Strip or ignore unsafe fields from `GET /public/forms/:slug`.

---

## 19. Related docs

- [README-DATABASE-SCHEMA.md](./README-DATABASE-SCHEMA.md) — **Tables, columns, types**, ERD, and MVP DDL sketch (`workspace_members.role`).
- [README-USER-FEATURES.md](./README-USER-FEATURES.md) — User journeys, intake vs answers, product ideas.
- [Roles & RBAC](#roles--rbac) — workspace roles (`owner`, `editor`, `viewer`) and permission matrix (this doc).
- Repository root [README.md](../README.md) — frontend build and deploy.
