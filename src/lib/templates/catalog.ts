import { TEMPLATE_CATALOG_DETAILS } from "./catalog-details";
import { TEMPLATE_DEFINITIONS } from "./definitions";
import type { TemplateCatalogEntry, TemplateCategory } from "./types";

function buildCatalog(): TemplateCatalogEntry[] {
  return TEMPLATE_CATALOG_DETAILS.map((meta) => {
    const pageDef = TEMPLATE_DEFINITIONS[meta.key];
    if (!pageDef) {
      throw new Error(`Missing template definition for key: ${meta.key}`);
    }
    return { ...meta, pageDef };
  });
}

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = buildCatalog();

export const TEMPLATE_CATALOG_BY_KEY: Record<string, TemplateCatalogEntry> = Object.fromEntries(
  TEMPLATE_CATALOG.map((entry) => [entry.key, entry]),
);

export const PAGE_DEF_TEMPLATES = Object.fromEntries(
  TEMPLATE_CATALOG.map((entry) => [entry.key, entry.pageDef]),
);

export function getTemplateCatalogEntry(key: string): TemplateCatalogEntry | undefined {
  return TEMPLATE_CATALOG_BY_KEY[key];
}

export function getTemplatesByCategory(category: TemplateCategory | "all"): TemplateCatalogEntry[] {
  if (category === "all") return TEMPLATE_CATALOG;
  return TEMPLATE_CATALOG.filter((entry) => entry.category === category);
}
