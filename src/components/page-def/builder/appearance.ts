import type { CSSProperties } from "react";
import type { FormAppearanceSettings, FormAppearanceSource } from "./pageDef";

const FALLBACK_APPEARANCE: Required<FormAppearanceSettings> = {
  primaryColor: "#4f46e5",
  backgroundColor: "#eef2ff",
  surfaceColor: "#ffffff",
  textColor: "#0f172a",
  borderRadius: "md",
  submitStyle: "solid",
  inputStyle: "outline",
};

export function getAppearance(source: FormAppearanceSource): Required<FormAppearanceSettings> {
  return {
    ...FALLBACK_APPEARANCE,
    ...(source.formSettings?.appearance ?? {}),
  };
}

function radiusToCss(appearance: Required<FormAppearanceSettings>): string {
  return appearance.borderRadius === "sm"
    ? "0.5rem"
    : appearance.borderRadius === "lg"
      ? "1.125rem"
      : "0.75rem";
}

/** CSS variables consumed by form shell + `inputStyles` in widgets. */
export function getAppearanceStyles(source: FormAppearanceSource): CSSProperties {
  const appearance = getAppearance(source);
  const radius = radiusToCss(appearance);
  const fieldBg =
    appearance.inputStyle === "filled"
      ? "color-mix(in srgb, var(--fb-text) 5.5%, var(--fb-surface))"
      : "var(--fb-surface)";

  return {
    "--fb-primary": appearance.primaryColor,
    "--fb-bg": appearance.backgroundColor,
    "--fb-surface": appearance.surfaceColor,
    "--fb-text": appearance.textColor,
    "--fb-radius": radius,
    "--fb-field-bg": fieldBg,
    "--fb-input-border": "color-mix(in srgb, var(--fb-text) 12%, var(--fb-surface))",
    "--fb-label": "color-mix(in srgb, var(--fb-text) 78%, var(--fb-surface))",
    "--fb-muted": "color-mix(in srgb, var(--fb-text) 48%, var(--fb-surface))",
    "--fb-ring": "color-mix(in srgb, var(--fb-primary) 30%, transparent)",
    "--fb-input-shadow": "0 1px 2px color-mix(in srgb, var(--fb-text) 6%, transparent)",
  } as CSSProperties;
}

/** Layered shadow + hairline ring so the form reads as a product surface, not a flat card. */
export function getFormCardBoxShadow(source: FormAppearanceSource): string {
  const { textColor, primaryColor } = getAppearance(source);
  return [
    `0 28px 56px -22px color-mix(in srgb, ${textColor} 22%, transparent)`,
    `0 0 0 1px color-mix(in srgb, ${textColor} 7%, transparent)`,
    `0 1px 0 color-mix(in srgb, ${primaryColor} 12%, transparent)`,
  ].join(", ");
}

/** Parent wrapper: tightens focus rings / borders on native controls inside the form. */
export function getInputChromeParentClass(appearance: Required<FormAppearanceSettings>): string {
  const focus =
    "[&_input]:transition-[border-color,box-shadow,background-color] [&_input]:duration-200 " +
    "[&_input]:focus:border-[color:var(--fb-primary)] [&_input]:focus:ring-[3px] [&_input]:focus:ring-[color:var(--fb-ring)] " +
    "[&_textarea]:transition-[border-color,box-shadow,background-color] [&_textarea]:duration-200 " +
    "[&_textarea]:focus:border-[color:var(--fb-primary)] [&_textarea]:focus:ring-[3px] [&_textarea]:focus:ring-[color:var(--fb-ring)] " +
    "[&_select]:transition-[border-color,box-shadow,background-color] [&_select]:duration-200 " +
    "[&_select]:focus:border-[color:var(--fb-primary)] [&_select]:focus:ring-[3px] [&_select]:focus:ring-[color:var(--fb-ring)]";

  const shadow =
    "[&_input]:shadow-[var(--fb-input-shadow)] [&_textarea]:shadow-[var(--fb-input-shadow)] [&_select]:shadow-[var(--fb-input-shadow)]";

  if (appearance.inputStyle === "filled") {
    return `${focus} ${shadow} [&_input]:border-transparent [&_textarea]:border-transparent [&_select]:border-transparent [&_input]:bg-[color:var(--fb-field-bg)] [&_textarea]:bg-[color:var(--fb-field-bg)] [&_select]:bg-[color:var(--fb-field-bg)]`;
  }

  return `${focus} ${shadow} [&_input]:border [&_input]:border-[color:var(--fb-input-border)] [&_textarea]:border [&_textarea]:border-[color:var(--fb-input-border)] [&_select]:border [&_select]:border-[color:var(--fb-input-border)] [&_input]:bg-[color:var(--fb-field-bg)] [&_textarea]:bg-[color:var(--fb-field-bg)] [&_select]:bg-[color:var(--fb-field-bg)]`;
}

export function getSubmitButtonClass(appearance: Required<FormAppearanceSettings>): string {
  const base =
    "inline-flex w-full sm:w-auto min-h-[3rem] items-center justify-center gap-2 rounded-[var(--fb-radius)] px-8 text-[0.9375rem] font-semibold tracking-wide transition-[transform,box-shadow,opacity,background-color,color,border-color] duration-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50";

  if (appearance.submitStyle === "soft") {
    return `${base} bg-[color-mix(in_srgb,var(--fb-primary)_14%,transparent)] text-[color:var(--fb-primary)] shadow-sm hover:bg-[color-mix(in_srgb,var(--fb-primary)_22%,transparent)] hover:shadow-md`;
  }
  if (appearance.submitStyle === "outline") {
    return `${base} border-2 border-[color:var(--fb-primary)] bg-transparent text-[color:var(--fb-primary)] shadow-sm hover:bg-[color-mix(in_srgb,var(--fb-primary)_8%,transparent)] hover:shadow-md`;
  }
  return `${base} border-2 border-transparent bg-[color:var(--fb-primary)] text-white shadow-[0_12px_28px_-8px_color-mix(in_srgb,var(--fb-primary)_55%,transparent)] hover:shadow-[0_16px_34px_-10px_color-mix(in_srgb,var(--fb-primary)_60%,transparent)] hover:brightness-[1.03]`;
}

export const formAccentBarClass =
  "h-1 w-full shrink-0 bg-gradient-to-r from-[color:var(--fb-primary)] via-[color-mix(in_srgb,var(--fb-primary)_70%,white)] to-[color-mix(in_srgb,var(--fb-primary)_40%,white)]";

export const formCardShellClass =
  "relative flex flex-col min-h-0 overflow-hidden rounded-[var(--fb-radius)]";
