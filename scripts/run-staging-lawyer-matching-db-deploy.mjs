/**
 * Staging lawyer-matching migration deploy — locked execution order.
 *
 * Requires:
 *   DIAGNOSTIC_TEST_ENV=staging
 *   TEST_DATABASE_URL=postgresql://...
 *
 * Order:
 *   1) staging DB allowlist runtime verification
 *   2) active CaseAssignment duplicate pre-check
 *   3) DATABASE_URL := TEST_DATABASE_URL (only after allowlist PASS)
 *   4) prisma migrate deploy
 *   5) post-deploy schema/index presence check
 *
 * Usage:
 *   $env:DIAGNOSTIC_TEST_ENV="staging"
 *   $env:TEST_DATABASE_URL="postgresql://..."
 *   npm run db:deploy:staging-lawyer-matching
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();

function fail(message) {
  console.error(`FAIL — ${message}`);
  process.exit(1);
}

function assertStagingEnv() {
  const testEnvironment = (process.env.DIAGNOSTIC_TEST_ENV ?? "").trim();
  if (testEnvironment !== "staging") {
    fail('DIAGNOSTIC_TEST_ENV must be "staging" before any staging DB deploy');
  }

  const testDatabaseUrl = (process.env.TEST_DATABASE_URL ?? "").trim();
  if (!testDatabaseUrl) {
    fail(
      "TEST_DATABASE_URL is required. Do not set DATABASE_URL alone before allowlist verification.",
    );
  }

  if ((process.env.DATABASE_URL ?? "").trim() && !process.env.ALLOW_STAGING_DEPLOY_DATABASE_URL_OVERRIDE) {
    const current = process.env.DATABASE_URL.trim();
    if (current !== testDatabaseUrl) {
      fail(
        "DATABASE_URL differs from TEST_DATABASE_URL. Unset DATABASE_URL or set ALLOW_STAGING_DEPLOY_DATABASE_URL_OVERRIDE=1 after allowlist PASS.",
      );
    }
  }

  return testDatabaseUrl;
}

function runStep(label, command, env = process.env) {
  console.log(`[staging-lawyer-matching-db-deploy] ${label}`);
  execSync(command, { cwd: root, stdio: "inherit", env, shell: true });
}

async function verifyPostDeploySchema(databaseUrl) {
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    const tableRows = await prisma.$queryRawUnsafe(`
      SELECT to_regclass('"LawyerMatchingRecommendation"') IS NOT NULL AS table_exists;
    `);
    if (!tableRows[0]?.table_exists) {
      fail("LawyerMatchingRecommendation table was not created by db:deploy");
    }

    const indexRows = await prisma.$queryRawUnsafe(`
      SELECT indexname
      FROM pg_indexes
      WHERE indexname IN (
        'LawyerMatchingRecommendation_activeCaseKey_key',
        'CaseAssignment_caseId_assigneeUserId_active_unique'
      );
    `);
    const indexNames = new Set(indexRows.map((row) => String(row.indexname)));
    if (!indexNames.has("LawyerMatchingRecommendation_activeCaseKey_key")) {
      fail("LawyerMatchingRecommendation_activeCaseKey_key index missing after deploy");
    }
    if (!indexNames.has("CaseAssignment_caseId_assigneeUserId_active_unique")) {
      fail("CaseAssignment_caseId_assigneeUserId_active_unique index missing after deploy");
    }

    console.log("PASS — post-deploy schema/index verification (values redacted)");
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const testDatabaseUrl = assertStagingEnv();

  runStep(
    "1/5 staging database allowlist runtime verification",
    "node tools/diagnostic-engine/scripts/verify-staging-database-allowlist.mjs",
    {
      ...process.env,
      DIAGNOSTIC_TEST_ENV: "staging",
      TEST_DATABASE_URL: testDatabaseUrl,
      DATABASE_URL: "",
    },
  );

  runStep(
    "2/5 active CaseAssignment duplicate pre-check",
    "node scripts/verify-lawyer-matching-migration-predeploy.mjs --check-duplicates --require-allowlist-passed",
    {
      ...process.env,
      DIAGNOSTIC_TEST_ENV: "staging",
      TEST_DATABASE_URL: testDatabaseUrl,
      DATABASE_URL: "",
      STAGING_ALLOWLIST_VERIFIED: "1",
    },
  );

  const deployEnv = {
    ...process.env,
    DIAGNOSTIC_TEST_ENV: "staging",
    TEST_DATABASE_URL: testDatabaseUrl,
    DATABASE_URL: testDatabaseUrl,
  };

  runStep("3/5 prisma migrate deploy", "npm run db:deploy", deployEnv);
  runStep("4/5 prisma migrate status", "npx prisma migrate status", deployEnv);

  console.log("[staging-lawyer-matching-db-deploy] 5/5 post-deploy schema/index verification");
  await verifyPostDeploySchema(testDatabaseUrl);

  console.log(
    "db:deploy:staging-lawyer-matching PASS — next: PLAYWRIGHT_BASE_URL + npm run diagnostic:staging-full",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
