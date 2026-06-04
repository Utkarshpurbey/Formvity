import type { FormDef, FormPageDef, PageComponentDef } from "../components/page-def/builder/pageDef";

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
const validateUrl = (url: string) => {
  if (!url.trim()) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function validatePageComponents(
  components: PageComponentDef[],
  values: Record<string, string>,
): Record<string, string> {
  const errs: Record<string, string> = {};
  components.forEach((comp) => {
    const val = values[comp.id] ?? "";
    const required = comp.required === true;
    if (required) {
      if (comp.type === "checkbox") {
        if (val !== "true") errs[comp.id] = "This field is required";
      } else if (comp.type === "multiselect") {
        if (!val.trim() || val.split(",").every((s) => !s.trim())) errs[comp.id] = "Select at least one option";
      } else if (!val.trim()) {
        errs[comp.id] = "This field is required";
      }
    }
    if (comp.type === "email" && val && !validateEmail(val)) errs[comp.id] = "Invalid email address";
    if (comp.type === "phone" && val && !validatePhone(val)) errs[comp.id] = "Invalid phone number";
    if (comp.type === "url" && val && !validateUrl(val)) errs[comp.id] = "Please enter a valid URL";
  });
  return errs;
}

export function allFormComponents(formDef: FormDef): PageComponentDef[] {
  return formDef.pages.flatMap((p) => p.components);
}

export function validateFormDef(formDef: FormDef, values: Record<string, string>): Record<string, string> {
  const errs: Record<string, string> = {};
  formDef.pages.forEach((page) => {
    Object.assign(errs, validatePageComponents(page.components, values));
  });
  return errs;
}

export function getNextPageId(formDef: FormDef, currentPageId: string): string | null {
  const page = formDef.pages.find((p) => p.id === currentPageId);
  if (page?.navigation?.defaultNextPageId) {
    const target = page.navigation.defaultNextPageId;
    if (formDef.pages.some((p) => p.id === target)) return target;
  }
  const idx = formDef.pages.findIndex((p) => p.id === currentPageId);
  if (idx < 0 || idx >= formDef.pages.length - 1) return null;
  return formDef.pages[idx + 1]!.id;
}

export function getPrevPageId(formDef: FormDef, currentPageId: string): string | null {
  const idx = formDef.pages.findIndex((p) => p.id === currentPageId);
  if (idx <= 0) return null;
  return formDef.pages[idx - 1]!.id;
}

export type { FormPageDef };
