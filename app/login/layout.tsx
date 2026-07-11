import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "../../src/components/seo/JsonLd";
import { createPageMetadata, marketingPageJsonLd } from "../../src/lib/seo";

const LOGIN_DESCRIPTION = "Sign in to your Formvity workspace to build, publish, and analyze forms.";

export const metadata: Metadata = createPageMetadata({
  title: "Sign in",
  description: LOGIN_DESCRIPTION,
  path: "/login",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={marketingPageJsonLd({
          title: "Sign in",
          description: LOGIN_DESCRIPTION,
          path: "/login",
        })}
      />
      {children}
    </>
  );
}
