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
