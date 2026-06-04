import { stripAppBasePath } from "../../utils/appBasePath";

/** Routes where GET /auth/me is skipped on initial load. */
export function isPublicAuthPath(pathname: string): boolean {
  const path = stripAppBasePath(pathname.split("?")[0] || "/");
  return (
    path === "/" ||
    path === "/home" ||
    path === "/login" ||
    path === "/register" ||
    path === "/templates" ||
    path.startsWith("/r/")
  );
}
