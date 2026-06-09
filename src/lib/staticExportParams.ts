/**
 * Placeholder segment for `output: export` (GitHub Pages).
 * Real IDs are read client-side from the URL after hydration.
 */
export const STATIC_EXPORT_SEGMENT = "_";

export function workspaceIdStaticParams() {
  return [{ workspaceId: STATIC_EXPORT_SEGMENT }];
}

export function formIdStaticParams(_parent?: { workspaceId: string }) {
  void _parent;
  return [{ formId: STATIC_EXPORT_SEGMENT }];
}
