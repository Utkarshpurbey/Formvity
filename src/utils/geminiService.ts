import type { FormDef } from "../components/page-def/builder/pageDef";
import { normalizeToFormDef } from "./jsonFormValidator";

export interface GenerateFormResult {
  formDef: FormDef;
  rawJson: unknown;
  prompt: string;
}

export async function generateFormFromPrompt(
  prompt: string,
  options?: { apiKey?: string; defaultTitle?: string }
): Promise<GenerateFormResult> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Please enter a description for the form you want to generate.");
  }

  const response = await fetch("/api/ai/generate-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: trimmedPrompt,
      apiKey: options?.apiKey || undefined,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Failed to generate form (Status ${response.status})`);
  }

  const normalizedFormDef = normalizeToFormDef(data.rawJson, options?.defaultTitle || "AI Form");

  return {
    formDef: normalizedFormDef,
    rawJson: data.rawJson,
    prompt: trimmedPrompt,
  };
}
