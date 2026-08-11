/** Stable accent color from workspace name for avatars */
export function workspaceAvatarStyle(name: string): { background: string; color: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    background: `hsl(${hue} 68% 94%)`,
    color: `hsl(${hue} 55% 32%)`,
  };
}

export function workspaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "WS";
}

export function parseWorkspaceIdFromPath(path: string): string | null {
  const match = path.match(/^\/workspaces\/([^/]+)/);
  return match?.[1] ?? null;
}
