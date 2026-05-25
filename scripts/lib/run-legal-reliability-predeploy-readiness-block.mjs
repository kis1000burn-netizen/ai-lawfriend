import fs from "node:fs";
import path from "node:path";

const REQUIRED_MIGRATION_DIRS = [
  "20260526120000_legal_reliability_action_loop_phase49a",
  "20260527120000_legal_reliability_action_operations_phase50a",
  "20260527140000_legal_reliability_action_operations_phase50b",
  "20260527160000_legal_reliability_action_operations_phase50c",
];

const REQUIRED_SCHEMA_MODELS = [
  "LegalReliabilityActionCandidate",
  "LegalReliabilityActionDecisionLedger",
  "LegalReliabilityActionOperation",
];

const REQUIRED_SCHEMA_FIELDS = [
  "assignedByUserId",
  "assignedAt",
  "slaStatus",
  "slaCheckedAt",
  "clientResponseSummary",
  "linkedClientSubmissionIds",
  "linkedUploadedFileIds",
  "linkedEvidenceIntakeIds",
  "evidenceIntakeStatus",
  "reviewHandoffJson",
  "completionResult",
];

export function runLegalReliabilityPredeployReadinessBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-predeploy-readiness",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/legal-reliability-production-readiness/phase51c-predeploy-gate-integration.lock.ts");
  exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RUNBOOK.md");

  inc("src/features/legal-reliability-production-readiness/phase51c-predeploy-gate-integration.lock.ts", [
    "verify:aibeopchin-legal-reliability-predeploy-readiness",
    "verify:aibeopchin-legal-reliability-action-loop-rc",
    "verify:aibeopchin-legal-reliability-action-operations-rc",
    "NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY",
  ]);

  inc("DEPLOY_PRECHECK.md", [
    "verify:aibeopchin-legal-reliability-predeploy-readiness",
    "verify:aibeopchin-legal-reliability-production-readiness-rc",
  ]);

  const schema = read("prisma/schema.prisma");
  for (const model of REQUIRED_SCHEMA_MODELS) {
    if (!schema.includes(`model ${model}`)) {
      throw new Error(`prisma/schema.prisma missing model ${model}`);
    }
  }
  for (const field of REQUIRED_SCHEMA_FIELDS) {
    if (!schema.includes(field)) {
      throw new Error(`prisma/schema.prisma missing field ${field}`);
    }
  }

  for (const dir of REQUIRED_MIGRATION_DIRS) {
    const sql = path.join(root, "prisma", "migrations", dir, "migration.sql");
    if (!fs.existsSync(sql)) {
      throw new Error(`Missing migration: prisma/migrations/${dir}/migration.sql`);
    }
  }

  console.log(`[${label}] npx prisma validate …`);
  execSync("npx prisma validate", { stdio: "inherit", cwd: root });

  console.log(`[${label}] verify:aibeopchin-legal-reliability-action-loop-rc …`);
  execSync("npm run verify:aibeopchin-legal-reliability-action-loop-rc", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] verify:aibeopchin-legal-reliability-action-operations-rc …`);
  execSync("npm run verify:aibeopchin-legal-reliability-action-operations-rc", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] action-operations unit tests …`);
  execSync("npm run test -- src/features/legal-reliability-action-operations", {
    stdio: "inherit",
    cwd: root,
  });
}
