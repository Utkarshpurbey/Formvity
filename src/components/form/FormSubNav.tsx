"use client";

import { usePathname, useRouter } from "next/navigation";
import { stripAppBasePath } from "../../utils/appBasePath";
import { navigateApp } from "../../utils/appNavigate";

type FormSubNavProps = {
  workspaceId: string;
  formId: string;
};

const tabs = (workspaceId: string, formId: string) => [
  {
    href: `/workspaces/${workspaceId}/forms/${formId}`,
    label: "Overview",
    match: (path: string) => path === `/workspaces/${workspaceId}/forms/${formId}`,
  },
  {
    href: `/workspaces/${workspaceId}/forms/${formId}/analytics`,
    label: "Analytics",
    match: (path: string) => path.startsWith(`/workspaces/${workspaceId}/forms/${formId}/analytics`),
  },
];

export function FormSubNav({ workspaceId, formId }: FormSubNavProps) {
  const router = useRouter();
  const pathname = stripAppBasePath(usePathname() ?? "/");

  return (
    <div className="mt-6 border-b border-slate-200">
      <nav className="-mb-px flex gap-6" aria-label="Form sections">
        {tabs(workspaceId, formId).map((tab) => {
          const active = tab.match(pathname);
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => navigateApp(tab.href, router)}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                active
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
