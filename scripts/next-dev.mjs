#!/usr/bin/env node
/**
 * Start `next dev` with an explicit API profile.
 * Sets process.env before Next boots so values beat `.env.local` overrides.
 *
 * Usage: node scripts/next-dev.mjs [render|local]
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const profiles = {
  render: "config/render.env",
  local: "config/local.env",
};

const profile = process.argv[2] ?? "render";
const relPath = profiles[profile];

if (!relPath) {
  console.error(`Unknown profile "${profile}". Use: render | local`);
  process.exit(1);
}

const envFile = resolve(dirname(fileURLToPath(import.meta.url)), "..", relPath);

if (!existsSync(envFile)) {
  console.error(`Missing env file: ${envFile}`);
  process.exit(1);
}

const env = { ...process.env };

for (const line of readFileSync(envFile, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  env[key] = value;
}

console.log(`[dev] API profile: ${profile} → ${env.NEXT_PUBLIC_API_URL ?? "(unset)"}`);

const child = spawn("next", ["dev"], {
  stdio: "inherit",
  env,
  shell: true,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
