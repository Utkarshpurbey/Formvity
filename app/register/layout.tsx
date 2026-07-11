import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "../../src/components/seo/JsonLd";
import { createPageMetadata, marketingPageJsonLd } from "../../src/lib/seo";

const REGISTER_DESCRIPTION =
  "Start free with Formvity. Create forms with templates, publish shareable links, and track responses with built-in analytics.";

export const metadata: Metadata = createPageMetadata({
  title: "Create your account",
  description: REGISTER_DESCRIPTION,
  path: "/register",
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={marketingPageJsonLd({
          title: "Create your account",
          description: REGISTER_DESCRIPTION,
          path: "/register",
        })}
      />
      {children}
    </>
  );
}
