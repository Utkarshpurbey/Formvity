import type { ReactNode } from "react";

/** Public responder route — no app sidebar or header. */
export default function PublicFormLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col">{children}</div>;
}
