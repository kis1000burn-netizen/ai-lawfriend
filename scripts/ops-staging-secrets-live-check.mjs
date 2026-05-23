/**
 * Staging Secrets live phase — env verify + health + AI Core role smoke (remote).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  assertStagingHttpsOrigin,
  resolveStagingBaseUrl,
} from "./lib/staging-secrets-env-policy.mjs";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const FETCH_TIMEOUT_MS = Number(process.env.OPS_SMOKE_FETCH_TIMEOUT_MS || "30000");

function runNodeScript(scriptName, extraArgs = []) {
  const scriptPath = join(scriptsDir, scriptName);
  const r = spawnSync(process.execPath, [scriptPath, ...extraArgs], {
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) {
    throw new Error(`${scriptName} failed with exit ${r.status ?? "unknown"}`);
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkHealth(baseUrl) {
  const url = `${baseUrl.replace(/\/$/, "")}/api/health`;
  console.log(`\n[ops:staging-secrets-live-check] GET ${url}`);
  const res = await fetchWithTimeout(url).catch(() => null);
  if (!res) {
    throw new Error(`health unreachable: ${url}`);
  }
  const json = await res.json().catch(() => ({}));
  console.log(`health status=${res.status} body.ok=${json.ok}`);
  if (res.status !== 200 || json.ok !== true) {
    throw new Error(`health check failed (${res.status})`);
  }
  console.log("PASS — /api/health");
}

async function main() {
  const baseUrl = resolveStagingBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Set STAGING_BASE_URL or PLAYWRIGHT_BASE_URL to the staging https origin.",
    );
  }

  const allowLocal = process.env.STAGING_ALLOW_LOCAL === "1";
  const originCheck = assertStagingHttpsOrigin(baseUrl, { allowLocalhost: allowLocal });
  if (!originCheck.ok) {
    throw new Error(originCheck.message);
  }

  console.log(`[ops:staging-secrets-live-check] target=${originCheck.origin}`);

  runNodeScript("verify-staging-secrets.mjs", ["--db-ping", "--oauth-smoke"]);

  await checkHealth(originCheck.origin);

  if (!process.env.OPS_SMOKE_CASE_ID?.trim()) {
    throw new Error(
      "OPS_SMOKE_CASE_ID is required for remote role smoke — create a staging smoke case and set the id.",
    );
  }

  process.env.PLAYWRIGHT_BASE_URL = originCheck.origin;
  runNodeScript("ops-ai-core-role-smoke.mjs");

  console.log("\nops:staging-secrets-live-check PASS");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
