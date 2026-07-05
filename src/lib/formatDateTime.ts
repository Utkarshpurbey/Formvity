export function parseApiDateTime(iso: string): Date {
  const trimmed = iso.trim();
  if (!trimmed) return new Date(NaN);

  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y!, m! - 1, d);
  }

  return new Date(`${trimmed}Z`);
}

type LocalFormatStyle = "date" | "datetime" | "short";

export function formatLocalDateTime(
  iso: string | null | undefined,
  style: LocalFormatStyle = "datetime",
): string {
  if (!iso) return "—";
  const date = parseApiDateTime(iso);
  if (Number.isNaN(date.getTime())) return iso;

  if (style === "date") {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
  }

  if (style === "short") {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function utcHourToLocalHour(utcHour: number): number {
  const h = Math.max(0, Math.min(23, Math.round(utcHour)));
  return new Date(Date.UTC(2000, 0, 1, h, 0, 0)).getHours();
}

export function formatUtcHourAsLocal(utcHour: number | null | undefined): string {
  if (utcHour === null || utcHour === undefined || !Number.isFinite(utcHour)) return "—";
  const h = Math.max(0, Math.min(23, Math.round(utcHour)));
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    hour12: true,
  }).format(new Date(Date.UTC(2000, 0, 1, h, 0, 0)));
}

type HourBucket = { key: string; label: string; count: number; percent: number };

export function remapUtcHourBucketsToLocal(byHour: HourBucket[]): HourBucket[] {
  const counts = Array.from({ length: 24 }, () => 0);

  for (const bucket of byHour) {
    const utcHour = Number(bucket.key);
    if (!Number.isFinite(utcHour) || utcHour < 0 || utcHour > 23) continue;
    counts[utcHourToLocalHour(utcHour)] += bucket.count;
  }

  const total = counts.reduce((sum, n) => sum + n, 0);
  return counts.map((count, hour) => ({
    key: String(hour),
    label: String(hour),
    count,
    percent: total > 0 ? (count / total) * 100 : 0,
  }));
}

export function findPeakHourFromBuckets(buckets: HourBucket[]): number | null {
  let best: HourBucket | null = null;
  for (const bucket of buckets) {
    if (!best || bucket.count > best.count) best = bucket;
  }
  return best && best.count > 0 ? Number(best.key) : null;
}
