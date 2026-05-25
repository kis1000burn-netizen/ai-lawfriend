import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL",
  "NO_GO_LIVE_WITH_FAILED_PRODUCTION_MIGRATION",
  "NO_GO_LIVE_WITH_DIRTY_MIGRATION_STATUS",
  "NO_GO_LIVE_WITH_SCHEMA_DRIFT_AFTER_MIGRATION",
  "NO_GO_LIVE_WITHOUT_PRODUCTION_MIGRATION_EVIDENCE",
  "NO_DESTRUCTIVE_RESET_IN_PRODUCTION",
  "NO_GO_LIVE_WITH_UNKNOWN_ROLLBACK_IMPACT",
  "NO_GO_LIVE_WITH_UNCONFIRMED_DATABASE_TARGET",
  "NO_GO_LIVE_WITH_PENDING_PRISMA_GENERATE_OR_VALIDATE",
];

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function exists(p) {
  if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
}

function inc(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

exists("src/features/legal-reliability-go-live-control/legal-reliability-production-migration.schema.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-migration.policy.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-migration-evidence.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-migration-rc-lock.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-migration.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_RUNBOOK.md");

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-migration-rc-lock.ts", [
  "phase53b-legal-reliability-production-migration-evidence-gate",
  "verify:aibeopchin-legal-reliability-production-migration-evidence",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-migration.schema.ts", [
  "npx prisma migrate deploy",
  "migrationStatusClean",
  "schemaDriftDetected",
  "databaseTargetConfirmed",
  "approverLedgerRef",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-migration.policy.ts", [
  "evaluateProductionMigrationLiveGate",
  "NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL",
  "NO_DESTRUCTIVE_RESET_IN_PRODUCTION",
  "migrationStatusClean",
  "schemaDriftDetected",
  "rollbackImpactKnown",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-migration-evidence.ts", [
  "buildProductionMigrationEvidence",
  "phase53b-legal-reliability-production-migration-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_RUNBOOK.md", [
  "Phase 53-A",
  "npx prisma migrate deploy",
  "prisma migrate reset",
  "NO_DESTRUCTIVE_RESET_IN_PRODUCTION",
  "migration status",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md", [
  "Phase 53-A approval confirmed",
  "No destructive reset used",
  "No schema drift detected",
  "Rollback impact known",
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53B-PRODUCTION-MIGRATION-LIVE-EVIDENCE",
)) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 53-B evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-production-migration-evidence")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-production-migration-evidence");
}

execSync(
  "npm run test -- src/features/legal-reliability-go-live-control/legal-reliability-production-migration.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 53-B Production Migration Apply & Live Status Evidence verified");
console.log("- 53-A approval dependency: LOCKED");
console.log("- Production migration command: npx prisma migrate deploy");
console.log("- Destructive reset forbidden: LOCKED");
console.log("- Migration status clean gate: LOCKED");
console.log("- Schema drift gate: LOCKED");
console.log("- Rollback impact review: REQUIRED");
console.log("- Production DB target confirmation: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-production-migration-evidence PASS (Product Phase 53-B Production Migration Apply & Live Status Evidence)",
);
