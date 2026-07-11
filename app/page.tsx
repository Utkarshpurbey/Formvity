import type { Metadata } from "next";
import { HomePage } from "../src/components/home/HomePage";
import { FAQ_ITEMS } from "../src/components/home/homeData";
import { JsonLd } from "../src/components/seo/JsonLd";
import {
  createPageMetadata,
  faqPageJsonLd,
  siteConfig,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from "../src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

export default function IndexPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: siteConfig.title,
            description: siteConfig.description,
            path: "/",
          }),
          softwareApplicationJsonLd(),
          faqPageJsonLd(FAQ_ITEMS),
        ]}
      />
      <HomePage />
    </>
  );
}
