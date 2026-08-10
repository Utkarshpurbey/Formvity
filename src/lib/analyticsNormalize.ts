import type {
  AnalyticsAudienceInsights,
  AnalyticsCompletionInsights,
  AnalyticsInsights,
  AnalyticsPublicationInsights,
  AnalyticsSummary,
  AnalyticsTemporalInsights,
  AnalyticsTimeline,
  AnalyticsTimelinePoint,
  AnalyticsTrafficInsights,
  BreakdownItem,
  FormAnalyticsOverview,
  InsightDimensionGroup,
  PublicationVersionInsight,
  QuestionAnalytics,
  QuestionDistribution,
  SubmissionRow,
  SubmissionsPage,
  Tag,
  TagAnalyticsItem,
  TagAnalyticsSummary,
  TagSource,
  TopTextAnswer,
} from "../api/types";

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

function asArray(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : [];
}

function pickString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

function pickNumber(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  }
  return 0;
}

function pickBool(...values: unknown[]): boolean {
  for (const v of values) {
    if (typeof v === "boolean") return v;
  }
  return false;
}

function pickNullableNumber(...values: unknown[]): number | null {
  for (const v of values) {
    if (v === null || v === undefined) continue;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  }
  return null;
}

function normalizeBreakdownItem(raw: unknown, fallbackKey?: string): BreakdownItem | null {
  const r = asRecord(raw);
  const key =
    pickString(r.key, r.name, r.value, r.label, r.domain, r.host, r.source, r.medium, r.campaign, fallbackKey) ??
    fallbackKey;
  if (!key) return null;
  const label = pickString(r.label, r.name, r.value, r.key, r.domain, r.host) ?? key;
  const count = pickNumber(r.count, r.responses, r.total, r.submissions);
  const percent = pickNumber(r.percent, r.percentage, r.pct, r.share);
  return { key, label, count, percent };
}

function isDimensionGroup(item: unknown): boolean {
  const r = asRecord(item);
  return Array.isArray(r.breakdown);
}

function extractBreakdownItems(raw: unknown): BreakdownItem[] {
  const items = asArray(raw);
  if (items.length === 0) return [];

  if (items.some(isDimensionGroup)) {
    return items
      .flatMap((item) => {
        const group = asRecord(item);
        return asArray(group.breakdown)
          .map((b) => normalizeBreakdownItem(b))
          .filter((b): b is BreakdownItem => b !== null);
      })
      .sort((a, b) => b.count - a.count);
  }

  return items
    .map((item) => normalizeBreakdownItem(item))
    .filter((item): item is BreakdownItem => item !== null)
    .sort((a, b) => b.count - a.count);
}

function normalizeDimensionGroups(raw: unknown): InsightDimensionGroup[] {
  return asArray(raw)
    .map((item) => {
      const r = asRecord(item);
      if (!Array.isArray(r.breakdown)) return null;
      const key = pickString(r.dimension, r.key) ?? "";
      const label = pickString(r.label, r.dimension) ?? key;
      const groupItems = asArray(r.breakdown)
        .map((b) => normalizeBreakdownItem(b))
        .filter((b): b is BreakdownItem => b !== null);
      if (!groupItems.length) return null;
      return { key, label, items: groupItems };
    })
    .filter((g): g is InsightDimensionGroup => g !== null);
}

function normalizeBreakdownList(raw: unknown, altKeys: string[] = []): BreakdownItem[] {
  if (Array.isArray(raw)) return extractBreakdownItems(raw);

  const r = asRecord(raw);
  for (const k of altKeys) {
    if (Array.isArray(r[k])) return extractBreakdownItems(r[k]);
  }

  const entries = Object.entries(r).filter(
    ([, v]) => typeof v === "number" || asRecord(v).count !== undefined,
  );
  if (entries.length > 0 && !altKeys.some((k) => k in r)) {
    return entries
      .map(([key, val]) => {
        if (typeof val === "number") {
          return { key, label: key, count: val, percent: 0 };
        }
        return normalizeBreakdownItem(val, key);
      })
      .filter((item): item is BreakdownItem => item !== null);
  }

  return [];
}

const NOISE_TRAFFIC_DIMENSIONS = new Set([
  "meta_sessionid",
  "meta_timing",
  "meta_screen",
  "meta_journey",
  "meta_client",
  "meta_utm",
]);

