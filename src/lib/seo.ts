import type { Metadata } from "next";
import { TEMPLATE_CATALOG } from "./templates";

const DEFAULT_SITE_URL = "https://formvity.in";
const OG_IMAGE_PATH = "/opengraph-image";
const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

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

export function defaultOgImageUrl(): string {
  return absoluteUrl(OG_IMAGE_PATH);
}

type PageMetaInput = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImagePath?: string;
};

/** Shared metadata fields for public marketing/auth pages. */
export function createPageMetadata(input: PageMetaInput = {}): Metadata {
  const title = input.title ?? siteConfig.title;
  const description = input.description ?? siteConfig.description;
  const canonicalPath = input.path ?? "/";
  const url = absoluteUrl(canonicalPath);
  const ogImage = absoluteUrl(input.ogImagePath ?? OG_IMAGE_PATH);
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

  const isPublic = !input.noIndex;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.creator, url: getSiteUrl() }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    metadataBase: new URL(getSiteUrl()),
    ...(isPublic
      ? {
          alternates: {
            canonical: url,
          },
        }
      : {}),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      ...(isPublic ? { url } : {}),
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: isPublic
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : { index: false, follow: false },
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
    title,
    robots: { index: false, follow: false },
  };
}

export type FaqItem = { q: string; a: string };
export type BreadcrumbItem = { name: string; path: string };

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: absoluteUrl("/icon"),
    description: siteConfig.description,
    areaServed: "IN",
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
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
    potentialAction: {
      "@type": "RegisterAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/register"),
      },
      name: "Create a free Formvity account",
    },
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

export function faqPageJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function webPageJsonLd(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
  };
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function marketingPageJsonLd(input: { title: string; description: string; path: string }) {
  return [
    webPageJsonLd({ name: input.title, description: input.description, path: input.path }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: input.title, path: input.path },
    ]),
  ];
}

export function templateCollectionJsonLd() {
  const description = `Browse ${TEMPLATE_CATALOG.length} free form templates for HR, sales, events, healthcare, education, and more.`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Form templates",
    description,
    url: absoluteUrl("/templates"),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TEMPLATE_CATALOG.length,
      itemListElement: TEMPLATE_CATALOG.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.pageDef.title,
        description: entry.longDescription,
        url: absoluteUrl("/templates"),
      })),
    },
  };
}
