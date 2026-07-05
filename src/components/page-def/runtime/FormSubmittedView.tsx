"use client";

import type { FormDef } from "../builder/pageDef";
import { FormHeader } from "../builder/FormHeader";
import {
  formAccentBarClass,
  formCardShellClass,
  getAppearanceStyles,
  getFormCardBoxShadow,
} from "../builder/appearance";
import { FormPageShell } from "../builder/FormPageShell";

type FormSubmittedViewProps = {
  formDef: FormDef;
  standalone?: boolean;
  onFillAnother?: () => void;
};

export function FormSubmittedView({ formDef, standalone = false, onFillAnother }: FormSubmittedViewProps) {
  const appearanceVars = getAppearanceStyles(formDef);
  const shellProps = { appearanceVars, fullViewport: standalone };

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
            <h2 className="text-xl font-semibold text-[color:var(--fb-text)]">Thank you for your response</h2>
            <p className="mt-2 text-sm text-[color:var(--fb-muted)]">
              Your submission has been received successfully.
            </p>
            {onFillAnother ? (
              <button
                type="button"
                onClick={onFillAnother}
                className="mt-8 text-sm font-medium text-[color:var(--fb-primary)] hover:underline"
              >
                Submit another response
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </FormPageShell>
  );
}
