import fs from "node:fs";
import path from "node:path";

/**
 * Shared Production Release Readiness RC block (Phase 16-C).
 * Static gates only — live cutover is ops:production-release-cutover-live-check.
 */
export function createProductionReleaseReadinessRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Production Release Readiness RC file: ${relativePath}`);
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

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER",
  "EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC",
];

export function runProductionReleaseReadinessRcBlock(
  execSync,
  root,
  label = "verify:production-release-readiness-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createProductionReleaseReadinessRcFsHelpers(root);

  assertFileExists("docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_CUTOVER_CHECKLIST.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md");
  assertFileExists("docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_NOTE_TEMPLATE.md");
  assertFileExists("docs/operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md");
  assertFileExists("src/features/platform/production-release-readiness-rc-lock.ts");
  assertFileExists("src/features/platform/production-release-readiness-rc-lock.test.ts");
  assertFileExists("scripts/verify-production-env-readiness.mjs");
  assertFileExists("scripts/lib/production-env-readiness-policy.mjs");
  assertFileExists("scripts/ops-production-release-cutover-live-check.mjs");

  assertIncludes("src/features/platform/production-release-readiness-rc-lock.ts", [
    "PRODUCTION_RELEASE_READINESS_RC_LOCK_MARKER_PHASE16C",
    "ops:production-release-cutover-live-check",
    "verify:production-env-readiness",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_CUTOVER_CHECKLIST.md", [
    "DB backup",
    "rollbackTargetCommit",
    "Kakao",
    "OAuth",
    "document-intelligence",
    "OPS_SMOKE",
    "minimum rollback",
    "release note",
    "post-deploy monitoring",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md", [
    "verify:production-env-readiness",
    "ops:production-release-cutover-live-check",
    "rollbackTargetCommit",
  ]);

  console.log(`[${label}] production env readiness (relaxed static) …`);
  const relaxedCiEnv = {
    ...process.env,
    PRODUCTION_ENV_VERIFY_RELAXED: "1",
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_ENV: "production",
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://ci:ci@127.0.0.1:5432/ci",
    JWT_SECRET: process.env.JWT_SECRET ?? "ci-production-jwt-secret-minimum-32-characters",
    CRON_SECRET: process.env.CRON_SECRET ?? "ci-production-cron-secret-minimum-32-chars",
    APP_BASE_URL: process.env.APP_BASE_URL ?? "https://production.example.com",
    AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE === "false" || process.env.AUTH_COOKIE_SECURE === "0"
      ? "true"
      : (process.env.AUTH_COOKIE_SECURE ?? "true"),
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "16-C.1",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "sk-ci-openai-placeholder",
    OPENAI_DOCUMENT_GENERATE_MODEL: process.env.OPENAI_DOCUMENT_GENERATE_MODEL ?? "gpt-4o-mini",
    OPENAI_PARAGRAPH_REWRITE_MODEL: process.env.OPENAI_PARAGRAPH_REWRITE_MODEL ?? "gpt-4o-mini",
    OPENAI_CASE_SUMMARY_MODEL: process.env.OPENAI_CASE_SUMMARY_MODEL ?? "gpt-4o-mini",
    CASE_SUMMARY_AI_MODE: process.env.CASE_SUMMARY_AI_MODE ?? "stub",
    AI_GOVERNANCE_AI_ENABLED: process.env.AI_GOVERNANCE_AI_ENABLED ?? "false",
    AI_GOVERNANCE_TENANT_ID: process.env.AI_GOVERNANCE_TENANT_ID ?? "ci-tenant",
    AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET: process.env.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET ?? "1000000",
    AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE: process.env.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE ?? "100",
    ILLEGAL_LENDING_STORAGE_DRIVER: process.env.ILLEGAL_LENDING_STORAGE_DRIVER ?? "local",
    ILLEGAL_LENDING_UPLOAD_ROOT: process.env.ILLEGAL_LENDING_UPLOAD_ROOT ?? ".private-uploads",
    PRODUCTION_KAKAO_ALIMTALK_MODE: process.env.PRODUCTION_KAKAO_ALIMTALK_MODE ?? "stub",
    PRODUCTION_EMAIL_DELIVERY_MODE: process.env.PRODUCTION_EMAIL_DELIVERY_MODE ?? "stub",
  };
  execSync("npm run verify:production-env-readiness", {
    stdio: "inherit",
    cwd: root,
    env: relaxedCiEnv,
  });

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
    "verify:aibeopchin-production-release-readiness-rc",
    "verify:production-env-readiness",
    "ops:production-release-cutover-live-check",
  ]) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RC_LOCK_SUMMARY.md", [
    "16-C",
    "Production Release Readiness",
  ]);

  console.log(`[${label}] running production-release-readiness-rc-lock Vitest …`);
  execSync("npm run test -- src/features/platform/production-release-readiness-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
