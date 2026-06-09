/**
 * GitHub Pages uses `output: export` — no Route Handlers or server proxy.
 * Remove app/api before static build; the SPA calls the backend directly via
 * NEXT_PUBLIC_API_DIRECT=true (see Pages workflow env).
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const apiDir = join(process.cwd(), "app", "api");
if (existsSync(apiDir)) {
  rmSync(apiDir, { recursive: true, force: true });
  console.log("prepare-static-export: removed app/api (not compatible with static export)");
}
