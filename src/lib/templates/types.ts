import type { FormAppearanceSettings } from "../../components/page-def/builder/pageDef";
import type { PageDef } from "../page-def";

export type TemplateCategory =
  | "hr"
  | "support"
  | "events"
  | "healthcare"
  | "sales"
  | "product"
  | "education"
  | "hospitality"
  | "general"
  | "operations";

export type TemplatePreviewTheme = {
  gradientStart: string;
  gradientEnd: string;
  badge: string;
  cta: string;
  fieldRows: [number, number, number];
};

export type TemplateCatalogMeta = {
  key: string;
  category: TemplateCategory;
  categoryLabel: string;
  tags: string[];
  useCases: string[];
  idealFor: string[];
  workflow: string[];
  integrations: string[];
  longDescription: string;
  estimatedMinutes: number;
  highlights: string[];
  preview: TemplatePreviewTheme;
  appearance: FormAppearanceSettings;
};

export type TemplateCatalogEntry = TemplateCatalogMeta & {
  pageDef: PageDef;
};

export const TEMPLATE_CATEGORY_ORDER: TemplateCategory[] = [
  "general",
  "hr",
  "sales",
  "events",
  "support",
  "operations",
  "healthcare",
  "product",
  "education",
  "hospitality",
];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  general: "General",
  hr: "HR & hiring",
  sales: "Sales & marketing",
  events: "Events",
  support: "Customer support",
  operations: "Operations & IT",
  healthcare: "Healthcare",
  product: "Product feedback",
  education: "Education",
  hospitality: "Hospitality",
};
