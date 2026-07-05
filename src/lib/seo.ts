import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://formvity.in";

function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function isLocalhost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return url.includes("localhost");
  }
}

function isVercelPreview(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".vercel.app");
  } catch {
    return url.includes(".vercel.app");
  }
}

/** Canonical marketing site URL — prefers NEXT_PUBLIC_APP_URL, then Vercel production domain. */
export function getSiteUrl(): string {
  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL ?? "");
  if (configured && !isLocalhost(configured) && !isVercelPreview(configured)) {
    return configured;
  }

  const production = normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "");
  if (production && !isVercelPreview(production)) {
    return production;
  }

  return DEFAULT_SITE_URL;
}

export function getSiteHostname(): string {
  try {
    return new URL(getSiteUrl()).hostname;
  } catch {
    return "formvity.in";
  }
}

export const siteConfig = {
  name: "Formvity",
  title: "Formvity — Free Online Form Builder with Analytics",
  shortTitle: "Formvity",
  description:
    "Formvity is a free online form builder for teams in India and worldwide. Create multi-page forms with a visual editor, publish shareable links, and analyze every response with built-in analytics — no code required.",
  tagline: "Build forms. Understand every response.",
  keywords: [
    "Formvity",
    "formvity.in",
    "form builder",
    "online form builder",
    "free form builder",
    "form builder India",
    "form analytics",
    "survey builder",
    "multi-page forms",
    "form templates",
    "form creator",
    "response analytics",
    "Google Forms alternative",
  ],
  locale: "en_IN",
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
    publisher: siteConfig.creator,
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

/** Metadata for authenticated or utility routes that should not appear in search results. */
export function createPrivateRouteMetadata(title: string): Metadata {
  return {
    ...createPageMetadata({ title, noIndex: true }),
    robots: { index: false, follow: false },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: absoluteUrl("/icon"),
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
    inLanguage: "en-IN",
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
      priceCurrency: "INR",
    },
    featureList: [
      "Visual drag-and-drop form builder",
      "Multi-page forms",
      "Form templates",
      "Publish and share public links",
      "Built-in response analytics",
    ],
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Formvity?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Formvity is a free online form builder with built-in analytics. Teams use it to create multi-page forms, publish shareable links, and analyze responses without writing code.",
        },
      },
      {
        "@type": "Question",
        name: "Is Formvity free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Formvity is free to start. You can create an account, build forms, publish links, and collect responses at no cost.",
        },
      },
      {
        "@type": "Question",
        name: "Does Formvity include form analytics?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every published form includes analytics with response timelines, audience breakdowns, device traffic, question-level distributions, and individual response details.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create multi-page forms on Formvity?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Formvity supports multi-page forms, respondent intake steps, themed appearance, and validation — all from a visual builder.",
        },
      },
    ],
  };
}