function emptyAudience(): AnalyticsAudienceInsights {
  return {
    uniqueRespondents: 0,
    returningRespondents: 0,
    withEmail: 0,
    withName: 0,
    withPhone: 0,
    emailDomains: [],
    respondentAttributeGroups: [],
    respondentAttributes: [],
  };
}

function emptyTraffic(): AnalyticsTrafficInsights {
  return {
    submissionsWithMetadata: 0,
    browsers: [],
    operatingSystems: [],
    deviceTypes: [],
    referrerHosts: [],
    utmSources: [],
    utmMediums: [],
    utmCampaigns: [],
    locales: [],
    timezones: [],
    countries: [],
    cities: [],
    platforms: [],
    otherMetadata: [],
  };
}

function emptyTemporal(): AnalyticsTemporalInsights {
  return { byHour: [], byDayOfWeek: [], peakHour: null, peakDayOfWeek: null };
}

function emptyCompletion(): AnalyticsCompletionInsights {
  return {
    avgFieldsAnswered: 0,
    avgCompletionRate: 0,
    fullyCompletedCount: 0,
    fullyCompletedRate: 0,
  };
}

function normalizeAudience(raw: unknown): AnalyticsAudienceInsights {
  const r = asRecord(raw);
  const emailDomainsRaw = r.emailDomains ?? r.emailDomainBreakdown ?? r.domains;
  const attributesRaw = r.respondentAttributes ?? r.dynamicAttributes ?? r.attributes;
  const attributeGroups = normalizeDimensionGroups(attributesRaw);
  return {
    uniqueRespondents: pickNumber(r.uniqueRespondents, r.uniqueCount, r.unique),
    returningRespondents: pickNumber(r.returningRespondents, r.returningCount, r.returning),
    withEmail: pickNumber(r.withEmail, r.emailCount, r.respondentsWithEmail),
    withName: pickNumber(r.withName, r.nameCount, r.respondentsWithName),
    withPhone: pickNumber(r.withPhone, r.phoneCount, r.respondentsWithPhone),
    emailDomains: extractBreakdownItems(emailDomainsRaw),
    respondentAttributeGroups: attributeGroups,
    respondentAttributes:
      attributeGroups.length > 0
        ? attributeGroups.flatMap((g) => g.items)
        : normalizeBreakdownList(attributesRaw, ["respondentAttributes", "attributes"]),
  };
}

function assignTrafficDimension(
  base: AnalyticsTrafficInsights,
  dimensionKey: string,
  items: BreakdownItem[],
) {
  if (!items.length) return;
  switch (dimensionKey) {
    case "device_type":
      base.deviceTypes = items;
      break;
    case "browser":
      base.browsers = items;
      break;
    case "os":
    case "operating_system":
      base.operatingSystems = items;
      break;
    case "referrer":
    case "referrer_host":
      base.referrerHosts = items;
      break;
    case "utm_source":
      base.utmSources = items;
      break;
    case "utm_medium":
      base.utmMediums = items;
      break;
    case "utm_campaign":
      base.utmCampaigns = items;
      break;
    case "locale":
      base.locales = items;
      break;
    case "timezone":
      base.timezones = items;
      break;
    case "country":
      base.countries = items;
      break;
    case "city":
      base.cities = items;
      break;
    case "platform":
      base.platforms = items;
      break;
    default:
      if (!NOISE_TRAFFIC_DIMENSIONS.has(dimensionKey) && !dimensionKey.startsWith("meta_")) {
        base.otherMetadata.push(...items);
      }
      break;
  }
}

