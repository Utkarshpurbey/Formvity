import type { CSSProperties, ReactNode } from "react";

type FormPageShellProps = {
  appearanceVars: CSSProperties;
  children: ReactNode;
  className?: string;
  /** Use full viewport height (e.g. `/forms` without app chrome). */
  fullViewport?: boolean;
};

/** Full-viewport canvas using PageDef appearance (`--fb-bg`, primary glow). */
export function FormPageShell({ appearanceVars, children, className = "", fullViewport = false }: FormPageShellProps) {
  const minHeightClass = fullViewport ? "min-h-dvh" : "min-h-[calc(100dvh-3.5rem)]";

  return (
    <div
      className={`relative flex ${minHeightClass} w-full flex-1 flex-col overflow-y-auto ${className}`.trim()}
      style={{
        ...appearanceVars,
        backgroundColor: "var(--fb-bg)",
        color: "var(--fb-text)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -20%, color-mix(in srgb, var(--fb-primary) 28%, transparent), transparent 55%), radial-gradient(ellipse 90% 60% at 100% 100%, color-mix(in srgb, var(--fb-primary) 12%, transparent), transparent 50%)",
        }}
      />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  );
}
