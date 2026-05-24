/**
 * Phase 16-B — Staging deploy readiness live orchestrator.
 * env + DB ping + OAuth start + migration status + health + role/portal/upload smokes.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  assertStagingHttpsOrigin,
  resolveStagingBaseUrl,
} from "./lib/staging-secrets-env-policy.mjs";

const scriptsDir = dirname(fileURLToPath(import.meta.url));

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

  console.log(`[ops:staging-deploy-readiness-live-check] target=${originCheck.origin}`);

  runNodeScript("verify-staging-secrets.mjs", ["--db-ping", "--oauth-smoke"]);
  runNodeScript("verify-staging-migration-deploy-readiness.mjs", ["--status"]);

  process.env.PLAYWRIGHT_BASE_URL = originCheck.origin;

  if (!process.env.OPS_SMOKE_CASE_ID?.trim()) {
    throw new Error(
      "OPS_SMOKE_CASE_ID is required — create a staging smoke case with portal access and assignments.",
    );
  }

  runNodeScript("ops-ai-core-role-smoke.mjs");
  runNodeScript("ops-staging-client-portal-smoke.mjs");
  runNodeScript("ops-staging-document-upload-smoke.mjs");

  console.log("\nops:staging-deploy-readiness-live-check PASS (Phase 16-B staging live smoke stack)");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
