"use client";

import { useState } from "react";
import type { FormDef } from "../builder/pageDef";
import {
  formAccentBarClass,
  formCardShellClass,
  getAppearanceStyles,
  getFormCardBoxShadow,
  getInputChromeParentClass,
  getSubmitButtonClass,
} from "../builder/appearance";
import { FormPageShell } from "../builder/FormPageShell";
import { REGISTRY, getVariantProps } from "../widgets";
import type { PageComponentType } from "../builder/pageDef";
import {
  resolveRespondentIntake,
  validateRespondentIntake,
} from "../../../lib/respondentIntake";
import { getAppearance } from "../builder/appearance";

type RespondentIntakeStepProps = {
  formDef: FormDef;
  standalone?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  onContinue: (values: Record<string, string>) => void;
};

export function RespondentIntakeStep({
  formDef,
  standalone = false,
  stepIndex = 1,
  totalSteps = 1,
  onContinue,
}: RespondentIntakeStepProps) {
  const intake = resolveRespondentIntake(formDef);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const appearance = getAppearance(formDef);
  const appearanceVars = getAppearanceStyles(formDef);
  const inputChromeParent = getInputChromeParentClass(appearance);
  const submitButtonClass = getSubmitButtonClass(appearance);
  const progressPct = totalSteps > 1 ? (stepIndex / totalSteps) * 100 : 100;

  const handleContinue = () => {
    const errs = validateRespondentIntake(intake.fields, values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onContinue(values);
  };

  return (
    <FormPageShell appearanceVars={appearanceVars} fullViewport={standalone}>
      <div
        className={`mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6 ${standalone ? "py-6 sm:py-8" : "py-8 sm:py-12"}`}
      >
        <div
          className={`relative flex flex-col ${formCardShellClass} overflow-hidden bg-[color:var(--fb-surface)] text-[color:var(--fb-text)]`}
          style={{ boxShadow: getFormCardBoxShadow(formDef) }}
        >
          <div className={formAccentBarClass} />
          <div className="border-b border-[color:color-mix(in_srgb,var(--fb-text)_8%,var(--fb-surface))] px-5 py-6 sm:px-10 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--fb-muted)]">
              Respondent details
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[color:var(--fb-text)]">
              {intake.title ?? "Before we begin"}
            </h1>
            {intake.description ? (
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--fb-muted)]">{intake.description}</p>
            ) : null}
          </div>

          <div className={`${inputChromeParent} space-y-6 px-5 py-6 sm:px-10 sm:py-8`}>
            {intake.fields.map((field) => {
              const widgetType = field.type === "number" ? "number" : field.type;
              const Component = REGISTRY[widgetType as PageComponentType];
              if (!Component) return null;
              return (
                <div key={field.id}>
                  <Component
                    value={values[field.id] ?? ""}
                    onChange={(next: string) => {
                      setValues((prev) => ({ ...prev, [field.id]: next }));
                      setErrors((prev) => ({ ...prev, [field.id]: "" }));
                    }}
                    label={field.label}
                    required={field.required}
                    placeholder={field.placeholder}
                    {...getVariantProps(widgetType as PageComponentType)}
                  />
                  {errors[field.id] ? (
                    <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
                      {errors[field.id]}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[color:color-mix(in_srgb,var(--fb-text)_8%,var(--fb-surface))] px-5 py-5 sm:px-10 sm:py-6">
            {totalSteps > 1 ? (
              <div className="mb-5 space-y-2">
                <div
                  className="h-0.5 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--fb-text)_12%,var(--fb-surface))]"
                  role="progressbar"
                  aria-valuenow={stepIndex}
                  aria-valuemin={1}
                  aria-valuemax={totalSteps}
                >
                  <div
                    className="h-full rounded-full bg-[color:var(--fb-primary)] transition-[width] duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-[color:var(--fb-muted)]">
                  Step {stepIndex} of {totalSteps}
                </p>
              </div>
            ) : null}
            <div className="flex justify-end">
              <button type="button" onClick={handleContinue} className={submitButtonClass}>
                Continue to form
              </button>
            </div>
          </div>
        </div>
      </div>
    </FormPageShell>
  );
}
