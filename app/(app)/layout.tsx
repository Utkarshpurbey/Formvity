import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPrivateRouteMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPrivateRouteMetadata("Formvity App");

export default function AppRoutesLayout({ children }: { children: ReactNode }) {
  return children;
}
