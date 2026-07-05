import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Create your account",
  description: "Start free with Formvity. Create forms with templates, publish shareable links, and track responses with built-in analytics.",
  path: "/register",
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
