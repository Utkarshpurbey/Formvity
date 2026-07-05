/** Default measurement ID used when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-H5233755B3";

export type GAEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function canTrack(): boolean {
  return Boolean(GA_MEASUREMENT_ID) && typeof window !== "undefined" && typeof window.gtag === "function";
}

/** Push a GA4 custom event with optional parameters. */
export function trackEvent(eventName: string, params?: GAEventParams): void {
  if (!canTrack()) return;
  window.gtag!("event", eventName, params);
}

/** Record a client-side navigation as a page view (App Router). */
export function trackPageView(pagePath: string): void {
  if (!canTrack()) return;
  window.gtag!("config", GA_MEASUREMENT_ID, {
    page_path: pagePath,
  });
}
