import type { ReactNode } from "react";
import { formIdStaticParams } from "@/src/lib/staticExportParams";

/** Static export: pre-render a shell; any form id hydrates client-side. */
export function generateStaticParams() {
  return formIdStaticParams();
}

export default function FormIdLayout({ children }: { children: ReactNode }) {
  return children;
}
