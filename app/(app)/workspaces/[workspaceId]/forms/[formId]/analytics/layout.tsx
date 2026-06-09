import type { ReactNode } from "react";
import { formIdStaticParams } from "@/src/lib/staticExportParams";

export function generateStaticParams() {
  return formIdStaticParams();
}

export default function FormAnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}
