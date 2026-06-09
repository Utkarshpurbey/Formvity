"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { FormDef } from "../builder/pageDef";
import { MultiPageForm } from "./MultiPageForm";
import { RespondentIntakeStep } from "./RespondentIntakeStep";
import { buildPublicSubmissionPayload, getOrCreateSessionId } from "../../../lib/submissionPayload";
import { submitPublicForm } from "../../../api/client";

type FormRuntimeProps = {
  formDef: FormDef;
  slug?: string;
  standalone?: boolean;
  preview?: boolean;
};

export function FormRuntime({ formDef, slug, standalone = false, preview = false }: FormRuntimeProps) {
  const [phase, setPhase] = useState<"intake" | "form">("intake");
  const [respondentValues, setRespondentValues] = useState<Record<string, string>>({});
  const formOpenedAtRef = useRef(new Date().toISOString());
  const visitedPageIdsRef = useRef<string[]>([]);

  const totalSteps = useMemo(() => formDef.pages.length + 1, [formDef.pages.length]);

  useEffect(() => {
    if (slug) getOrCreateSessionId(slug);
  }, [slug]);

  const handlePageVisit = useCallback((pageId: string) => {
    if (!visitedPageIdsRef.current.includes(pageId)) {
      visitedPageIdsRef.current.push(pageId);
    }
  }, []);

  const handleFormSubmit = async (formValues: Record<string, string>) => {
    if (preview) {
      toast.success("Preview submit — response recorded locally.");
      return;
    }

    if (!slug) {
      toast.success("Form submitted successfully!");
      return;
    }

    const payload = buildPublicSubmissionPayload({
      formDef,
      slug,
      respondentValues,
      formValues,
      formOpenedAt: formOpenedAtRef.current,
      visitedPageIds: visitedPageIdsRef.current,
    });

    await submitPublicForm(slug, payload);
    toast.success("Form submitted successfully!");
  };

  if (phase === "intake") {
    return (
      <RespondentIntakeStep
        formDef={formDef}
        standalone={standalone}
        stepIndex={1}
        totalSteps={totalSteps}
        onContinue={(values) => {
          setRespondentValues(values);
          setPhase("form");
        }}
      />
    );
  }

  return (
    <MultiPageForm
      formDef={formDef}
      standalone={standalone}
      progressOffset={1}
      totalSteps={totalSteps}
      onPageVisit={handlePageVisit}
      onSubmitted={handleFormSubmit}
    />
  );
}
