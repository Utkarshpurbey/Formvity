/**
 * JSON shape for the visual builder and JSON editor.
 * Distinct from `lib/page-def`, which is the template / marketing schema.
 */
export type PageComponentType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "time"
  | "multiselect"
  | "url"
  | "rating"
  | "scale"
  | "section"
  | "file"
  | "signature";

export interface PageComponentDef {
  id: string;
  type: PageComponentType;
  [prop: string]: unknown;
}

export interface FormAppearanceSettings {
  primaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  borderRadius?: "sm" | "md" | "lg";
  submitStyle?: "solid" | "soft" | "outline";
  inputStyle?: "outline" | "filled";
}

export type RespondentFieldType = "text" | "email" | "phone" | "number";

export interface RespondentIntakeField {
  id: string;
  type: RespondentFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface RespondentIntakeSettings {
  title?: string;
  description?: string;
  fields: RespondentIntakeField[];
}

export interface FormSettings {
  appearance?: FormAppearanceSettings;
  respondentIntake?: RespondentIntakeSettings;
}

/** One step in a multi-page form. */
export interface FormPageDef {
  id: string;
  title: string;
  description?: string;
  components: PageComponentDef[];
  /** Reserved for branching; linear v1 uses array order for Next. */
  navigation?: {
    defaultNextPageId?: string;
  };
}

/** Root document stored in draftPageDef / published snapshot. */
export interface FormDef {
  version: 1;
  id: string;
  title: string;
  description?: string;
  formSettings?: FormSettings;
  /** Key = actionId, value = JS function body (receives `ctx`). */
  actions?: Record<string, string>;
  pages: FormPageDef[];
  /** Respondent entry; defaults to first page. */
  startPageId?: string;
}

/**
 * Legacy single-page document (components at root).
 * Normalized to FormDef via normalizeFormDef on load.
 */
export interface PageDef {
  id: string;
  title: string;
  description?: string;
  components: PageComponentDef[];
  formSettings?: FormSettings;
  actions?: Record<string, string>;
}

/** Anything with form-level appearance for theming helpers. */
export type FormAppearanceSource = Pick<FormDef, "formSettings">;
