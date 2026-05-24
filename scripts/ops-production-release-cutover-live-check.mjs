/**
 * Phase 16-C — Production release cutover live orchestrator.
 * Run only against production origin after backup + migrate deploy.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { assertStagingHttpsOrigin } from "./lib/staging-secrets-env-policy.mjs";
import { resolveProductionBaseUrl } from "./lib/production-env-readiness-policy.mjs";

const scriptsDir = dirname(fileURLToPath(import.meta.url));

function runNodeScript(scriptName, extraArgs = [], envPatch = {}) {
  const scriptPath = join(scriptsDir, scriptName);
  const r = spawnSync(process.execPath, [scriptPath, ...extraArgs], {
    stdio: "inherit",
    env: { ...process.env, ...envPatch },
  });
  if (r.status !== 0) {
    throw new Error(`${scriptName} failed with exit ${r.status ?? "unknown"}`);
  }
}

async function main() {
  const baseUrl = resolveProductionBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Set PRODUCTION_BASE_URL, PLAYWRIGHT_BASE_URL, or APP_BASE_URL to the production https origin.",
    );
  }

  const originCheck = assertStagingHttpsOrigin(baseUrl, { allowLocalhost: false });
  if (!originCheck.ok) {
    throw new Error(originCheck.message);
  }

  console.log(`[ops:production-release-cutover-live-check] target=${originCheck.origin}`);
  console.log(
    "[ops:production-release-cutover-live-check] confirm DB backup + rollbackTargetCommit recorded before proceeding.",
  );

  runNodeScript("verify-production-env-readiness.mjs", ["--db-ping", "--oauth-smoke"]);
  runNodeScript("verify-staging-migration-deploy-readiness.mjs", ["--status"]);

  process.env.PLAYWRIGHT_BASE_URL = originCheck.origin;
  process.env.PRODUCTION_BASE_URL = originCheck.origin;

  if (!process.env.OPS_SMOKE_CASE_ID?.trim()) {
    throw new Error(
      "OPS_SMOKE_CASE_ID is required — production smoke case with portal access and assignments.",
    );
  }

  runNodeScript("ops-ai-core-role-smoke.mjs");
  runNodeScript("ops-staging-client-portal-smoke.mjs");
  runNodeScript("ops-staging-document-upload-smoke.mjs");

  console.log(
    "\nops:production-release-cutover-live-check PASS (Phase 16-C production cutover live smoke)",
  );
  console.log(
    "Next: complete post-deploy monitoring checklist — docs/operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md",
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
