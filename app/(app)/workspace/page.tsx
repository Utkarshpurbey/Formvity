import { redirect } from "next/navigation";

/** Legacy route — dashboard moved to /workspaces */
export default function LegacyWorkspaceRedirect() {
  redirect("/workspaces");
}
