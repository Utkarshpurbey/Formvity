import type { FormDef } from "../components/page-def/builder/pageDef";
import { resolveRespondentIntake } from "./respondentIntake";

export function buildFieldLabelMap(formDef: FormDef | null | undefined): Record<string, string> {
  if (!formDef) return {};

  const labels: Record<string, string> = {};

  for (const page of formDef.pages) {
    for (const comp of page.components) {
      const label = typeof comp.label === "string" ? comp.label.trim() : "";
      if (label) labels[comp.id] = label;
    }
  }

  for (const field of resolveRespondentIntake(formDef).fields) {
    const label = field.label?.trim();
    if (label) labels[field.id] = label;
  }

  return labels;
}
