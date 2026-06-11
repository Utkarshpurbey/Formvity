import type { TemplatePreviewTheme } from "./types";

const PREVIEW_SVG_W = 600;
const PREVIEW_SVG_H = 220;

const escapeSvgText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function getTemplatePreviewImage(_title: string, theme: TemplatePreviewTheme): string {
  const safeCta = escapeSvgText(theme.cta);

  const cardX = 44;
  const cardY = 28;
  const cardW = 512;
  const cardH = 172;
  const pad = 24;
  const innerLeft = cardX + pad;
  const innerTop = cardY + 16;
  const innerW = cardW - pad * 2;
  const titleBarW = Math.min(280, innerW);
  const row1 = Math.min(theme.fieldRows[0], innerW);
  const row2 = Math.min(theme.fieldRows[1], innerW);
  const row3 = Math.min(theme.fieldRows[2], innerW);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${PREVIEW_SVG_W}" height="${PREVIEW_SVG_H}" viewBox="0 0 ${PREVIEW_SVG_W} ${PREVIEW_SVG_H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.gradientStart}" />
      <stop offset="100%" stop-color="${theme.gradientEnd}" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="${PREVIEW_SVG_W}" height="${PREVIEW_SVG_H}" fill="url(#bg)" rx="18" />
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="16" fill="rgba(255,255,255,0.97)" filter="url(#shadow)" />
  <rect x="${innerLeft}" y="${innerTop}" width="${titleBarW}" height="11" rx="5.5" fill="#cbd5e1" />
  <rect x="${innerLeft}" y="${innerTop + 22}" width="${row1}" height="10" rx="5" fill="#e2e8f0" />
  <rect x="${innerLeft}" y="${innerTop + 40}" width="${row2}" height="10" rx="5" fill="#e2e8f0" />
  <rect x="${innerLeft}" y="${innerTop + 58}" width="${row3}" height="10" rx="5" fill="#e2e8f0" />
  <rect x="${innerLeft}" y="${innerTop + 80}" width="168" height="28" rx="10" fill="${theme.gradientStart}" />
  <text x="${innerLeft + 14}" y="${innerTop + 98}" font-size="11" font-weight="700" font-family="system-ui, Arial, sans-serif" fill="#ffffff">${safeCta}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TEMPLATE_PREVIEW_DIMENSIONS = { width: PREVIEW_SVG_W, height: PREVIEW_SVG_H };
