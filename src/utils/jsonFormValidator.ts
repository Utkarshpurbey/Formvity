import type { FormDef, FormPageDef, PageComponentDef, PageComponentType } from "../components/page-def/builder/pageDef";

const VALID_COMPONENT_TYPES: Set<PageComponentType> = new Set([
  "text",
  "number",
  "email",
  "phone",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "date",
  "time",
  "multiselect",
  "url",
  "rating",
  "scale",
  "section",
  "file",
  "signature",
]);

const TYPE_MAPPINGS: Record<string, PageComponentType> = {
  string: "text",
  input: "text",
  textbox: "text",
  paragraph: "textarea",
  description: "textarea",
  multiline: "textarea",
  longtext: "textarea",
  dropdown: "select",
  choice: "select",
  radiogroup: "radio",
  checkboxes: "checkbox",
  boolean: "checkbox",
  tel: "phone",
  telephone: "phone",
  mobile: "phone",
  integer: "number",
  float: "number",
  star: "rating",
  stars: "rating",
  link: "url",
  website: "url",
  upload: "file",
  attachment: "file",
};

export function normalizeComponentType(type: unknown): PageComponentType {
  if (typeof type !== "string") return "text";
  const lower = type.toLowerCase().trim();
  if (VALID_COMPONENT_TYPES.has(lower as PageComponentType)) {
    return lower as PageComponentType;
  }
  if (TYPE_MAPPINGS[lower]) {
    return TYPE_MAPPINGS[lower]!;
  }
  return "text";
}

function sanitizeId(str: string, fallback: string): string {
  if (!str || typeof str !== "string") return fallback;
  const cleaned = str.toLowerCase().replace(/[^a-z0-9_-]/g, "_").replace(/_+/g, "_");
  return cleaned || fallback;
}

export function normalizeField(raw: Record<string, unknown>, index: number): PageComponentDef {
  const rawId = typeof raw.id === "string" ? raw.id : typeof raw.name === "string" ? raw.name : `field_${index + 1}`;
  const id = sanitizeId(rawId, `field_${index + 1}`);
  const label = typeof raw.label === "string" && raw.label.trim() ? raw.label.trim() : typeof raw.title === "string" ? raw.title : `Field ${index + 1}`;
  const type = normalizeComponentType(raw.type || raw.fieldType);

  const component: PageComponentDef = {
    id,
    type,
    label,
  };

  if (typeof raw.required === "boolean") {
    component.required = raw.required;
  } else if (typeof raw.required === "string") {
    component.required = raw.required.toLowerCase() === "true";
  }

  if (typeof raw.placeholder === "string" && raw.placeholder.trim()) {
    component.placeholder = raw.placeholder.trim();
  }

  if (typeof raw.helperText === "string" && raw.helperText.trim()) {
    component.helperText = raw.helperText.trim();
  } else if (typeof raw.description === "string" && raw.description.trim()) {
    component.helperText = raw.description.trim();
  }

  if (Array.isArray(raw.options)) {
    component.options = raw.options.map((opt) => {
      if (typeof opt === "string") return opt.trim();
      if (opt && typeof opt === "object" && "label" in opt) return String(opt.label).trim();
      if (opt && typeof opt === "object" && "value" in opt) return String(opt.value).trim();
      return String(opt);
    }).filter(Boolean);
  }

  if (type === "number" || type === "rating" || type === "scale") {
    if (typeof raw.min === "number") component.min = raw.min;
    if (typeof raw.max === "number") component.max = raw.max;
    if (typeof raw.step === "number") component.step = raw.step;
  }

  return component;
}

