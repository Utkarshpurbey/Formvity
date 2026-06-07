import { useMemo } from "react";
import { deriveFormLifecycle, type FormLifecycle } from "../lib/formLifecycle";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPublishStatus, selectFormsForWorkspace } from "../store/slices/formsSlice";

export function useFormLifecycle(workspaceId: string, formId: string, options?: { notFound?: boolean }) {
  const dispatch = useAppDispatch();
  const form = useAppSelector((s) =>
    selectFormsForWorkspace(s, workspaceId).find((f) => f.id === formId),
  );
  const publication = useAppSelector((s) => s.forms.publicationByForm[formId]);
  const publishStatus = useAppSelector((s) => s.forms.publishStatus);
  const lastPublishResult = useAppSelector((s) => s.forms.lastPublishResult);

  const lifecycle = useMemo(
    (): FormLifecycle =>
      deriveFormLifecycle({
        formStatus: form?.status,
        notFound: options?.notFound,
        publishStatus: publishStatus?.slug || publishStatus?.status ? publishStatus : null,
        publication,
        lastPublishResult,
      }),
    [form?.status, options?.notFound, publishStatus, publication, lastPublishResult],
  );

  const refresh = () => {
    if (workspaceId && formId) {
      dispatch(fetchPublishStatus({ workspaceId, formId }));
    }
  };

  return { lifecycle, form, refresh };
}
