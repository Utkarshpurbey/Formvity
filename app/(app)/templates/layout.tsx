import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "../../../src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Form templates",
  description:
    "Browse free form templates for HR, sales, events, healthcare, education, and more. Start from a template and publish in minutes.",
  path: "/templates",
});

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return children;
}