function normalizeTraffic(raw: unknown): AnalyticsTrafficInsights {
  const r = asRecord(raw);
  const base = emptyTraffic();
  base.submissionsWithMetadata = pickNumber(
    r.submissionsWithMetadata,
    r.withMetadata,
    r.metadataCount,
  );

  const dimensions = asArray(r.dimensions);
  if (dimensions.length > 0) {
    for (const dim of dimensions) {
      const d = asRecord(dim);
      const key = (pickString(d.dimension) ?? "").toLowerCase();
      const items = extractBreakdownItems(d.breakdown);
      assignTrafficDimension(base, key, items);
    }
    return base;
  }

  base.browsers = normalizeBreakdownList(r.browsers ?? r.browser, ["browsers"]);
  base.operatingSystems = normalizeBreakdownList(r.operatingSystems ?? r.os ?? r.oses, [
    "operatingSystems",
    "os",
  ]);
  base.deviceTypes = normalizeBreakdownList(r.deviceTypes ?? r.devices ?? r.deviceType, [
    "deviceTypes",
  ]);
  base.referrerHosts = normalizeBreakdownList(r.referrerHosts ?? r.referrers ?? r.referrer, [
    "referrerHosts",
    "referrers",
  ]);
  base.utmSources = normalizeBreakdownList(r.utmSources ?? r.utmSource, ["utmSources"]);
  base.utmMediums = normalizeBreakdownList(r.utmMediums ?? r.utmMedium, ["utmMediums"]);
  base.utmCampaigns = normalizeBreakdownList(r.utmCampaigns ?? r.utmCampaign, ["utmCampaigns"]);
  base.locales = normalizeBreakdownList(r.locales ?? r.locale, ["locales"]);
  base.timezones = normalizeBreakdownList(r.timezones ?? r.timezone, ["timezones"]);
  base.countries = normalizeBreakdownList(r.countries ?? r.country, ["countries"]);
  base.cities = normalizeBreakdownList(r.cities ?? r.city, ["cities"]);
  base.platforms = normalizeBreakdownList(r.platforms ?? r.platform, ["platforms"]);
  base.otherMetadata = normalizeBreakdownList(r.otherMetadata ?? r.discovered ?? r.additional, [
    "otherMetadata",
    "additional",
  ]);
  return base;
}

function normalizeHourBuckets(raw: unknown): BreakdownItem[] {
  return asArray(raw)
    .map((item) => {
      const r = asRecord(item);
      const hour = pickNullableNumber(r.hour, r.key !== undefined ? Number(r.key) : null);
      if (hour === null || hour < 0 || hour > 23) return null;
      return {
        key: String(hour),
        label: String(hour),
        count: pickNumber(r.count),
        percent: pickNumber(r.percent, r.percentage),
      };
    })
    .filter((item): item is BreakdownItem => item !== null);
}

function normalizeDayBuckets(raw: unknown): BreakdownItem[] {
  return asArray(raw)
    .map((item) => {
      const r = asRecord(item);
      const day = pickString(r.day, r.label, r.key);
      if (!day) return null;
      return {
        key: day,
        label: day,
        count: pickNumber(r.count),
        percent: pickNumber(r.percent, r.percentage),
      };
    })
    .filter((item): item is BreakdownItem => item !== null);
}

function normalizeTemporal(raw: unknown): AnalyticsTemporalInsights {
  const r = asRecord(raw);
  const byHour = normalizeHourBuckets(
    r.byHourOfDay ?? r.byHour ?? r.hourly ?? r.responsesByHour ?? r.hours,
  );
  const byDayOfWeek = normalizeDayBuckets(
    r.byDayOfWeek ?? r.dailyByWeekday ?? r.responsesByDayOfWeek ?? r.daysOfWeek,
  );
  const peakHourRaw = pickNullableNumber(r.peakHour, r.busiestHour);
  const peakDay = pickString(r.peakDayOfWeek, r.busiestDay, r.peakDay);
  return {
    byHour,
    byDayOfWeek,
    peakHour: peakHourRaw,
    peakDayOfWeek: peakDay,
  };
}

function normalizeCompletion(raw: unknown): AnalyticsCompletionInsights {
  const r = asRecord(raw);
  return {
    avgFieldsAnswered: pickNumber(r.avgFieldsAnswered, r.averageFieldsAnswered, r.fieldsAnsweredAvg),
    avgCompletionRate: pickNumber(r.avgCompletionRate, r.averageCompletionRate, r.completionRate),
    fullyCompletedCount: pickNumber(r.fullyCompletedCount, r.completeCount, r.fullyCompleted),
    fullyCompletedRate: pickNumber(r.fullyCompletedRate, r.completeRate, r.fullyCompletedPercent),
  };
}

function normalizePublicationVersion(raw: unknown): PublicationVersionInsight | null {
  const r = asRecord(raw);
  const version = pickNumber(r.version, r.publicationVersion, r.publishVersion);
  if (!version) return null;
  return {
    version,
    slug: pickString(r.slug, r.publicSlug) ?? undefined,
    publishedAt: pickString(r.publishedAt, r.createdAt),
    current: pickBool(r.current, r.isCurrent, r.active),
    responseCount: pickNumber(r.responseCount, r.count, r.responses, r.submissions),
    percentOfTotal: pickNumber(r.percentOfTotal, r.percent, r.percentage, r.share),
  };
}

