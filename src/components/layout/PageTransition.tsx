"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Route transitions only — no enter animation on in-page state changes (e.g. workspace switch). */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
