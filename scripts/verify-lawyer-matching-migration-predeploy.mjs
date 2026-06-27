/**
 * Lawyer matching recommendation migration — predeploy gate.
 *
 * Static (default):
 *   - migration file exists
 *   - staging/prod must use `npm run db:deploy` (prisma migrate deploy), not `db:migrate` (dev)
 *
 * Runtime (--check-duplicates):
 *   - requires DIAGNOSTIC_TEST_ENV=staging + TEST_DATABASE_URL
 *   - runs staging allowlist first unless STAGING_ALLOWLIST_VERIFIED=1
 *   - fails if active CaseAssignment rows violate the partial unique index
 *
 * Usage:
 *   npm run verify:lawyer-matching-migration-predeploy
 *   npm run verify:lawyer-matching-migration-predeploy -- --check-duplicates
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const checkDuplicates = args.has("--check-duplicates");
const requireAllowlistPassed = args.has("--require-allowlist-passed");

const MIGRATION_DIR = "20260627120000_lawyer_matching_recommendation_persistence";
const PARTIAL_UNIQUE_INDEX = "CaseAssignment_caseId_assigneeUserId_active_unique";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function assertDeployScriptsSeparated() {
  const pkg = readJson("package.json");
  const migrate = pkg.scripts?.["db:migrate"] ?? "";
  const deploy = pkg.scripts?.["db:deploy"] ?? "";

  if (!deploy.includes("migrate deploy")) {
    throw new Error('package.json "db:deploy" must run prisma migrate deploy');
  }
  if (!migrate.includes("migrate dev")) {
    throw new Error('package.json "db:migrate" must remain prisma migrate dev (local only)');
  }
  if (migrate.includes("migrate deploy")) {
    throw new Error('"db:migrate" must not call migrate deploy — use db:deploy for staging/prod');
  }
}

function assertMigrationArtifacts() {
  const sqlPath = path.join(root, "prisma", "migrations", MIGRATION_DIR, "migration.sql");
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`Missing migration: prisma/migrations/${MIGRATION_DIR}/migration.sql`);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");
  if (!sql.includes("LawyerMatchingRecommendation")) {
    throw new Error("Lawyer matching migration SQL missing LawyerMatchingRecommendation table");
  }
  if (!sql.includes(PARTIAL_UNIQUE_INDEX)) {
    throw new Error(`Lawyer matching migration SQL missing ${PARTIAL_UNIQUE_INDEX}`);
  }

  const schema = fs.readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8");
  if (!schema.includes("model LawyerMatchingRecommendation")) {
    throw new Error("prisma/schema.prisma missing LawyerMatchingRecommendation model");
  }
}

function assertRunbookUsesDeploy() {
  const runbookPath = path.join(
    root,
    "docs/operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md",
  );
  if (!fs.existsSync(runbookPath)) {
    return;
  }
  const runbook = fs.readFileSync(runbookPath, "utf8");
  if (!runbook.includes("npm run db:deploy")) {
    throw new Error("production release runbook must document npm run db:deploy");
  }
}

function resolveStagingDatabaseUrlForRuntimeCheck() {
  const testEnvironment = (process.env.DIAGNOSTIC_TEST_ENV ?? "").trim();
  if (testEnvironment !== "staging") {
    throw new Error(
      "--check-duplicates requires DIAGNOSTIC_TEST_ENV=staging. Run verify:staging-database-allowlist first.",
    );
  }

  const testDatabaseUrl = (process.env.TEST_DATABASE_URL ?? "").trim();
  if (!testDatabaseUrl) {
    throw new Error(
      "--check-duplicates requires TEST_DATABASE_URL. Do not point DATABASE_URL at staging before allowlist verification.",
    );
  }

  if ((process.env.DATABASE_URL ?? "").trim() && process.env.DATABASE_URL.trim() !== testDatabaseUrl) {
    throw new Error(
      "DATABASE_URL differs from TEST_DATABASE_URL. Use TEST_DATABASE_URL until allowlist PASS, then copy to DATABASE_URL for db:deploy.",
    );
  }

  return testDatabaseUrl;
}

function runStagingAllowlistVerification(databaseUrl) {
  if (process.env.STAGING_ALLOWLIST_VERIFIED === "1" || requireAllowlistPassed) {
    return;
  }

  execSync("node tools/diagnostic-engine/scripts/verify-staging-database-allowlist.mjs", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      DIAGNOSTIC_TEST_ENV: "staging",
      TEST_DATABASE_URL: databaseUrl,
      DATABASE_URL: "",
    },
  });
}

function checkActiveAssignmentDuplicates(databaseUrl) {
  const guardSql = `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "CaseAssignment"
    WHERE "isActive" = true
    GROUP BY "caseId", "assigneeUserId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_ACTIVE_CASE_ASSIGNMENTS';
  END IF;
END $$;
`.trim();

  try {
    execSync("npx prisma db execute --stdin", {
      cwd: root,
      encoding: "utf8",
      input: guardSql,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, DATABASE_URL: databaseUrl, TEST_DATABASE_URL: databaseUrl },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.message}\n${"stderr" in error ? String(error.stderr ?? "") : ""}`
        : String(error);
    if (message.includes("DUPLICATE_ACTIVE_CASE_ASSIGNMENTS")) {
      throw new Error(
        `Active CaseAssignment duplicates would block ${PARTIAL_UNIQUE_INDEX}. ` +
          "Resolve duplicate active rows before npm run db:deploy.",
      );
    }
    throw error;
  }
}

function main() {
  assertDeployScriptsSeparated();
  assertMigrationArtifacts();
  assertRunbookUsesDeploy();

  if (checkDuplicates) {
    const databaseUrl = resolveStagingDatabaseUrlForRuntimeCheck();
    runStagingAllowlistVerification(databaseUrl);
    checkActiveAssignmentDuplicates(databaseUrl);
  }

  console.log(
    "verify:lawyer-matching-migration-predeploy PASS" +
      (checkDuplicates ? " (allowlist + no active assignment duplicates)" : "") +
      " — staging: npm run db:deploy:staging-lawyer-matching ; local dev: npm run db:migrate",
  );
}

main();
