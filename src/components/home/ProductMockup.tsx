/** Decorative product UI preview for the marketing hero — mirrors workspace-centric app shell. */
export function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden>
      <div className="absolute -inset-4 rounded-2xl bg-violet-600/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-xl bg-white shadow-xl shadow-violet-900/20 ring-1 ring-violet-500/15">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-3 py-2">
          <div className="flex gap-1">
            <span className="size-2 rounded-full bg-rose-400/90" />
            <span className="size-2 rounded-full bg-amber-400/90" />
            <span className="size-2 rounded-full bg-emerald-400/90" />
          </div>
          <div className="mx-auto truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-slate-400 ring-1 ring-slate-200/60">
            app.formvity.com/workspaces
          </div>
        </div>

        <div className="grid min-h-[300px] grid-cols-[128px_1fr] sm:min-h-[340px] sm:grid-cols-[148px_1fr]">
          <div className="border-r border-slate-100 bg-white p-2.5">
            <div className="mb-3 flex items-center gap-1.5">
              <div className="size-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600" />
              <span className="text-[11px] font-bold text-slate-900">Formvity</span>
            </div>
            <div className="mb-3 rounded-lg bg-slate-50 p-1.5">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="size-5 rounded-md bg-violet-100 text-center text-[8px] font-bold leading-5 text-violet-700">
                  MF
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-slate-800">Product Team</p>
                  <p className="text-[8px] text-slate-400">3 workspaces</p>
                </div>
              </div>
            </div>
            <p className="mb-1 px-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
            {["Overview", "Settings"].map((item, i) => (
              <div
                key={item}
                className={`mb-0.5 rounded-md px-2 py-1 text-[10px] font-medium ${
                  i === 0 ? "bg-violet-50 text-violet-700" : "text-slate-600"
                }`}
              >
                {item}
              </div>
            ))}
            <div className="ml-2 mt-0.5 space-y-0.5 border-l border-slate-200 pl-1.5">
              {["General", "Members", "Tags"].map((sub, i) => (
                <div
                  key={sub}
                  className={`rounded px-1.5 py-0.5 text-[9px] ${i === 0 ? "bg-violet-50/80 font-medium text-violet-700" : "text-slate-500"}`}
                >
                  {sub}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f8fafc] p-3 sm:p-4">
            <div className="rounded-lg border border-slate-200/60 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-violet-100 text-center text-[10px] font-bold leading-8 text-violet-700">
                    PT
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-900">Product Team</p>
                    <p className="text-[9px] text-slate-500">4 forms · 6 members</p>
                  </div>
                </div>
                <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                  New form
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {[
                  { l: "Total", v: "4" },
                  { l: "Live", v: "2" },
                  { l: "Draft", v: "1" },
                  { l: "Offline", v: "1" },
                ].map((s) => (
                  <div key={s.l} className="rounded-md bg-slate-50 px-1.5 py-1 text-center ring-1 ring-slate-100">
                    <p className="text-[8px] text-slate-400">{s.l}</p>
                    <p className="text-[11px] font-semibold tabular-nums text-slate-900">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2.5 rounded-lg border border-slate-200/60 bg-white p-2.5 shadow-sm">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Recent forms</p>
              {["Customer feedback", "Beta signup", "Support request"].map((title, i) => (
                <div
                  key={title}
                  className={`mt-1.5 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 ${i === 0 ? "bg-violet-50/50" : ""}`}
                >
                  <span className="truncate text-[10px] font-medium text-slate-800">{title}</span>
                  <span
                    className={`shrink-0 rounded px-1 py-0.5 text-[8px] font-semibold ${
                      i === 0
                        ? "bg-emerald-100 text-emerald-700"
                        : i === 1
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i === 0 ? "Live" : i === 1 ? "Draft" : "Live"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
