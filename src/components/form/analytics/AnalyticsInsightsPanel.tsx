import type { ReactNode } from "react";
import type { AnalyticsInsights } from "../../../api/types";
import { BreakdownBars } from "./BreakdownBars";
import { formatDayOfWeek, formatHour, formatPercent } from "./formatAnalytics";
import { HourOfDayChart } from "./HourOfDayChart";
import { PublicationVersionsPanel } from "./PublicationVersionsPanel";

type AnalyticsInsightsPanelProps = {
  insights: AnalyticsInsights | null;
  loading?: boolean;
};

function InsightCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

export function AnalyticsInsightsPanel({ insights, loading }: AnalyticsInsightsPanelProps) {
  if (loading && !insights) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center text-sm text-slate-500">
        Insights will appear once responses include respondent and metadata fields.
      </div>
    );
  }

  const { audience, traffic, temporal, completion, publications } = insights;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Unique respondents" value={audience.uniqueRespondents} />
        <MiniStat label="Returning" value={audience.returningRespondents} />
        <MiniStat label="With email" value={audience.withEmail} />
        <MiniStat label="With metadata" value={traffic.submissionsWithMetadata} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightCard title="Audience" description="Who is responding">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <MiniStat label="Name" value={audience.withName} />
            <MiniStat label="Email" value={audience.withEmail} />
            <MiniStat label="Phone" value={audience.withPhone} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email domains
          </p>
          <BreakdownBars items={audience.emailDomains} emptyMessage="No email domains yet." />
          {audience.respondentAttributeGroups.length > 0
            ? audience.respondentAttributeGroups.map((group) => (
                <div key={group.key} className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </p>
                  <BreakdownBars items={group.items} maxItems={8} />
                </div>
              ))
            : audience.respondentAttributes.length > 0 ? (
                <>
                  <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Respondent attributes
                  </p>
                  <BreakdownBars items={audience.respondentAttributes} maxItems={6} />
                </>
              ) : null}
        </InsightCard>

        <InsightCard title="Traffic & device" description="How people found your form">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Device type
              </p>
              <BreakdownBars items={traffic.deviceTypes} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Browser
              </p>
              <BreakdownBars items={traffic.browsers} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Operating system
              </p>
              <BreakdownBars items={traffic.operatingSystems} />
            </div>
          </div>
        </InsightCard>

        <InsightCard title="Referrers & campaigns" description="UTM and traffic sources">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Referrer hosts
              </p>
              <BreakdownBars items={traffic.referrerHosts} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                UTM source
              </p>
              <BreakdownBars items={traffic.utmSources} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Medium
                </p>
                <BreakdownBars items={traffic.utmMediums} maxItems={5} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Campaign
                </p>
                <BreakdownBars items={traffic.utmCampaigns} maxItems={5} />
              </div>
            </div>
          </div>
        </InsightCard>

        <InsightCard title="Geography & locale" description="Where responders are">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Country
              </p>
              <BreakdownBars items={traffic.countries} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                City
              </p>
              <BreakdownBars items={traffic.cities} maxItems={6} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Locale
                </p>
                <BreakdownBars items={traffic.locales} maxItems={5} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Timezone
                </p>
                <BreakdownBars items={traffic.timezones} maxItems={5} />
              </div>
            </div>
          </div>
        </InsightCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightCard
          title="Temporal patterns"
          description={`Peak: ${formatHour(temporal.peakHour)} · ${formatDayOfWeek(temporal.peakDayOfWeek)}`}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            By hour of day
          </p>
          <HourOfDayChart byHour={temporal.byHour} peakHour={temporal.peakHour} />
          <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            By day of week
          </p>
          <BreakdownBars items={temporal.byDayOfWeek} />
        </InsightCard>

        <div className="space-y-4">
          <InsightCard title="Completion quality" description="How thoroughly forms are filled">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label="Avg fields answered"
                value={completion.avgFieldsAnswered.toFixed(1)}
              />
              <MiniStat
                label="Avg completion rate"
                value={formatPercent(completion.avgCompletionRate)}
              />
              <MiniStat label="Fully completed" value={completion.fullyCompletedCount} />
              <MiniStat
                label="Full completion rate"
                value={formatPercent(completion.fullyCompletedRate)}
              />
            </div>
          </InsightCard>

          <InsightCard title="Publication versions" description="Responses per publish snapshot">
            <PublicationVersionsPanel versions={publications.versions} />
          </InsightCard>
        </div>
      </div>

      {traffic.otherMetadata.length > 0 ? (
        <InsightCard title="Other metadata" description="Auto-discovered low-cardinality fields">
          <BreakdownBars items={traffic.otherMetadata} maxItems={10} />
        </InsightCard>
      ) : null}
    </div>
  );
}