export function normalizeToFormDef(inputJson: unknown, defaultTitle = "AI Generated Form"): FormDef {
  if (!inputJson || typeof inputJson !== "object") {
    throw new Error("Invalid JSON input: Root must be an object.");
  }

  const raw = inputJson as Record<string, unknown>;

  const title = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : defaultTitle;
  const description = typeof raw.description === "string" ? raw.description.trim() : undefined;
  const id = sanitizeId(title, `ai_form_${Date.now()}`);

  let pages: FormPageDef[] = [];

  if (Array.isArray(raw.pages) && raw.pages.length > 0) {
    pages = raw.pages.map((p, pIndex) => {
      const pageObj = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
      const pageId = sanitizeId(typeof pageObj.id === "string" ? pageObj.id : `page-${pIndex + 1}`, `page-${pIndex + 1}`);
      const pageTitle = typeof pageObj.title === "string" && pageObj.title.trim() ? pageObj.title.trim() : `Page ${pIndex + 1}`;
      const pageDesc = typeof pageObj.description === "string" ? pageObj.description.trim() : undefined;

      const rawComponents = Array.isArray(pageObj.components)
        ? pageObj.components
        : Array.isArray(pageObj.fields)
        ? pageObj.fields
        : [];

      const components = rawComponents.map((c, cIndex) =>
        normalizeField((c && typeof c === "object" ? c : {}) as Record<string, unknown>, cIndex)
      );

      return {
        id: pageId,
        title: pageTitle,
        description: pageDesc,
        components,
      };
    });
  } else if (Array.isArray(raw.fields) || Array.isArray(raw.components)) {
    const rawList = (Array.isArray(raw.fields) ? raw.fields : raw.components) as Record<string, unknown>[];
    const components = rawList.map((c, cIndex) =>
      normalizeField((c && typeof c === "object" ? c : {}) as Record<string, unknown>, cIndex)
    );

    pages = [
      {
        id: "page-1",
        title: title,
        description: description,
        components,
      },
    ];
  } else {
    pages = [
      {
        id: "page-1",
        title: title,
        description: description,
        components: [
          {
            id: "sample_input",
            type: "text",
            label: "Sample Input",
            placeholder: "Enter details",
          },
        ],
      },
    ];
  }

  if (pages.length === 0) {
    pages = [
      {
        id: "page-1",
        title: title,
        description: description,
        components: [],
      },
    ];
  }

  // Parse appearance & styling
  const rawFormSettings = (raw.formSettings && typeof raw.formSettings === "object" ? raw.formSettings : {}) as Record<string, unknown>;
  const rawAppearance = (
    rawFormSettings.appearance && typeof rawFormSettings.appearance === "object"
      ? rawFormSettings.appearance
      : raw.appearance && typeof raw.appearance === "object"
      ? raw.appearance
      : raw.theme && typeof raw.theme === "object"
      ? raw.theme
      : raw.style && typeof raw.style === "object"
      ? raw.style
      : {}
  ) as Record<string, unknown>;

  const primaryColor = typeof rawAppearance.primaryColor === "string" ? rawAppearance.primaryColor : "#6366f1";
  const backgroundColor = typeof rawAppearance.backgroundColor === "string" ? rawAppearance.backgroundColor : "#f8fafc";
  const surfaceColor = typeof rawAppearance.surfaceColor === "string" ? rawAppearance.surfaceColor : "#ffffff";
  const textColor = typeof rawAppearance.textColor === "string" ? rawAppearance.textColor : "#0f172a";
  const borderRadius = (["sm", "md", "lg"].includes(String(rawAppearance.borderRadius)) ? String(rawAppearance.borderRadius) : "md") as "sm" | "md" | "lg";
  const submitStyle = (["solid", "soft", "outline"].includes(String(rawAppearance.submitStyle)) ? String(rawAppearance.submitStyle) : "solid") as "solid" | "soft" | "outline";
  const inputStyle = (["outline", "filled"].includes(String(rawAppearance.inputStyle)) ? String(rawAppearance.inputStyle) : "outline") as "outline" | "filled";

  const formDef: FormDef = {
    version: 1,
    id,
    title,
    description,
    formSettings: {
      appearance: {
        primaryColor,
        backgroundColor,
        surfaceColor,
        textColor,
        borderRadius,
        submitStyle,
        inputStyle,
      },
    },
    pages,
  };

  return formDef;
}

export function validateFormDefJson(jsonString: string): { valid: boolean; formDef?: FormDef; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const formDef = normalizeToFormDef(parsed);
    return { valid: true, formDef };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "Invalid JSON format" };
  }
}
