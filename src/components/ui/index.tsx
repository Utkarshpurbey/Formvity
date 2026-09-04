type SpinnerSize = "sm" | "md" | "lg";

const spinnerSizeClass: Record<SpinnerSize, string> = {
  sm: "size-4 border-[1.5px]",
  md: "size-8 border-2",
  lg: "size-10 border-2",
};

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  label?: string;
};

export function Spinner({ size = "md", className = "", label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-indigo-200 border-t-indigo-600 ${spinnerSizeClass[size]} ${className}`}
    />
  );
}

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} aria-hidden />;
}

type SkeletonRowsProps = {
  count?: number;
  className?: string;
  rowClassName?: string;
};

export function SkeletonRows({ count = 3, className = "", rowClassName = "h-11" }: SkeletonRowsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={rowClassName} />
      ))}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

type PageLoaderProps = {
  message?: string;
  className?: string;
  fullScreen?: boolean;
};

export function PageLoader({
  message = "Loading…",
  className = "",
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        fullScreen ? "min-h-dvh flex-1" : "min-h-[12rem] flex-1 py-16"
      } ${className}`}
    >
      <Spinner size="lg" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export { PopoverPortal } from "./PopoverPortal";
export type { PopoverPortalProps } from "./PopoverPortal";
