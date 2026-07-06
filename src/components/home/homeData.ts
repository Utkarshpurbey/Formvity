import { TEMPLATE_CATALOG } from "../../lib/templates";

export const HOME_STATS = [
  { value: `${TEMPLATE_CATALOG.length}+`, label: "Templates" },
  { value: "6", label: "Analytics views" },
  { value: "Multi-page", label: "Form flows" },
  { value: "No code", label: "Required" },
] as const;

export const VALUE_PROPS = [
  {
    title: "Build in minutes",
    description: "Drag-and-drop builder with intake steps, themes, and multi-page flows.",
    icon: "build",
  },
  {
    title: "Publish instantly",
    description: "One-click publish with a shareable link — respondents need no account.",
    icon: "publish",
  },
  {
    title: "Analyze everything",
    description: "Timelines, audience breakdowns, question insights, and raw responses.",
    icon: "analyze",
  },
] as const;

export const FEATURES = [
  {
    title: "Visual builder",
    description: "Drag-and-drop fields, multi-page flows, intake steps, and themed appearance — no code required.",
    icon: "layout",
    color: "from-violet-500 to-indigo-600",
    span: "lg:col-span-2",
  },
  {
    title: "Template library",
    description: `${TEMPLATE_CATALOG.length} production-ready templates for HR, sales, events, healthcare, and more.`,
    icon: "spark",
    color: "from-fuchsia-500 to-pink-600",
    span: "",
  },
  {
    title: "Publish & share",
    description: "One-click publish with public links. Respondents fill forms without creating an account.",
    icon: "link",
    color: "from-cyan-500 to-blue-600",
    span: "",
  },
  {
    title: "Analytics & insights",
    description: "Response timelines, audience breakdowns, device traffic, question distributions, and individual responses.",
    icon: "chart",
    color: "from-emerald-500 to-teal-600",
    span: "lg:col-span-2",
  },
  {
    title: "Workspaces",
    description: "Organize forms by team or project. Manage drafts, publish status, and lifecycle from one dashboard.",
    icon: "grid",
    color: "from-amber-500 to-orange-600",
    span: "",
  },
  {
    title: "Respondent intake",
    description: "Capture name, email, and custom attributes before the form — with full control over fields and validation.",
    icon: "user",
    color: "from-rose-500 to-red-600",
    span: "",
  },
] as const;

export const WORKFLOW_STEPS = [
  { step: "01", title: "Pick a template", description: "Start from 20+ curated templates or a blank canvas." },
  { step: "02", title: "Customize in builder", description: "Drag fields, configure intake, and brand your form." },
  { step: "03", title: "Publish & collect", description: "Share a public link and gather responses instantly." },
  { step: "04", title: "Analyze results", description: "Explore metrics, breakdowns, and per-question insights." },
] as const;

export const INDUSTRIES = [
  "Product",
  "HR",
  "Sales",
  "Support",
  "Healthcare",
  "Education",
  "Events",
  "Operations",
] as const;

export const USE_CASES = [
  { team: "HR & People", forms: "Job applications, onboarding, exit interviews", emoji: "👥", color: "from-indigo-500 to-violet-600" },
  { team: "Sales & Marketing", forms: "Lead capture, demo requests, newsletter signups", emoji: "📈", color: "from-amber-500 to-orange-500" },
  { team: "Events", forms: "Registration, webinars, volunteer signup", emoji: "🎟️", color: "from-fuchsia-500 to-pink-600" },
  { team: "Support & IT", forms: "Support tickets, bug reports, helpdesk requests", emoji: "🛠️", color: "from-cyan-500 to-blue-600" },
  { team: "Healthcare", forms: "Patient intake, appointment requests", emoji: "🏥", color: "from-emerald-500 to-teal-600" },
  { team: "Education", forms: "Course enrollment, scholarship applications", emoji: "🎓", color: "from-sky-500 to-blue-600" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Do respondents need an account?",
    a: "No. Published forms are accessible via a public link — respondents fill and submit without signing up.",
  },
  {
    q: "Can I start from a template?",
    a: `Yes. Formvity includes ${TEMPLATE_CATALOG.length} curated templates across HR, sales, events, healthcare, and more. Open any template in the visual builder to customize it.`,
  },
  {
    q: "What analytics are included?",
    a: "Every form gets overview metrics, audience & traffic breakdowns, per-question distributions, response timelines, and searchable individual responses.",
  },
  {
    q: "Is Formvity free to start?",
    a: "Yes. Create an account and start building — no credit card required to publish and collect responses.",
  },
] as const;

export const ANALYTICS_BULLETS = [
  "Response timeline with 7d / 30d / 90d windows",
  "Bar & pie chart toggle on every breakdown",
  "Question breakdowns with top answers",
  "Completion rates and publication version tracking",
] as const;
