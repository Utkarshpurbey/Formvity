import type { Metadata } from "next";

/** Canonical marketing site URL — set NEXT_PUBLIC_APP_URL in production. */
export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL ?? "").trim().replace(/\/+$/, "");
  if (!raw) return "https://formvity.in";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

export const siteConfig = {
  name: "Formvity",
  title: "Formvity — Form Builder with Analytics Built In",
  shortTitle: "Formvity",
  description:
    "Formvity is a modern form builder for teams. Create multi-page forms with a visual editor, publish shareable links, and analyze responses with built-in analytics — no code required.",
  tagline: "Build forms. Understand every response.",
  keywords: [
    "Formvity",
    "form builder",
    "online form builder",
    "form analytics",
    "survey builder",
    "multi-page forms",
    "form templates",
    "free form builder",
    "form creator",
    "response analytics",
  ],
  locale: "en_US",
  creator: "Formvity",
} as const;

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (path === "/" || path === "") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

/** Shared metadata fields for public marketing/auth pages. */
export function createPageMetadata(input: PageMetaInput = {}): Metadata {
  const title = input.title ?? siteConfig.title;
  const description = input.description ?? siteConfig.description;
  const canonicalPath = input.path ?? "/";
  const url = absoluteUrl(canonicalPath);
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

  return {
    title,
    description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.creator, url: getSiteUrl() }],
    creator: siteConfig.creator,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    ...(googleVerification
      ? {
          verification: {
            google: googleVerification,
          },
        }
      : {}),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
    inLanguage: "en-US",
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: getSiteUrl(),
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
