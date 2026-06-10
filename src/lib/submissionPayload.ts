import type { FormDef, PageComponentDef, PageComponentType } from "../components/page-def/builder/pageDef";
import { allFormComponents } from "./formValidation";
import { resolveRespondentIntake } from "./respondentIntake";

export type SubmissionAnswerValue = string | number | boolean | null;

export type SubmissionAnswer = {
  title: string;
  value: SubmissionAnswerValue;
};

export type SubmissionUtm = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
};

export type SubmissionMetadata = {
  sessionId: string;
  referrer: string | null;
  utm: SubmissionUtm;
  locale: string;
  timezone: string;
  deviceType: "mobile" | "tablet" | "desktop";
  screen: { width: number; height: number };
  timing: {
    formOpenedAt: string;
    submittedAt: string;
    timeToCompleteMs: number;
  };
  journey: {
    pageCount: number;
    visitedPageIds: string[];
  };
  client: {
    appVersion: string;
    sdk: "formvity-web";
  };
};

export type PublicSubmissionPayload = {
  answers: Record<string, SubmissionAnswer>;
  respondent: Record<string, string>;
  metadata?: SubmissionMetadata;
};

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

function sessionStorageKey(slug: string) {
  return `formvity-session-${slug}`;
}

export function getOrCreateSessionId(slug: string): string {
  try {
    const existing = sessionStorage.getItem(sessionStorageKey(slug));
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(sessionStorageKey(slug), id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function parseUtm(search: string): SubmissionUtm {
  const params = new URLSearchParams(search);
  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
    term: params.get("utm_term"),
  };
}

function detectDeviceType(): SubmissionMetadata["deviceType"] {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function coerceAnswerValue(type: PageComponentType, raw: string): SubmissionAnswerValue {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  switch (type) {
    case "number":
    case "rating":
    case "scale": {
      const n = Number(trimmed);
      return Number.isFinite(n) ? n : trimmed;
    }
    case "checkbox":
      return trimmed === "true";
    default:
      return raw;
  }
}

function componentTitle(comp: PageComponentDef): string {
  if (typeof comp.label === "string" && comp.label.trim()) return comp.label.trim();
  if (typeof comp.title === "string" && comp.title.trim()) return comp.title.trim();
  return comp.id;
}

function buildAnswers(formDef: FormDef, formValues: Record<string, string>): Record<string, SubmissionAnswer> {
  const answers: Record<string, SubmissionAnswer> = {};
  allFormComponents(formDef).forEach((comp) => {
    if (comp.type === "section") return;
    const raw = formValues[comp.id];
    if (raw === undefined) return;
    const coerced = coerceAnswerValue(comp.type, raw);
    if (typeof coerced === "string" && !coerced.trim()) return;
    answers[comp.id] = {
      title: componentTitle(comp),
      value: coerced,
    };
  });
  return answers;
}

function buildRespondent(
  formDef: FormDef,
  respondentValues: Record<string, string>,
): Record<string, string> {
  const intake = resolveRespondentIntake(formDef);
  const details: Record<string, string> = {};
  intake.fields.forEach((field) => {
    const val = respondentValues[field.id];
    if (val !== undefined) details[field.id] = val;
  });
  return details;
}

export type BuildSubmissionPayloadInput = {
  formDef: FormDef;
  slug: string;
  respondentValues: Record<string, string>;
  formValues: Record<string, string>;
  formOpenedAt: string;
  visitedPageIds: string[];
  submittedAt?: string;
};

export function buildSubmissionMetadata(input: {
  slug: string;
  formDef: FormDef;
  formOpenedAt: string;
  visitedPageIds: string[];
  submittedAt?: string;
}): SubmissionMetadata {
  const submittedAt = input.submittedAt ?? new Date().toISOString();
  const openedMs = Date.parse(input.formOpenedAt);
  const submittedMs = Date.parse(submittedAt);
  const timeToCompleteMs = Number.isFinite(openedMs) && Number.isFinite(submittedMs)
    ? Math.max(0, submittedMs - openedMs)
    : 0;

  const win = typeof window !== "undefined" ? window : null;

  return {
    sessionId: getOrCreateSessionId(input.slug),
    referrer: win?.document.referrer ? win.document.referrer : null,
    utm: parseUtm(win?.location.search ?? ""),
    locale: win?.navigator.language ?? "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    deviceType: detectDeviceType(),
    screen: {
      width: win?.screen.width ?? 0,
      height: win?.screen.height ?? 0,
    },
    timing: {
      formOpenedAt: input.formOpenedAt,
      submittedAt,
      timeToCompleteMs,
    },
    journey: {
      pageCount: input.formDef.pages.length,
      visitedPageIds: [...input.visitedPageIds],
    },
    client: {
      appVersion: APP_VERSION,
      sdk: "formvity-web",
    },
  };
}

export function buildPublicSubmissionPayload(input: BuildSubmissionPayloadInput): PublicSubmissionPayload {
  return {
    answers: buildAnswers(input.formDef, input.formValues),
    respondent: buildRespondent(input.formDef, input.respondentValues),
    metadata: buildSubmissionMetadata({
      slug: input.slug,
      formDef: input.formDef,
      formOpenedAt: input.formOpenedAt,
      visitedPageIds: input.visitedPageIds,
      submittedAt: input.submittedAt,
    }),
  };
}
