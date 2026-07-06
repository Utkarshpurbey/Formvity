/** Lightweight walkthrough copy — mirrors real routes & UI labels without heavy template defs. */

export type WalkthroughScene = "templates" | "builder" | "publish" | "analytics";

export const WALKTHROUGH_SCENES: {
  id: WalkthroughScene;
  step: string;
  title: string;
  description: string;
}[] = [
  {
    id: "templates",
    step: "01",
    title: "Browse the template library",
    description:
      "Filter by category, preview the live form UI, then open any template in the visual builder.",
  },
  {
    id: "builder",
    step: "02",
    title: "Build with the visual editor",
    description:
      "Drag components from the palette, configure intake & form pages, and tune field properties in the side panels.",
  },
  {
    id: "publish",
    step: "03",
    title: "Publish & share",
    description:
      "Set a public slug, publish in one step, and copy the shareable link — respondents need no account.",
  },
  {
    id: "analytics",
    step: "04",
    title: "Analyze every response",
    description:
      "Overview metrics, audience breakdowns, question distributions, and searchable individual responses.",
  },
];

export const SCENE_ORDER: WalkthroughScene[] = ["templates", "builder", "publish", "analytics"];

export const SCENE_DURATION_MS = 5200;

export const SCENE_URLS: Record<WalkthroughScene, string> = {
  templates: "formvity.in/templates",
  builder: "formvity.in/builder?template=event-registration",
  publish: "formvity.in/builder",
  analytics: "formvity.in/workspaces/…/forms/…/analytics",
};

/** Mirrors TemplateCard + catalog-details metadata. */
export const WALKTHROUGH_TEMPLATES = [
  {
    title: "Event Registration",
    category: "Events",
    badge: "Events",
    fields: 9,
    categoryStyle: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    selected: true,
  },
  {
    title: "Job Application",
    category: "HR & hiring",
    badge: "HR",
    fields: 8,
    categoryStyle: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    selected: false,
  },
  {
    title: "Lead Capture",
    category: "Sales",
    badge: "Sales",
    fields: 7,
    categoryStyle: "bg-amber-50 text-amber-800 ring-amber-100",
    selected: false,
  },
  {
    title: "Patient Intake",
    category: "Healthcare",
    badge: "Healthcare",
    fields: 10,
    categoryStyle: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    selected: false,
  },
] as const;

export const WALKTHROUGH_CATEGORIES = ["All templates", "Events", "HR", "Sales", "Healthcare"] as const;

/** Mirrors getPaletteSpecs() labels from component-reference-data. */
export const WALKTHROUGH_PALETTE = [
  { label: "Text field", desc: "Plain, email, phone, or URL" },
  { label: "Select", desc: "Dropdown single-select" },
  { label: "Choice", desc: "Radio or checkboxes" },
  { label: "Date & time", desc: "Date or time picker" },
] as const;

export const WALKTHROUGH_FORM_FIELDS = [
  { label: "Full name", required: true },
  { label: "Email address", required: true },
  { label: "Ticket type", required: false },
] as const;

export const ANALYTICS_TABS = [
  "Overview",
  "Audience & traffic",
  "Questions",
  "Responses",
] as const;

export const ANALYTICS_METRICS = [
  { label: "Responses (7d)", value: "101" },
  { label: "Unique respondents", value: "101" },
  { label: "Avg completion", value: "100%" },
  { label: "Peak hour", value: "12 PM" },
] as const;

export const TIMELINE_BARS = [12, 8, 15, 10, 6, 18, 24, 14, 9, 20, 16, 22, 11, 7] as const;
