import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPrivateRouteMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPrivateRouteMetadata("Invite");

export default function InviteLayout({ children }: { children: ReactNode }) {
  return children;
}
