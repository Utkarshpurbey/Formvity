import type { PageComponentDef } from "../page-def";
import type { FormAppearanceSettings } from "../../components/page-def/builder/pageDef";

const FIELD_TYPE_LABELS: Record<string, string> = {
  TextAnswerInput: "Text",
  EmailAnswerInput: "Email",
  PhoneAnswerInput: "Phone",
  NumberAnswerInput: "Number",
  DescriptionAnswerInput: "Long text",
  SelectAnswerInput: "Dropdown",
  text: "Text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  textarea: "Long text",
  select: "Dropdown",
};

const APPEARANCE_LABELS: Record<string, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  solid: "Solid button",
  soft: "Soft button",
  outline: "Outline button",
  filled: "Filled inputs",
  outline_inputs: "Outline inputs",
};

export type TemplateFieldStats = {
  total: number;
  required: number;
  optional: number;
  byType: { type: string; label: string; count: number }[];
  fields: { id: string; label: string; type: string; typeLabel: string; required: boolean }[];
};

export function getFieldTypeLabel(type: string): string {
  return FIELD_TYPE_LABELS[type] ?? type;
}

export function getTemplateFieldStats(components: PageComponentDef[]): TemplateFieldStats {
  const typeCounts = new Map<string, number>();

  const fields = components.map((component) => {
    const type = String(component.type);
    const typeLabel = getFieldTypeLabel(type);
    typeCounts.set(typeLabel, (typeCounts.get(typeLabel) ?? 0) + 1);
    return {
      id: component.id,
      label: typeof component.label === "string" ? component.label : component.id,
      type,
      typeLabel,
      required: Boolean(component.required),
    };
  });

  const required = fields.filter((f) => f.required).length;

  return {
    total: fields.length,
    required,
    optional: fields.length - required,
    byType: Array.from(typeCounts.entries())
      .map(([label, count]) => ({ type: label, label, count }))
      .sort((a, b) => b.count - a.count),
    fields,
  };
}

export function formatAppearanceSummary(appearance: FormAppearanceSettings): string[] {
  const radius = appearance.borderRadius ?? "md";
  const submit = appearance.submitStyle ?? "solid";
  const input = appearance.inputStyle ?? "outline";
  return [
    `Primary ${appearance.primaryColor}`,
    `Background ${appearance.backgroundColor}`,
    `${APPEARANCE_LABELS[radius] ?? radius} corners`,
    APPEARANCE_LABELS[submit] ?? submit,
    APPEARANCE_LABELS[input] ?? input,
  ];
}
