import { Spinner } from "./Spinner";

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
