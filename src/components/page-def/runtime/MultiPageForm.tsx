"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { FormDef, PageComponentDef, PageComponentType } from "../builder/pageDef";
import { FormHeader } from "../builder/FormHeader";
import {
  formAccentBarClass,
  formCardShellClass,
  getAppearance,
  getAppearanceStyles,
  getFormCardBoxShadow,
  getInputChromeParentClass,
  getSubmitButtonClass,
} from "../builder/appearance";
import { FormPageShell } from "../builder/FormPageShell";
import { REGISTRY, getVariantProps } from "../builder/registry";
import { getStartPageId } from "../../../lib/normalizeFormDef";
import {
  getNextPageId,
  getPrevPageId,
  validateFormDef,
  validatePageComponents,
} from "../../../lib/formValidation";

function parseActionRef(val: unknown): string[] | null {
  if (typeof val !== "string") return null;
  const parts = val.split(",").map((s) => s.trim());
  const ids = parts.map((s) => s.match(/^@actionDef\.(.+)$/)?.[1]).filter(Boolean) as string[];
  return ids.length > 0 ? ids : null;
}

type MultiPageFormProps = {
  formDef: FormDef;
  onSubmitted?: (values: Record<string, string>) => void;
  /** Full viewport without app sidebar/header (e.g. `/forms`). */
  standalone?: boolean;
};