function normalizePublications(raw: unknown): AnalyticsPublicationInsights {
  if (Array.isArray(raw)) {
    return {
      versions: raw
        .map(normalizePublicationVersion)
        .filter((v): v is PublicationVersionInsight => v !== null),
    };
  }
  const r = asRecord(raw);
  const versions = asArray(r.versions ?? r.publications ?? r.items)
    .map(normalizePublicationVersion)
    .filter((v): v is PublicationVersionInsight => v !== null);
  return { versions };
}

function normalizeTagAnalyticsItem(raw: unknown): TagAnalyticsItem | null {
  const r = asRecord(raw);
  const tagId = pickString(r.tagId, r.id);
  if (!tagId) return null;
  return {
    tagId,
    name: pickString(r.name, r.tagName, r.title) ?? "Tag",
    hexCode: pickString(r.hexCode, r.hex_code, r.color) ?? "#3B82F6",
    taggedSubmissionsCount: pickNumber(r.taggedSubmissionsCount, r.count, r.submissionsCount),
    percentage: pickNumber(r.percentage, r.percent, r.pct),
    manualCount: pickNumber(r.manualCount, r.manual),
    aiCount: pickNumber(r.aiCount, r.ai),
    importCount: pickNumber(r.importCount, r.import),
  };
}

export function normalizeTagAnalytics(raw: unknown): TagAnalyticsSummary | null {
  if (!raw || (typeof raw === "object" && Object.keys(asRecord(raw)).length === 0)) return null;
  const r = asRecord(raw);
  const tags = asArray(r.tags ?? r.tagList ?? r.items)
    .map(normalizeTagAnalyticsItem)
    .filter((t): t is TagAnalyticsItem => t !== null);

  return {
    totalSubmissions: pickNumber(r.totalSubmissions, r.total),
    totalTaggedSubmissions: pickNumber(r.totalTaggedSubmissions, r.taggedCount),
    totalUntaggedSubmissions: pickNumber(r.totalUntaggedSubmissions, r.untaggedCount),
    totalTagAssignments: pickNumber(r.totalTagAssignments, r.assignmentsCount),
    tags,
  };
}

export function normalizeAnalyticsInsights(raw: unknown): AnalyticsInsights | null {
  if (!raw || (typeof raw === "object" && Object.keys(asRecord(raw)).length === 0)) return null;
  const r = asRecord(raw);
  return {
    audience: normalizeAudience(r.audience ?? r.respondent ?? {}),
    traffic: normalizeTraffic(r.traffic ?? r.metadata ?? {}),
    temporal: normalizeTemporal(r.temporal ?? r.timing ?? {}),
    completion: normalizeCompletion(r.completion ?? {}),
    publications: normalizePublications(r.publications ?? r.versions ?? {}),
    tags: normalizeTagAnalytics(r.tags ?? r.tagAnalytics),
  };
}

export function normalizeAnalyticsSummary(raw: unknown): AnalyticsSummary {
  const r = asRecord(raw);
  const versionRaw = r.currentPublicationVersion ?? r.currentPublishVersion ?? r.publishVersion ?? r.version;
  return {
    totalResponses: pickNumber(r.totalResponses, r.total, r.totalCount, r.responseCount),
    responsesToday: pickNumber(r.responsesToday, r.todayCount, r.today, r.todayResponses),
    firstResponseAt: pickString(r.firstResponseAt, r.firstResponseTime, r.firstResponse),
    lastResponseAt: pickString(r.lastResponseAt, r.lastResponseTime, r.lastResponse),
    currentPublicationVersion:
      versionRaw === null || versionRaw === undefined ? null : pickNumber(versionRaw),
    responsesLast7Days: pickNumber(r.responsesLast7Days, r.last7Days, r.weekCount) || undefined,
    responsesLast30Days: pickNumber(r.responsesLast30Days, r.last30Days, r.monthCount) || undefined,
    uniqueRespondents: pickNumber(r.uniqueRespondents, r.uniqueCount) || undefined,
    returningRespondents: pickNumber(r.returningRespondents, r.returningCount) || undefined,
    avgCompletionRate: pickNumber(r.avgCompletionRate, r.averageCompletionRate, r.completionRate) || undefined,
    peakHour: pickNullableNumber(r.peakHour, r.busiestHour),
    peakDayOfWeek: pickString(r.peakDayOfWeek, r.busiestDay, r.peakDay),
    submissionsWithMetadata: pickNumber(r.submissionsWithMetadata, r.withMetadata) || undefined,
  };
}

