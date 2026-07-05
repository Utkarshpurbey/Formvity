import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sign in",
  description: "Sign in to your Formvity workspace to build, publish, and analyze forms.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
