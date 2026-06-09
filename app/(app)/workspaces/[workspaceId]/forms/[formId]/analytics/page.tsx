"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormId, useWorkspaceId } from "@/src/hooks/useRouteIds";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import {
  FormSubNav,
  QuestionBreakdownPanel,
  ResponseTimelineChart,
  SubmissionsTable,
} from "@/src/components/form/index";
import { FormLifecycleBadge } from "@/src/components/ui/FormLifecycleBadge";
import { PageLoader, Skeleton, Spinner, StatCard } from "@/src/components/ui/index";
import { useFormAnalytics } from "@/src/hooks/useFormAnalytics";
import { deriveFormLifecycle } from "@/src/lib/publish";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchForms,
  fetchPublishStatus,
  selectFormsForWorkspace,
  selectFormsInitialLoading,
} from "@/src/store/slices/formsSlice";
import { fetchWorkspaces } from "@/src/store/slices/workspaceSlice";

const TIMELINE_OPTIONS = [7, 30, 90] as const;
const PAGE_SIZE = 20;

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return new Date(parsed).toLocaleString();
}

export default function FormAnalyticsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = useWorkspaceId();
  const formId = useFormId();
  const { user, ready } = useAppSelector((s) => s.auth);
  const workspaces = useAppSelector((s) => s.workspace.list);
  const forms = useAppSelector((s) => selectFormsForWorkspace(s, workspaceId));
  const formsLoading = useAppSelector((s) => selectFormsInitialLoading(s, workspaceId));
  const publication = useAppSelector((s) => s.forms.publicationByForm[formId]);
  const publishStatus = useAppSelector((s) => s.forms.publishStatus);
  const lastPublishResult = useAppSelector((s) => s.forms.lastPublishResult);

  const [days, setDays] = useState<(typeof TIMELINE_OPTIONS)[number]>(30);
  const [page, setPage] = useState(0);

  const form = useMemo(() => forms.find((f) => f.id === formId), [forms, formId]);
  const workspace = useMemo(
    () => workspaces.find((w) => w.workSpaceId === workspaceId),
    [workspaces, workspaceId],
  );

  const lifecycle = useMemo(
    () =>
      deriveFormLifecycle({
        formStatus: form?.status,
        notFound: ready && !formsLoading && !form,
        publishStatus,
        publication,
        lastPublishResult,
      }),
    [form?.status, ready, formsLoading, form, publishStatus, publication, lastPublishResult],
  );

  const { summary, timeline, questions, submissions, loading, refreshing, error, reload } =
    useFormAnalytics(workspaceId, formId, { days, page, size: PAGE_SIZE });

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user || !workspaceId) return;
    dispatch(fetchWorkspaces());
    dispatch(fetchForms(workspaceId));
  }, [ready, user, workspaceId, dispatch]);

  useEffect(() => {
    if (!ready || !user || !workspaceId || !formId) return;
    dispatch(fetchPublishStatus({ workspaceId, formId }));
  }, [ready, user, workspaceId, formId, dispatch]);

  if (!ready || (formsLoading && !form)) {
    return <PageLoader message="Loading form…" className="min-h-[50vh]" />;
  }

  if (!workspaceId || !formId || !form) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-semibold text-slate-900">Form not available</p>
        <button
          type="button"
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
          className="text-sm text-violet-600 hover:underline"
        >
          Back to workspace
        </button>
      </div>
    );
  }

  return (
    <AppPageContainer>
      <nav className="text-sm text-slate-500">
        <button type="button" onClick={() => router.push("/workspaces")} className="hover:text-violet-600">
          Workspaces
        </button>
        <span className="mx-2">/</span>
        <button
          type="button"
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
          className="hover:text-violet-600"
        >
          {workspace?.workSpaceName ?? "Workspace"}
        </button>
        <span className="mx-2">/</span>
        <button
          type="button"
          onClick={() => router.push(`/workspaces/${workspaceId}/forms/${formId}`)}
          className="hover:text-violet-600"
        >
          {form.title.trim() || "Untitled form"}
        </button>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">Analytics</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
            <FormLifecycleBadge lifecycle={lifecycle} size="md" />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Response trends and question breakdown for{" "}
            <span className="font-medium text-slate-700">{form.title.trim() || "Untitled form"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => reload()}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? <Spinner size="sm" /> : null}
            Refresh
          </button>
          <button
            type="button"
            onClick={() => router.push(`/builder/v2?workspaceId=${workspaceId}&formId=${formId}`)}
            className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Open in builder
          </button>
        </div>
      </div>

      <FormSubNav workspaceId={workspaceId} formId={formId} />

      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !summary ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Total responses"
              value={summary?.totalResponses ?? 0}
              hint="All time"
            />
            <StatCard label="Today" value={summary?.responsesToday ?? 0} hint="Since midnight" />
            <StatCard
              label="First response"
              value={summary?.firstResponseAt ? formatDateTime(summary.firstResponseAt).split(",")[0] : "—"}
              hint={summary?.firstResponseAt ? formatDateTime(summary.firstResponseAt) : "No responses yet"}
            />
            <StatCard
              label="Publish version"
              value={summary?.currentPublicationVersion ?? lastPublishResult?.version ?? "—"}
              hint={
                summary?.lastResponseAt
                  ? `Last response ${formatDateTime(summary.lastResponseAt)}`
                  : "Live snapshot version"
              }
            />
          </>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Response timeline</h2>
            <p className="mt-0.5 text-xs text-slate-500">Daily submissions · zero-filled gaps</p>
          </div>
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            {TIMELINE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  days === option
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option}d
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          {loading && timeline.length === 0 ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : (
            <ResponseTimelineChart points={timeline} />
          )}
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Question breakdown</h2>
          <p className="mt-0.5 text-xs text-slate-500">Answer distributions per field</p>
        </div>
        {loading && questions.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : (
          <QuestionBreakdownPanel questions={questions} />
        )}
      </section>

      <div className="mt-8">
        <SubmissionsTable
          rows={submissions?.content ?? []}
          loading={loading && !submissions}
          page={submissions?.page ?? page}
          totalPages={submissions?.totalPages ?? 1}
          totalElements={submissions?.totalElements ?? 0}
          pageSize={submissions?.size ?? PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </AppPageContainer>
  );
}
