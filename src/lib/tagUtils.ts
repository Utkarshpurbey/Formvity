/** Curated preset swatches for tag creation */
export const TAG_COLOR_PRESETS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Emerald / Green
  "#F59E0B", // Amber / Yellow
  "#8B5CF6", // Violet / Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#64748B", // Slate / Gray
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
] as const;

/** Helper to convert hex to RGB object */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

/** Compute WCAG relative luminance to determine light or dark text */
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/** Returns inline style object for tag badge pills with background tint, border, and text color */
export function getTagBadgeStyle(hexCode: string): React.CSSProperties {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    color: "#4338ca",
  };

  if (!hexCode) return defaultStyle;

  const rgb = hexToRgb(hexCode);
  if (!rgb) return defaultStyle;

  const { r, g, b } = rgb;
  const luminance = getLuminance(r, g, b);

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.14)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
    color: luminance > 0.4 ? `rgb(${Math.max(0, r - 100)}, ${Math.max(0, g - 100)}, ${Math.max(0, b - 100)})` : `rgb(${r}, ${g}, ${b})`,
  };
}
