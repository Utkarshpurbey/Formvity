import { useEffect, useState } from "react";
import { getFormDraft } from "../api/client";
import { buildFieldLabelMap } from "../lib/formFieldLabels";
import { normalizeFormDef } from "../lib/normalizeFormDef";

export function useFormFieldLabels(workspaceId: string, formId: string, enabled = true) {
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!enabled || !workspaceId || !formId) {
      setFieldLabels({});
      return;
    }

    let dead = false;

    getFormDraft(workspaceId, formId)
      .then((draft) => {
        if (!dead) setFieldLabels(buildFieldLabelMap(normalizeFormDef(draft)));
      })
      .catch(() => {
        if (!dead) setFieldLabels({});
      });

    return () => {
      dead = true;
    };
  }, [workspaceId, formId, enabled]);

  return fieldLabels;
}
