type SpinnerSize = "sm" | "md" | "lg";

const sizeClass: Record<SpinnerSize, string> = {
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
      className={`inline-block animate-spin rounded-full border-indigo-200 border-t-indigo-600 ${sizeClass[size]} ${className}`}
    />
  );
}
