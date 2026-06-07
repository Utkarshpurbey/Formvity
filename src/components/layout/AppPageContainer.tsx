import type { ReactNode } from "react";

type AppPageContainerProps = {
  children: ReactNode;
  /** Narrower inner content for form detail; still left-aligned in the same outer width. */
  narrow?: boolean;
  className?: string;
};

/** Consistent left-aligned page width across workspace, settings, and list views. */
export function AppPageContainer({ children, narrow, className = "" }: AppPageContainerProps) {
  return (
    <div className={`page-enter w-full px-4 py-8 sm:px-8 ${className}`}>
      <div className={`mx-auto w-full ${narrow ? "max-w-4xl" : "max-w-6xl"}`}>{children}</div>
    </div>
  );
}
