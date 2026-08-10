export type SettingsSection = "general" | "members" | "tags" | "danger";

export const SETTINGS_SECTIONS: {
  id: SettingsSection;
  label: string;
  danger?: boolean;
  adminOnly?: boolean;
}[] = [
  { id: "general", label: "General" },
  { id: "members", label: "Members" },
  { id: "tags", label: "Tags" },
  { id: "danger", label: "Danger zone", danger: true, adminOnly: true },
];

export function settingsPath(workspaceId: string, section: SettingsSection = "general"): string {
  return `/workspaces/${workspaceId}/settings?section=${section}`;
}

export function parseSettingsSection(value: string | null): SettingsSection {
  if (value === "members" || value === "tags" || value === "danger") return value;
  return "general";
}

export { WorkspaceGeneralSettings } from "./WorkspaceGeneralSettings";
export { WorkspaceDangerSettings } from "./WorkspaceDangerSettings";
