import type {
  FormAppearanceSettings,
  FormDef,
  PageComponentType,
} from "../components/page-def/builder/pageDef";
import type { PageDef as TemplatePageDef } from "./page-def";

const COMPONENT_TYPE_MAP: Record<string, PageComponentType> = {
  TextAnswerInput: "text",
  NumberAnswerInput: "number",
  EmailAnswerInput: "email",
  PhoneAnswerInput: "phone",
  DescriptionAnswerInput: "textarea",
  SelectAnswerInput: "select",
};

const DEFAULT_TEMPLATE_APPEARANCE: FormAppearanceSettings = {
  primaryColor: "#4f46e5",
  backgroundColor: "#eef2ff",
  surfaceColor: "#ffffff",
  textColor: "#0f172a",
  borderRadius: "md",
  submitStyle: "solid",
  inputStyle: "outline",
};

const TEMPLATE_FORM_APPEARANCE: Record<string, FormAppearanceSettings> = {
  "job-application": {
    primaryColor: "#4f46e5",
    backgroundColor: "#eef2ff",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "md",
    submitStyle: "solid",
    inputStyle: "outline",
  },
  "customer-support-request": {
    primaryColor: "#0d9488",
    backgroundColor: "#ecfdf5",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "lg",
    submitStyle: "soft",
    inputStyle: "filled",
  },
  "event-registration": {
    primaryColor: "#7c3aed",
    backgroundColor: "#f5f3ff",
    surfaceColor: "#ffffff",
    textColor: "#1e1b4b",
    borderRadius: "lg",
    submitStyle: "solid",
    inputStyle: "outline",
  },
  "patient-intake": {
    primaryColor: "#0f766e",
    backgroundColor: "#ecfdf5",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "md",
    submitStyle: "soft",
    inputStyle: "filled",
  },
  "lead-capture": {
    primaryColor: "#b45309",
    backgroundColor: "#fffbeb",
    surfaceColor: "#ffffff",
    textColor: "#1c1917",
    borderRadius: "md",
    submitStyle: "outline",
    inputStyle: "outline",
  },
};

export const cloneTemplatePageDef = (template: TemplatePageDef): TemplatePageDef =>
  JSON.parse(JSON.stringify(template)) as TemplatePageDef;

export const toBuilderFormDef = (template: TemplatePageDef): FormDef => {
  const components = template.components.map((component) => {
    const mappedType = COMPONENT_TYPE_MAP[String(component.type)];
    if (!mappedType) {
      return {
        ...component,
        type: "text" as PageComponentType,
      };
    }
    return {
      ...component,
      type: mappedType,
    };
  });

  return {
    version: 1,
    id: template.id,
    title: template.title,
    description: template.description,
    actions: template.actions,
    formSettings: {
      appearance: TEMPLATE_FORM_APPEARANCE[template.id] ?? DEFAULT_TEMPLATE_APPEARANCE,
    },
    pages: [
      {
        id: "page-1",
        title: template.title,
        description: template.description,
        components,
      },
    ],
  };
};
