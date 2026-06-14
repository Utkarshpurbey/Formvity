/** Decorative product UI preview for the marketing hero. */
export function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-4xl" aria-hidden>
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10 backdrop-blur-sm">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-rose-400/80" />
            <span className="size-3 rounded-full bg-amber-400/80" />
            <span className="size-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="mx-auto flex h-7 w-full max-w-sm items-center justify-center rounded-lg bg-slate-900/60 px-3 text-[11px] text-slate-400">
            app.formvity.com/workspaces
          </div>
        </div>

        <div className="grid min-h-[320px] grid-cols-[140px_1fr] sm:min-h-[380px] sm:grid-cols-[180px_1fr]">
          {/* Sidebar */}
          <div className="border-r border-white/10 bg-slate-900/60 p-3">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600" />
              <span className="text-xs font-semibold text-white">Formvity</span>
            </div>
            {["Workspaces", "Templates", "Builder"].map((item, i) => (
              <div
                key={item}
                className={`mb-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                  i === 0 ? "bg-violet-500/20 text-violet-200" : "text-slate-500"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-400">Analytics</p>
                <p className="text-sm font-semibold text-white">Event Registration</p>
              </div>
              <span className="rounded-lg bg-violet-500/20 px-2 py-1 text-[10px] font-semibold text-violet-200">
                7d
              </span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { label: "Responses", value: "101" },
                { label: "Completion", value: "100%" },
                { label: "Unique", value: "101" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/10">
                  <p className="text-[9px] text-slate-400">{stat.label}</p>
                  <p className="text-sm font-bold tabular-nums text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <p className="mb-2 text-[10px] font-medium text-slate-400">Response timeline</p>
              <div className="flex h-16 items-end gap-1">
                {[12, 8, 15, 10, 6, 18, 24, 14, 9, 20, 16, 22, 11, 7].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-violet-600 to-violet-400 opacity-80"
                    style={{ height: `${h * 3}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {["Overview", "Audience", "Questions"].map((tab, i) => (
                <span
                  key={tab}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                    i === 0 ? "bg-white/10 text-white" : "text-slate-500"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
