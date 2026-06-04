import type {
  FormDef,
  FormPageDef,
  PageComponentDef,
  PageDef,
} from "../components/page-def/builder/pageDef";

function isComponentArray(value: unknown): value is PageComponentDef[] {
  return Array.isArray(value) && value.every((c) => c && typeof c === "object" && typeof (c as PageComponentDef).id === "string");
}

function isFormPageDef(value: unknown): value is FormPageDef {
  if (!value || typeof value !== "object") return false;
  const p = value as FormPageDef;
  return typeof p.id === "string" && typeof p.title === "string" && isComponentArray(p.components);
}

function isLegacyPageDef(value: unknown): value is PageDef {
  if (!value || typeof value !== "object") return false;
  const o = value as PageDef;
  return typeof o.id === "string" && typeof o.title === "string" && isComponentArray(o.components) && !("pages" in o);
}

function isFormDef(value: unknown): value is FormDef {
  if (!value || typeof value !== "object") return false;
  const o = value as FormDef;
  return (
    o.version === 1 &&
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    Array.isArray(o.pages) &&
    o.pages.length > 0 &&
    o.pages.every(isFormPageDef)
  );
}

function legacyToFormDef(legacy: PageDef): FormDef {
  return {
    version: 1,
    id: legacy.id,
    title: legacy.title,
    description: legacy.description,
    formSettings: legacy.formSettings,
    actions: legacy.actions,
    pages: [
      {
        id: legacy.id === "page-1" ? legacy.id : `page-${legacy.id}`,
        title: legacy.title,
        description: legacy.description,
        components: legacy.components,
      },
    ],
    startPageId: undefined,
  };
}

/** Normalize API / legacy JSON into canonical FormDef. */
export function normalizeFormDef(raw: unknown): FormDef | null {
  if (isFormDef(raw)) return raw;
  if (isLegacyPageDef(raw)) return legacyToFormDef(raw);
  return null;
}

export function newPageId(): string {
  return `page-${crypto.randomUUID().slice(0, 8)}`;
}

export function newComponentId(type: string): string {
  return `${type}-${crypto.randomUUID().slice(0, 8)}`;
}

export const EMPTY_FORM_DEF: FormDef = {
  version: 1,
  id: "form-1",
  title: "Untitled form",
  formSettings: {
    appearance: {
      primaryColor: "#4f46e5",
      backgroundColor: "#eef2ff",
      surfaceColor: "#ffffff",
      textColor: "#0f172a",
      borderRadius: "md",
      submitStyle: "solid",
      inputStyle: "outline",
    },
  },
  pages: [{ id: "page-1", title: "Page 1", description: "", components: [] }],
};

export function getStartPageId(formDef: FormDef): string {
  if (formDef.startPageId && formDef.pages.some((p) => p.id === formDef.startPageId)) {
    return formDef.startPageId;
  }
  return formDef.pages[0]!.id;
}

export function getPageIndex(formDef: FormDef, pageId: string): number {
  return formDef.pages.findIndex((p) => p.id === pageId);
}

export function getActivePage(formDef: FormDef, activePageId: string): FormPageDef | null {
  return formDef.pages.find((p) => p.id === activePageId) ?? formDef.pages[0] ?? null;
}

export function duplicatePage(page: FormPageDef): FormPageDef {
  const id = newPageId();
  return {
    id,
    title: `${page.title} (copy)`,
    description: page.description,
    components: page.components.map((c) => ({
      ...c,
      id: newComponentId(String(c.type)),
    })),
  };
}
