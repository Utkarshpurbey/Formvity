import type { WorkspaceRole } from "../../api/types";
import { roleLabel } from "../../lib/permissions";

const ROLE_STYLES: Record<WorkspaceRole, string> = {
  ADMIN: "bg-violet-100 text-violet-800 ring-violet-200",
  EDITOR: "bg-sky-100 text-sky-800 ring-sky-200",
  VIEWER: "bg-slate-100 text-slate-700 ring-slate-200",
  ATTENDEE: "bg-amber-100 text-amber-800 ring-amber-200",
};

type RoleBadgeProps = {
  role: WorkspaceRole;
  className?: string;
};

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_STYLES[role]} ${className}`}
    >
      {roleLabel(role)}
    </span>
  );
}