export function MultiPageForm({ formDef, onSubmitted, standalone = false }: MultiPageFormProps) {
  const startPageId = useMemo(() => getStartPageId(formDef), [formDef]);
  const [currentPageId, setCurrentPageId] = useState(startPageId);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedValues, setSubmittedValues] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setCurrentPageId(startPageId);
    setValues({});
    setFieldErrors({});
    setSubmittedValues(null);
  }, [formDef.id, startPageId]);

  const currentPage = formDef.pages.find((p) => p.id === currentPageId) ?? formDef.pages[0]!;
  const pageIndex = formDef.pages.findIndex((p) => p.id === currentPageId);
  const totalPages = formDef.pages.length;
  const isFirst = pageIndex <= 0;
  const isLast = pageIndex === totalPages - 1;
  const progressPct = totalPages > 1 ? ((pageIndex + 1) / totalPages) * 100 : 100;

  const runActions = (actionIds: string[], value: string, comp: PageComponentDef) => {
    if (!formDef.actions || actionIds.length === 0) return;
    actionIds.forEach((id) => {
      const code = formDef.actions?.[id];
      if (!code) return;
      try {
        const fn = new Function("ctx", code) as (ctx: {
          value: string;
          values: Record<string, string>;
          component: PageComponentDef;
          setValue: (id: string, v: string) => void;
        }) => void;
        fn({
          value,
          values,
          component: comp,
          setValue: (fieldId, next) => setValues((prev) => ({ ...prev, [fieldId]: next })),
        });
      } catch (e) {
        console.error("Action error", id, e);
      }
    });
  };

  const validateCurrentPage = () => {
    const errs = validatePageComponents(currentPage.components, values);
    setFieldErrors((prev) => {
      const next = { ...prev };
      currentPage.components.forEach((c) => {
        delete next[c.id];
      });
      return { ...next, ...errs };
    });
    return errs;
  };

  const goNext = () => {
    const errs = validateCurrentPage();
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the errors on this page.");
      return;
    }
    const nextId = getNextPageId(formDef, currentPageId);
    if (nextId) setCurrentPageId(nextId);
  };

  const goBack = () => {
    const prevId = getPrevPageId(formDef, currentPageId);
    if (prevId) setCurrentPageId(prevId);
  };

  const handleSubmit = () => {
    const pageErrs = validateCurrentPage();
    if (Object.keys(pageErrs).length > 0) {
      toast.error("Please fix the errors on this page.");
      return;
    }
    const allErrs = validateFormDef(formDef, values);
    if (Object.keys(allErrs).length > 0) {
      setFieldErrors(allErrs);
      toast.error("Please fix all errors before submitting.");
      return;
    }
    setFieldErrors({});
    setSubmittedValues(values);
    onSubmitted?.(values);
    toast.success("Form submitted successfully!");
  };

  const appearance = getAppearance(formDef);
  const appearanceVars = getAppearanceStyles(formDef);
  const inputChromeParent = getInputChromeParentClass(appearance);
  const submitButtonClass = getSubmitButtonClass(appearance);
  const shellProps = { appearanceVars, fullViewport: standalone };

  if (submittedValues) {
    const allComponents = formDef.pages.flatMap((p) => p.components);
    return (
      <FormPageShell {...shellProps}>
        <div
          className={`mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6 ${standalone ? "py-8 sm:py-10" : "py-10 sm:py-14"}`}
        >
          <div
            className={`${formCardShellClass} overflow-hidden bg-[color:var(--fb-surface)] p-6 shadow-lg sm:p-10`}
            style={{ boxShadow: getFormCardBoxShadow(formDef) }}
          >
            <div className={formAccentBarClass} />
            <FormHeader
              variant="static"
              pageDef={{ title: formDef.title, description: formDef.description }}
            />
            <div className="border-t border-[color:color-mix(in_srgb,var(--fb-text)_8%,var(--fb-surface))] px-6 py-8 sm:px-10">
              <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--fb-primary)_12%,var(--fb-surface))] text-[color:var(--fb-primary)]">
                <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[color:var(--fb-text)]">Your response has been recorded</h2>
              <p className="mt-2 text-sm text-[color:var(--fb-muted)]">Thank you for submitting this form.</p>
              <dl className="mt-8 space-y-3 border-t border-[color:color-mix(in_srgb,var(--fb-text)_8%,var(--fb-surface))] pt-6">
                {allComponents.map((comp) => {
                  const val = submittedValues[comp.id];
                  if (val === undefined || (typeof val === "string" && !val.trim())) return null;
                  const label = (comp.label as string) || comp.id;
                  return (
                    <div key={comp.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                      <dt className="shrink-0 text-sm font-medium text-[color:var(--fb-muted)] sm:w-36">{label}</dt>
                      <dd className="text-sm text-[color:var(--fb-text)] break-words">{String(val)}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell {...shellProps}>
      <div
        className={`mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6 ${standalone ? "py-6 sm:py-8" : "py-8 sm:py-12"}`}
      >
        <div
          className={`relative flex flex-col ${formCardShellClass} overflow-hidden bg-[color:var(--fb-surface)] text-[color:var(--fb-text)]`}
          style={{ boxShadow: getFormCardBoxShadow(formDef) }}
        >
          <div className={formAccentBarClass} />

          <FormHeader
            variant="static"
            pageDef={{ title: formDef.title, description: formDef.description }}
          />

          <div
            key={currentPageId}
            className={`form-step-enter ${inputChromeParent} px-5 py-6 sm:px-10 sm:py-8`}
          >
            <div className="space-y-8">
              {currentPage.components.length === 0 ? (
                <p className="py-12 text-center text-sm text-[color:var(--fb-muted)]">No questions on this page.</p>
              ) : null}
              {currentPage.components.map((comp) => {
                const { id, type, onChange: onChangeRef, ...rawProps } = comp;
                const Component = REGISTRY[type as PageComponentType];
                if (!Component) return null;

                const value = values[id] ?? "";
                const actionIds = parseActionRef(onChangeRef);
                const handleChange = (next: string) => {
                  setValues((prev) => ({ ...prev, [id]: next }));
                  setFieldErrors((prev) => ({ ...prev, [id]: "" }));
                  if (actionIds?.length) runActions(actionIds, next, comp);
                };

                const props: Record<string, unknown> = {
                  value,
                  onChange: handleChange,
                  ...rawProps,
                  ...getVariantProps(type as PageComponentType),
                };
                if ((type === "select" || type === "radio" || type === "multiselect") && !Array.isArray(props.options)) {
                  props.options = [];
                }

                return (
                  <div key={id}>
                    <Component {...(props as Record<string, unknown>)} />
                    {fieldErrors[id] ? (
                      <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
                        {fieldErrors[id]}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[color:color-mix(in_srgb,var(--fb-text)_8%,var(--fb-surface))] px-5 py-5 sm:px-10 sm:py-6">
            {totalPages > 1 ? (
              <div className="mb-5 space-y-2">
                <div
                  className="h-0.5 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--fb-text)_12%,var(--fb-surface))]"
                  role="progressbar"
                  aria-valuenow={pageIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={totalPages}
                  aria-label={`Page ${pageIndex + 1} of ${totalPages}`}
                >
                  <div
                    className="h-full rounded-full bg-[color:var(--fb-primary)] transition-[width] duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-[color:var(--fb-muted)]">
                  Page {pageIndex + 1} of {totalPages}
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-[4.5rem]">
                {!isFirst ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="text-sm font-medium text-[color:var(--fb-primary)] hover:underline"
                  >
                    Back
                  </button>
                ) : null}
              </div>
              {isLast ? (
                <button type="button" onClick={handleSubmit} className={submitButtonClass}>
                  Submit
                </button>
              ) : (
                <button type="button" onClick={goNext} className={submitButtonClass}>
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormPageShell>
  );
}
