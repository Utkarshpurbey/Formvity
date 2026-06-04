"use client";

import type { ReactNode } from "react";
import { AppShellChrome } from "../../src/components/layout/AppShellChrome";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return <AppShellChrome>{children}</AppShellChrome>;
}
