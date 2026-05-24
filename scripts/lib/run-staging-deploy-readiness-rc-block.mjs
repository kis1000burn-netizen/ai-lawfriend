import fs from "node:fs";
import path from "node:path";

/**
 * Shared Staging Deploy Readiness RC block (Phase 16-B).
 * Static gates only — live smoke is ops:staging-deploy-readiness-live-check.
 */
export function createStagingDeployReadinessRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Staging Deploy Readiness RC file: ${relativePath}`);
    }
  }

  function assertIncludes(relativePath, terms) {
    const content = readFile(relativePath);
    for (const term of terms) {
      if (!content.includes(term)) {
        throw new Error(`Missing term "${term}" in ${relativePath}`);
      }
    }
  }

  return { readFile, assertFileExists, assertIncludes };
}

const LIVE_SMOKE_SCRIPTS = [
  "scripts/ops-ai-core-role-smoke.mjs",
  "scripts/ops-staging-client-portal-smoke.mjs",
  "scripts/ops-staging-document-upload-smoke.mjs",
  "scripts/ops-staging-deploy-readiness-live-check.mjs",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC",
];

export function runStagingDeployReadinessRcBlock(
  execSync,
  root,
  label = "verify:staging-deploy-readiness-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createStagingDeployReadinessRcFsHelpers(root);

  assertFileExists("docs/platform/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/platform/AIBEOPCHIN_STAGING_DEPLOY_READINESS_CHECKLIST.md");
  assertFileExists("docs/operations/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md");
  assertFileExists("src/features/platform/staging-deploy-readiness-rc-lock.ts");
  assertFileExists("src/features/platform/staging-deploy-readiness-rc-lock.test.ts");
  assertFileExists("scripts/verify-staging-secrets.mjs");
  assertFileExists("scripts/verify-staging-migration-deploy-readiness.mjs");
  assertFileExists("scripts/lib/ops-staging-smoke-common.mjs");

  for (const script of LIVE_SMOKE_SCRIPTS) {
    assertFileExists(script);
  }

  assertIncludes("src/features/platform/staging-deploy-readiness-rc-lock.ts", [
    "STAGING_DEPLOY_READINESS_RC_LOCK_MARKER_PHASE16B",
    "ops:staging-deploy-readiness-live-check",
    "ops:staging-client-portal-smoke",
    "ops:staging-document-upload-smoke",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_STAGING_DEPLOY_READINESS_CHECKLIST.md", [
    "OAuth",
    "db:deploy",
    "rollback",
    "Build artifact",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md", [
    "verify:staging-secrets",
    "ops:staging-deploy-readiness-live-check",
    "OPS_SMOKE_CASE_ID",
  ]);

  console.log(`[${label}] migration deploy readiness (static) …`);
  execSync("npm run verify:staging-migration-deploy-readiness", {
    stdio: "inherit",
    cwd: root,
  });

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  for (const script of [
    "verify:aibeopchin-staging-deploy-readiness-rc",
    "verify:staging-migration-deploy-readiness",
    "ops:staging-deploy-readiness-live-check",
    "ops:staging-client-portal-smoke",
    "ops:staging-document-upload-smoke",
  ]) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_FULL_LEGAL_OPS_PLATFORM_RC_LOCK_SUMMARY.md", [
    "16-B",
    "Staging Deploy Readiness",
  ]);

  console.log(`[${label}] running staging-deploy-readiness-rc-lock Vitest …`);
  execSync("npm run test -- src/features/platform/staging-deploy-readiness-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
