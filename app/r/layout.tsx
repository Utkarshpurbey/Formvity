import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPrivateRouteMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPrivateRouteMetadata("Public Form");

export default function PublicFormLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col">{children}</div>;
}
