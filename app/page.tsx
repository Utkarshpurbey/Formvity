import type { Metadata } from "next";
import { HomePage } from "../src/components/home/HomePage";
import { JsonLd } from "../src/components/seo/JsonLd";
import { createPageMetadata, faqPageJsonLd, siteConfig, softwareApplicationJsonLd } from "../src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

export default function IndexPage() {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />
      <HomePage />
    </>
  );
}
