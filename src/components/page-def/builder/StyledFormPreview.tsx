import type { FormDef } from "./pageDef";
import { MultiPageForm } from "../runtime/MultiPageForm";

export interface StyledFormPreviewProps {
  formDef: FormDef;
  className?: string;
}

/** Full form preview with appearance and multi-page navigation. */
export function StyledFormPreview({ formDef, className = "" }: StyledFormPreviewProps) {
  return (
    <div className={className}>
      <MultiPageForm formDef={formDef} />
    </div>
  );
}
