"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type WorkspaceSubNavProps = {
  workspaceId: string;
  workspaceName?: string;
};

const tabs = (workspaceId: string) => [
  { href: `/workspaces/${workspaceId}`, label: "Forms", exact: true },
  { href: `/workspaces/${workspaceId}/settings`, label: "Settings", exact: false },
];

export function WorkspaceSubNav({ workspaceId, workspaceName }: WorkspaceSubNavProps) {
  const pathname = usePathname();

  return (
    <div className="mt-6 border-b border-slate-200">
      <nav className="-mb-px flex gap-6" aria-label="Workspace sections">
        {tabs(workspaceId).map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                active
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {workspaceName ? (
        <p className="sr-only">Workspace: {workspaceName}</p>
      ) : null}
    </div>
  );
}
