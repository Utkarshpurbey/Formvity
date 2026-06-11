import type { FormDef, PageComponentType } from "../components/page-def/builder/pageDef";
import type { PageDef as TemplatePageDef } from "./page-def";
import { getTemplateCatalogEntry } from "./templates";

const COMPONENT_TYPE_MAP: Record<string, PageComponentType> = {
  TextAnswerInput: "text",
  NumberAnswerInput: "number",
  EmailAnswerInput: "email",
  PhoneAnswerInput: "phone",
  DescriptionAnswerInput: "textarea",
  SelectAnswerInput: "select",
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
      appearance:
        getTemplateCatalogEntry(template.id)?.appearance ?? {
          primaryColor: "#4f46e5",
          backgroundColor: "#eef2ff",
          surfaceColor: "#ffffff",
          textColor: "#0f172a",
          borderRadius: "md",
          submitStyle: "solid",
          inputStyle: "outline",
        },
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
