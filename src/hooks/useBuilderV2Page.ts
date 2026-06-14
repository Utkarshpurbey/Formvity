"use client";

import { useCallback, useEffect, useState } from "react";
import type { RespondentIntakeSettings } from "../components/page-def/builder/pageDef";
import { DEFAULT_RESPONDENT_INTAKE, isDefaultRespondentIntake } from "../lib/respondentIntake";
import { useBuilderPage } from "./useBuilderPage";

const GUIDE_KEY = "formvity.builderV2Guide";

export type BuilderMode = "intake" | "pages";

export function useBuilderV2Page() {
  const base = useBuilderPage("/builder");
  const [builderMode, setBuilderMode] = useState<BuilderMode>("pages");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(GUIDE_KEY) !== "1") setGuideOpen(true);
  }, []);

  const dismissGuide = useCallback(() => {
    localStorage.setItem(GUIDE_KEY, "1");
    setGuideOpen(false);
  }, []);

  const openGuide = useCallback(() => setGuideOpen(true), []);

  const updateRespondentIntake = useCallback(
    (updater: (prev: RespondentIntakeSettings) => RespondentIntakeSettings) => {
      base.setFormDef((prev) => {
        const current = prev.formSettings?.respondentIntake ?? DEFAULT_RESPONDENT_INTAKE;
        const next = updater(current);
        return {
          ...prev,
          formSettings: {
            ...prev.formSettings,
            respondentIntake: next,
          },
        };
      });
    },
    [base],
  );

  const intakeIsDefault = isDefaultRespondentIntake(base.formDef);

  return {
    ...base,
    builderMode,
    setBuilderMode,
    previewOpen,
    setPreviewOpen,
    guideOpen,
    dismissGuide,
    openGuide,
    updateRespondentIntake,
    intakeIsDefault,
  };
}
