/** Static SSR-friendly placeholder — no JS, protects LCP & CLS while walkthrough loads. */

type WalkthroughPlaceholderProps = {
  variant?: "compact" | "full";
  className?: string;
};

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/80 px-4 py-3">
      <div className="flex gap-1.5" aria-hidden>
        <span className="size-3 rounded-full bg-rose-400/80" />
        <span className="size-3 rounded-full bg-amber-400/80" />
        <span className="size-3 rounded-full bg-emerald-400/80" />
      </div>
      <div className="mx-auto flex h-7 w-full max-w-sm items-center justify-center rounded-lg bg-slate-900/60 px-3 text-[11px] text-slate-400">
        {url}
      </div>
    </div>
  );
}

export function WalkthroughPlaceholder({ variant = "compact", className = "" }: WalkthroughPlaceholderProps) {
  const compact = variant === "compact";
  const minH = compact ? "min-h-[300px] sm:min-h-[340px]" : "min-h-[360px] sm:min-h-[400px]";

  if (variant === "full") {
    return (
      <div className={className}>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="space-y-3">
            {["01", "02", "03", "04"].map((step, i) => (
              <div
                key={step}
                className={`rounded-2xl border p-5 ${i === 0 ? "border-violet-200 bg-white shadow-sm" : "border-transparent"}`}
              >
                <div className="flex gap-4">
                  <span className={`text-3xl font-black ${i === 0 ? "text-violet-500" : "text-slate-200"}`}>{step}</span>
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 rounded ${i === 0 ? "w-3/4 bg-slate-200" : "w-1/2 bg-slate-100"}`} />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="relative">
            <div
              className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl ${minH}`}
            >
              <BrowserChrome url="formvity.in/templates" />
              <div className="bg-slate-50 p-4">
                <div className="h-12 rounded-xl bg-violet-50" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-24 rounded-xl bg-white ring-1 ring-slate-200" />
                  <div className="h-24 rounded-xl bg-white ring-1 ring-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative mx-auto w-full max-w-4xl ${className}`} aria-hidden>
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 blur-2xl" />
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl ring-1 ring-white/10 ${minH}`}>
        <BrowserChrome url="formvity.in/templates" />
        <div className="bg-slate-50 p-4">
          <div className="h-10 rounded-xl bg-violet-50/80" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-20 rounded-xl border border-violet-200 bg-white" />
            <div className="h-20 rounded-xl border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
