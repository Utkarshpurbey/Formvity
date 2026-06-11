export {
  DEFAULT_PAGE_DEF_TEMPLATE_KEY,
  getDefaultPageDefTemplate,
  getTemplateCatalogEntry,
  getTemplatesByCategory,
  PAGE_DEF_TEMPLATES,
  TEMPLATE_CATALOG,
  TEMPLATE_CATALOG_BY_KEY,
} from "./catalog";

export { TEMPLATE_CATALOG_DETAILS, TEMPLATE_CATALOG_DETAILS_BY_KEY } from "./catalog-details";
export { TEMPLATE_DEFINITIONS } from "./definitions";
export { getTemplatePreviewImage, TEMPLATE_PREVIEW_DIMENSIONS } from "./preview-image";
export {
  formatAppearanceSummary,
  getFieldTypeLabel,
  getTemplateFieldStats,
  getTemplateStats,
} from "./template-utils";

export type {
  TemplateCatalogEntry,
  TemplateCatalogMeta,
  TemplateCategory,
  TemplatePreviewTheme,
} from "./types";

export { TEMPLATE_CATEGORY_LABELS, TEMPLATE_CATEGORY_ORDER } from "./types";
