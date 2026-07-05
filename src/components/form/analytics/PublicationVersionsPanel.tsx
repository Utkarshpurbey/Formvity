import type { PublicationVersionInsight } from "../../../api/types";
import { formatPercent } from "./formatAnalytics";
import { formatLocalDateTime } from "../../../lib/formatDateTime";

type PublicationVersionsPanelProps = {
  versions: PublicationVersionInsight[];
};

export function PublicationVersionsPanel({ versions }: PublicationVersionsPanelProps) {
  if (versions.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Publication version breakdown appears after you publish and collect responses.
      </p>
    );
  }

  const maxCount = Math.max(1, ...versions.map((v) => v.responseCount));

  return (
    <ul className="space-y-3">
      {versions.map((v) => {
        const barPct = (v.responseCount / maxCount) * 100;
        return (
          <li
            key={v.version}
            className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Version {v.version}
                  {v.current ? (
                    <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                      Current
                    </span>
                  ) : null}
                </p>
                {v.slug ? (
                  <p className="mt-0.5 font-mono text-xs text-slate-500">/{v.slug}</p>
                ) : null}
                {v.publishedAt ? (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Published {formatLocalDateTime(v.publishedAt)}
                  </p>
                ) : null}
              </div>
              <div className="text-right text-sm tabular-nums text-slate-600">
                <span className="font-semibold text-slate-900">{v.responseCount}</span>
                <span className="text-slate-400"> · </span>
                {formatPercent(v.percentOfTotal)}
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{ width: `${barPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
