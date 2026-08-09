import { NextResponse } from "next/server";
import { generateSmartFallbackForm } from "@/src/utils/smartFormGenerator";

const GEMINI_PROMPT_SYSTEM = `You are Formvity AI, a world-class form designer and builder expert.
Your task is to take a user's plain English description of a form or style update and generate a complete, valid JSON structure for Formvity.

Output ONLY raw valid JSON. Do not include markdown code block syntax (like \`\`\`json), explanations, or surrounding text.

JSON Schema format:
{
  "title": "Title of the form",
  "description": "Subheading or purpose of the form",
  "formSettings": {
    "appearance": {
      "primaryColor": "#hex",
      "backgroundColor": "#hex",
      "surfaceColor": "#hex",
      "textColor": "#hex",
      "borderRadius": "sm" | "md" | "lg",
      "submitStyle": "solid" | "soft" | "outline",
      "inputStyle": "outline" | "filled"
    }
  },
  "pages": [
    {
      "id": "page-1",
      "title": "Page 1 Title",
      "description": "Optional page subtitle",
      "components": [
        {
          "id": "field_id_slug",
          "type": "text|email|number|phone|textarea|select|checkbox|radio|date|time|multiselect|url|rating|scale|file",
          "label": "Human readable field label",
          "required": true or false,
          "placeholder": "Helpful placeholder text",
          "helperText": "Optional guidance",
          "options": ["Choice A", "Choice B"]
        }
      ]
    }
  ]
}

Rules for generation:
1. Choose appropriate field types (text, email, phone, number, textarea, rating, select, radio, checkbox, date, etc.).
2. Generate descriptive, professional labels and placeholders.
3. For choice fields (select, radio, checkbox, multiselect), include realistic options array.
4. Group fields logically. Multi-step forms can have multiple objects in the pages array.
5. Set required fields appropriately.
6. THEMING & STYLING INSTRUCTIONS:
   When the user asks to change or update styles, themes, or colors (e.g. "trendy", "dark mode", "pink theme", "neon", "minimalist", "vibrant", "pastel", "warm sunset", "cyberpunk", "aesthetic", "purple"), MUST customize \`formSettings.appearance\`:
   - "trendy" / "aesthetic" / "chic": primaryColor "#ec4899" (vibrant fuchsia/pink), backgroundColor "#fdf2f8", surfaceColor "#ffffff", textColor "#0f172a", borderRadius "lg", submitStyle "solid"
   - "dark mode" / "dark": primaryColor "#818cf8", backgroundColor "#0f172a", surfaceColor "#1e293b", textColor "#f8fafc", borderRadius "md", submitStyle "solid"
   - "pink" / "rose" / "barbie": primaryColor "#f43f5e", backgroundColor "#fff1f2", surfaceColor "#ffffff", textColor "#881337", borderRadius "lg"
   - "emerald" / "green" / "nature": primaryColor "#10b981", backgroundColor "#ecfdf5", surfaceColor "#ffffff", textColor "#064e3b"
   - "warm" / "sunset" / "amber": primaryColor "#f59e0b", backgroundColor "#fffbeb", surfaceColor "#ffffff", textColor "#78350f"
   - "violet" / "purple" / "indigo": primaryColor "#8b5cf6", backgroundColor "#f5f3ff", surfaceColor "#ffffff", textColor "#4c1d95"
   Keep all existing form components intact unless the user explicitly requests to add, remove, or modify fields.
`;

const MODELS_TO_TRY = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-3.6-flash", "gemini-flash-latest"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const userApiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let rawText = "";

    if (apiKey) {
      for (const modelName of MODELS_TO_TRY) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        try {
          const response = await fetch(geminiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${GEMINI_PROMPT_SYSTEM}\n\nUser request: "${prompt}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                responseMimeType: "application/json",
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (rawText) break;
          }
        } catch (e) {
          console.warn(`Error calling Gemini model ${modelName}:`, e);
        }
      }
    }

    if (rawText) {
      try {
        let jsonStr = rawText.trim();
        if (jsonStr.startsWith("```json")) jsonStr = jsonStr.substring(7);
        if (jsonStr.startsWith("```")) jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith("```")) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        jsonStr = jsonStr.trim();

        const parsedJson = JSON.parse(jsonStr);
        return NextResponse.json({
          success: true,
          rawJson: parsedJson,
          prompt,
          source: "gemini",
        });
      } catch {
        console.warn("Failed to parse Gemini output, falling back to Smart AI engine.");
      }
    }

    // Fallback: Formvity Smart Engine
    const fallbackFormDef = generateSmartFallbackForm(prompt);
    return NextResponse.json({
      success: true,
      rawJson: fallbackFormDef,
      prompt,
      source: "smart_engine",
      note: "Generated using Formvity Smart AI Engine",
    });
  } catch (err: unknown) {
    console.error("AI form generation endpoint error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate form from prompt." },
      { status: 500 }
    );
  }
}
