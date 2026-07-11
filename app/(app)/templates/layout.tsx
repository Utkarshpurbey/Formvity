import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "../../../src/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  templateCollectionJsonLd,
  webPageJsonLd,
} from "../../../src/lib/seo";
import { TEMPLATE_CATALOG } from "../../../src/lib/templates";

const TEMPLATES_DESCRIPTION = `Browse ${TEMPLATE_CATALOG.length} free form templates for HR, sales, events, healthcare, education, and more. Start from a template and publish in minutes.`;

export const metadata: Metadata = createPageMetadata({
  title: "Form templates",
  description: TEMPLATES_DESCRIPTION,
  path: "/templates",
});

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: "Form templates",
            description: TEMPLATES_DESCRIPTION,
            path: "/templates",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Templates", path: "/templates" },
          ]),
          templateCollectionJsonLd(),
        ]}
      />
      {children}
    </>
  );
}
