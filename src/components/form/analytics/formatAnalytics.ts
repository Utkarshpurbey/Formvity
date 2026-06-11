const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatPercent(value: number | undefined | null, digits = 0): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatHour(hour: number | null | undefined): string {
  if (hour === null || hour === undefined || !Number.isFinite(hour)) return "—";
  const h = Math.max(0, Math.min(23, Math.round(hour)));
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${period}`;
}

export function formatDayOfWeek(value: string | null | undefined): string {
  if (!value) return "—";
  const upper = value.trim().toUpperCase();
  const byName = DAY_NAMES.find((d) => d.toUpperCase() === upper || d.toUpperCase().startsWith(upper.slice(0, 3)));
  if (byName) return byName;
  const asNum = Number(value);
  if (Number.isFinite(asNum) && asNum >= 0 && asNum <= 6) return DAY_NAMES[asNum]!;
  return value;
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