function normalizeTimelinePoint(raw: unknown): AnalyticsTimelinePoint | null {
  const r = asRecord(raw);
  const date = pickString(r.date, r.day, r.label, r.bucket);
  if (!date) return null;
  return {
    date,
    count: pickNumber(r.count, r.submissionCount, r.responses, r.value, r.total),
  };
}

function normalizeTimelinePoints(raw: unknown): AnalyticsTimelinePoint[] {
  return asArray(raw)
    .map(normalizeTimelinePoint)
    .filter((p): p is AnalyticsTimelinePoint => p !== null);
}

export function normalizeAnalyticsTimeline(raw: unknown, fallbackDays = 7): AnalyticsTimeline {
  if (Array.isArray(raw)) {
    return { days: fallbackDays, points: normalizeTimelinePoints(raw) };
  }
  const r = asRecord(raw);
  const points = normalizeTimelinePoints(r.points ?? r.buckets ?? r.timeline ?? r.data);
  return {
    days: pickNumber(r.days, fallbackDays) || fallbackDays,
    points,
  };
}

function normalizeDistribution(raw: unknown): QuestionDistribution | null {
  const r = asRecord(raw);
  const value = pickString(r.value, r.option, r.answer, r.key);
  const label = pickString(r.label, r.value, r.option);
  if (value === null && label === null) return null;
  const count = pickNumber(r.count, r.responses, r.total);
  const percent = pickNumber(r.percent, r.percentage, r.pct);
  return {
    value: value ?? label ?? "",
    label: label ?? undefined,
    count,
    percent: percent || 0,
  };
}

function parseStructuredAnswerValue(raw: string): string {
  const trimmed = raw.trim();
  const valueMatch = trimmed.match(/(?:^|\{|,)\s*value=([^,}]+)/);
  if (valueMatch) return valueMatch[1]!.trim();
  return trimmed;
}

function normalizeTopTextAnswer(raw: unknown): TopTextAnswer | null {
  const r = asRecord(raw);
  const rawValue = pickString(r.value, r.answer, r.text, r.label);
  if (!rawValue) return null;
  return {
    value: parseStructuredAnswerValue(rawValue),
    count: pickNumber(r.count, r.responses, r.total),
  };
}

function normalizeQuestion(raw: unknown): QuestionAnalytics | null {
  const r = asRecord(raw);
  const fieldId = pickString(r.fieldId, r.id, r.questionId, r.componentId);
  if (!fieldId) return null;
  const distribution = asArray(r.distribution ?? r.options ?? r.breakdown ?? r.values ?? r.choices)
    .map(normalizeDistribution)
    .filter((d): d is QuestionDistribution => d !== null);
  const responseCount = pickNumber(r.responseCount, r.totalResponses, r.count, r.answers);
  const topTextAnswers = asArray(r.topTextAnswers ?? r.topAnswers ?? r.frequentAnswers)
    .map(normalizeTopTextAnswer)
    .filter((t): t is TopTextAnswer => t !== null);
  return {
    fieldId,
    label: pickString(r.label, r.questionLabel, r.title, r.name, r.question, r.fieldLabel, r.text) ?? fieldId,
    type: pickString(r.type, r.fieldType, r.componentType) ?? "text",
    responseCount: responseCount || distribution.reduce((sum, d) => sum + d.count, 0),
    skippedCount: r.skippedCount !== undefined ? pickNumber(r.skippedCount) : undefined,
    average: r.average !== undefined ? pickNumber(r.average, r.mean) : undefined,
    min: r.min !== undefined ? pickNumber(r.min) : undefined,
    max: r.max !== undefined ? pickNumber(r.max) : undefined,
    median: r.median !== undefined ? pickNumber(r.median) : undefined,
    required: r.required !== undefined ? pickBool(r.required, r.isRequired) : undefined,
    completionRate:
      r.completionRate !== undefined ? pickNumber(r.completionRate, r.answerRate) : undefined,
    distribution,
    topTextAnswers: topTextAnswers.length > 0 ? topTextAnswers : undefined,
  };
}

export function normalizeQuestionAnalyticsList(raw: unknown): QuestionAnalytics[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeQuestion).filter((q): q is QuestionAnalytics => q !== null);
  }
  const r = asRecord(raw);
  return asArray(r.questions ?? r.breakdown ?? r.fields ?? r.items)
    .map(normalizeQuestion)
    .filter((q): q is QuestionAnalytics => q !== null);
}

