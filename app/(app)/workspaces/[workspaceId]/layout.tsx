import type { ReactNode } from "react";
import { workspaceIdStaticParams } from "@/src/lib/staticExportParams";

/** Static export: pre-render a shell; any workspace id hydrates client-side. */
export function generateStaticParams() {
  return workspaceIdStaticParams();
}

export default function WorkspaceIdLayout({ children }: { children: ReactNode }) {
  return children;
}
