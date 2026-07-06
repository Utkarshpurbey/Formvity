import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPrivateRouteMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPrivateRouteMetadata("Welcome");

export default function WelcomeLayout({ children }: { children: ReactNode }) {
  return children;
}