function extractTimelineRaw(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  const nested = asRecord(raw);
  const inner = nested.points ?? nested.buckets ?? nested.timeline ?? nested.data;
  return Array.isArray(inner) ? inner : raw;
}

export function normalizeFormAnalyticsOverview(raw: unknown, fallbackDays = 7): FormAnalyticsOverview {
  const r = asRecord(raw);
  const timelineRaw = r.timeline ?? r.buckets ?? r.points;
  const insightsRaw = r.insights ?? r.analyticsInsights;
  const normalizedInsights = insightsRaw ? normalizeAnalyticsInsights(insightsRaw) : null;
  const tagsSummary = normalizeTagAnalytics(r.tags ?? r.tagAnalytics ?? normalizedInsights?.tags);
  return {
    summary: normalizeAnalyticsSummary(r.summary ?? r),
    timeline: normalizeTimelinePoints(extractTimelineRaw(timelineRaw)),
    questions: normalizeQuestionAnalyticsList(r.questions ?? r.questionAnalytics ?? []),
    insights: normalizedInsights,
    tags: tagsSummary,
  };
}

export function normalizeFormAnalyticsInsightsOnly(raw: unknown): AnalyticsInsights {
  const normalized = normalizeAnalyticsInsights(raw);
  if (normalized) return normalized;
  return {
    audience: emptyAudience(),
    traffic: emptyTraffic(),
    temporal: emptyTemporal(),
    completion: emptyCompletion(),
    publications: { versions: [] },
  };
}

function normalizeTag(raw: unknown): Tag | null {
  const r = asRecord(raw);
  const id = pickString(r.id, r.tagId);
  if (!id) return null;
  const name = pickString(r.name, r.tagName, r.title) ?? "Tag";
  const hexCode = pickString(r.hexCode, r.hex_code, r.color) ?? "#3B82F6";
  const sourceRaw = pickString(r.source);
  const source =
    sourceRaw === "MANUAL" || sourceRaw === "AI" || sourceRaw === "IMPORT"
      ? (sourceRaw as TagSource)
      : undefined;
  return { id, name, hexCode, source };
}

function normalizeTagList(raw: unknown): Tag[] {
  return asArray(raw)
    .map(normalizeTag)
    .filter((t): t is Tag => t !== null);
}

function normalizeSubmissionRow(raw: unknown): SubmissionRow | null {
  const r = asRecord(raw);
  const id = pickString(r.id, r.submissionId);
  if (!id) return null;
  return {
    id,
    createdAt: pickString(r.createdAt, r.submittedAt, r.submitted_at) ?? new Date(0).toISOString(),
    publicationVersion: r.publicationVersion !== undefined ? pickNumber(r.publicationVersion) : undefined,
    respondent: asRecord(r.respondent ?? r.responderDetails ?? r.intake),
    answers: asRecord(r.answers ?? r.formAnswers ?? r.fields),
    metadata: asRecord(r.metadata ?? r.submissionMetadata),
    answeredFieldCount:
      r.answeredFieldCount !== undefined ? pickNumber(r.answeredFieldCount, r.fieldsAnswered) : undefined,
    totalFieldCount:
      r.totalFieldCount !== undefined ? pickNumber(r.totalFieldCount, r.totalFields) : undefined,
    completionRate:
      r.completionRate !== undefined ? pickNumber(r.completionRate, r.completionPercent) : undefined,
    tags: normalizeTagList(r.tags ?? r.submissionTags),
  };
}

export function normalizeSubmissionsPage(raw: unknown): SubmissionsPage {
  const r = asRecord(raw);
  const content = asArray(r.content ?? r.items)
    .map(normalizeSubmissionRow)
    .filter((row): row is SubmissionRow => row !== null);
  const page = pickNumber(r.number, r.page, r.pageNumber);
  const size = pickNumber(r.size, r.pageSize) || 20;
  const totalElements = pickNumber(r.totalElements, r.total, r.totalCount);
  const totalPages = pickNumber(r.totalPages, r.pages) || 1;
  return {
    content,
    page,
    size,
    totalElements: totalElements || content.length,
    totalPages: totalPages || (size > 0 ? Math.ceil((totalElements || content.length) / size) : 1),
    first: pickBool(r.first, page <= 0),
    last: pickBool(r.last, page + 1 >= totalPages),
  };
}
