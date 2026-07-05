import type { ReactNode } from "react";
import type { AnalyticsInsights } from "../../../api/types";
import { BreakdownChart } from "./BreakdownChart";
import type { ChartViewMode } from "./ChartViewToggle";
import { formatDayOfWeek, formatPercent } from "./formatAnalytics";
import { formatUtcHourAsLocal } from "../../../lib/formatDateTime";
import { HourOfDayChart } from "./HourOfDayChart";
import { PublicationVersionsPanel } from "./PublicationVersionsPanel";
import { completionInsightsToBreakdown } from "./completionBreakdown";

type AnalyticsInsightsPanelProps = {
  insights: AnalyticsInsights | null;
  loading?: boolean;
  chartView: ChartViewMode;
  totalResponses?: number;
};

function InsightCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] ${className}`}
    >
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-slate-100 pb-2">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}

function AudienceStatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs ring-1 ring-slate-100">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

function BreakdownSection({
  label,
  items,
  chartView,
  maxItems,
  emptyMessage,
  compact,
  hideWhenEmpty,
}: {
  label: string;
  items: AnalyticsInsights["audience"]["emailDomains"];
  chartView: ChartViewMode;
  maxItems?: number;
  emptyMessage?: string;
  compact?: boolean;
  hideWhenEmpty?: boolean;
}) {
  if (hideWhenEmpty && items.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <BreakdownChart
        items={items}
        viewMode={chartView}
        maxItems={maxItems}
        emptyMessage={emptyMessage}
        compact={compact}
      />
    </div>
  );
}

function humanizeFieldLabel(label: string): string {
  if (/^field-/i.test(label)) {
    return label.replace(/^field-/i, "Field ").replace(/-/g, " ");
  }
  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function RespondentFieldGrid({
  groups,
  chartView,
}: {
  groups: AnalyticsInsights["audience"]["respondentAttributeGroups"];
  chartView: ChartViewMode;
}) {
  if (groups.length === 0) return null;

  return (
    <InsightCard
      title="Respondent fields"
      description="Per-field answer distributions"
      className="lg:col-span-2"
    >
      <div className="grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.key}
            className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-slate-50/40 p-4"
          >
            <p
              className="mb-3 min-h-[1.25rem] truncate text-sm font-semibold text-slate-800"
              title={group.label}
            >
              {humanizeFieldLabel(group.label)}
            </p>
            <div className="flex flex-1 flex-col">
              <BreakdownChart items={group.items} viewMode={chartView} maxItems={6} compact />
            </div>
          </div>
        ))}
      </div>
    </InsightCard>
  );
}

export function AnalyticsInsightsPanel({
  insights,
  loading,
  chartView,
  totalResponses = 0,
}: AnalyticsInsightsPanelProps) {
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
        Insights will appear once you start collecting responses with respondent details.
      </div>
    );
  }

  const { audience, traffic, temporal, completion, publications } = insights;
  const responseTotal = totalResponses || audience.uniqueRespondents || 0;
  const completionBreakdown = completionInsightsToBreakdown(completion, responseTotal);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SectionHeading
          title="Audience & traffic"
          description="Who is responding, how they arrive, and where they are"
        />
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <InsightCard title="Audience" description="Contact field coverage" className="h-full">
            <div className="mb-4 flex flex-wrap gap-2">
              <AudienceStatPill label="Name" value={audience.withName} />
              <AudienceStatPill label="Email" value={audience.withEmail} />
              <AudienceStatPill label="Phone" value={audience.withPhone} />
            </div>
            <BreakdownSection
              label="Email domains"
              items={audience.emailDomains}
              chartView={chartView}
              emptyMessage="No email domains yet."
            />
            {audience.respondentAttributeGroups.length === 0 && audience.respondentAttributes.length > 0 ? (
              <div className="mt-5">
                <BreakdownSection
                  label="Respondent attributes"
                  items={audience.respondentAttributes}
                  chartView={chartView}
                  maxItems={6}
                  compact
                />
              </div>
            ) : null}
          </InsightCard>

          <InsightCard title="Traffic & device" className="h-full">
            <div className="space-y-5">
              <BreakdownSection
                label="Device type"
                items={traffic.deviceTypes}
                chartView={chartView}
                hideWhenEmpty
              />
              <BreakdownSection
                label="Browser"
                items={traffic.browsers}
                chartView={chartView}
                hideWhenEmpty
              />
              <BreakdownSection
                label="Operating system"
                items={traffic.operatingSystems}
                chartView={chartView}
                hideWhenEmpty
              />
            </div>
          </InsightCard>

          <RespondentFieldGrid groups={audience.respondentAttributeGroups} chartView={chartView} />

          <InsightCard title="Referrers & campaigns" className="h-full">
            <div className="space-y-5">
              <BreakdownSection
                label="Referrer hosts"
                items={traffic.referrerHosts}
                chartView={chartView}
                hideWhenEmpty
              />
              <BreakdownSection
                label="UTM source"
                items={traffic.utmSources}
                chartView={chartView}
                hideWhenEmpty
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <BreakdownSection
                  label="Medium"
                  items={traffic.utmMediums}
                  chartView={chartView}
                  maxItems={5}
                  hideWhenEmpty
                />
                <BreakdownSection
                  label="Campaign"
                  items={traffic.utmCampaigns}
                  chartView={chartView}
                  maxItems={5}
                  hideWhenEmpty
                />
              </div>
            </div>
          </InsightCard>

          <InsightCard title="Geography & locale" className="h-full">
            <div className="grid gap-5 sm:grid-cols-2">
              <BreakdownSection
                label="Country"
                items={traffic.countries}
                chartView={chartView}
                hideWhenEmpty
              />
              <BreakdownSection
                label="City"
                items={traffic.cities}
                chartView={chartView}
                maxItems={6}
                hideWhenEmpty
              />
              <BreakdownSection
                label="Locale"
                items={traffic.locales}
                chartView={chartView}
                maxItems={5}
                hideWhenEmpty
              />
              <BreakdownSection
                label="Timezone"
                items={traffic.timezones}
                chartView={chartView}
                maxItems={5}
                hideWhenEmpty
              />
            </div>
          </InsightCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Activity patterns"
          description="When submissions tend to arrive"
        />
        <InsightCard
          title="Temporal patterns"
          description={`Peak hour: ${formatUtcHourAsLocal(temporal.peakHour)} · Peak day: ${formatDayOfWeek(temporal.peakDayOfWeek)}`}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            By hour of day
          </p>
          <HourOfDayChart byHour={temporal.byHour} peakHour={temporal.peakHour} />
          <div className="mt-6">
            <BreakdownSection
              label="By day of week"
              items={temporal.byDayOfWeek}
              chartView={chartView}
            />
          </div>
        </InsightCard>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Completion & versions"
          description="How thoroughly forms are filled and which publish snapshots received responses"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <InsightCard
            title="Completion quality"
            description={`Avg ${completion.avgFieldsAnswered.toFixed(1)} fields answered · ${formatPercent(completion.avgCompletionRate)} average · ${completion.fullyCompletedCount} fully completed (${formatPercent(completion.fullyCompletedRate)})`}
          >
            <BreakdownSection
              label="Completion split"
              items={completionBreakdown}
              chartView={chartView}
              emptyMessage="No completion data yet."
            />
          </InsightCard>

          <InsightCard title="Publication versions">
            <PublicationVersionsPanel versions={publications.versions} />
          </InsightCard>
        </div>
      </section>

      {traffic.otherMetadata.length > 0 ? (
        <section className="space-y-4">
          <SectionHeading title="Response metadata" description="Automatically detected fields from submissions" />
          <InsightCard title="Other metadata">
            <BreakdownSection
              label="Discovered fields"
              items={traffic.otherMetadata}
              chartView={chartView}
              maxItems={10}
            />
          </InsightCard>
        </section>
      ) : null}
    </div>
  );
}
