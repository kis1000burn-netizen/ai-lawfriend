/**
 * Staging migration deploy readiness — static gates + optional prisma migrate status.
 *
 * Usage:
 *   npm run verify:staging-migration-deploy-readiness
 *   npm run verify:staging-migration-deploy-readiness -- --status
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const runStatus = args.has("--status");

const REQUIRED_PHASE_MIGRATIONS = [
  "20260525140000_client_portal_collaboration_phase15a",
  "20260525170000_litigation_deadline_client_reminder_phase15d",
  "20260525180000_secure_document_delivery_phase15f",
];

function assertMigrationDir(name) {
  const sql = path.join(root, "prisma", "migrations", name, "migration.sql");
  if (!fs.existsSync(sql)) {
    throw new Error(`Missing required migration: prisma/migrations/${name}/migration.sql`);
  }
}

function main() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  if (!pkg.scripts?.["db:deploy"]) {
    throw new Error("package.json must define db:deploy (prisma migrate deploy)");
  }

  const runbook = fs.readFileSync(
    path.join(root, "docs/operations/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md"),
    "utf8",
  );
  for (const term of ["npm run db:deploy", "db:deploy", "rollback"]) {
    if (!runbook.includes(term)) {
      throw new Error(`staging deploy runbook missing "${term}"`);
    }
  }

  for (const dir of REQUIRED_PHASE_MIGRATIONS) {
    assertMigrationDir(dir);
  }

  if (runStatus) {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error("--status requires DATABASE_URL in environment");
    }
    console.log("[verify:staging-migration-deploy-readiness] prisma migrate status …");
    execSync("npx prisma migrate status", { stdio: "inherit", cwd: root });
  }

  console.log(
    "verify:staging-migration-deploy-readiness PASS (static migration deploy gates" +
      (runStatus ? " + migrate status" : "") +
      ")",
  );
}

main();
