import fs from "node:fs";
import path from "node:path";
import { runLegalReliabilityPredeployReadinessBlock } from "./run-legal-reliability-predeploy-readiness-block.mjs";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49B-GRAPH-GAP-EVIDENCE-REQUEST-ACTION",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-LOOP-PHASE49C-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50B-ASSIGNMENT-DUE-SLA",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50C-CLIENT-RESPONSE-EVIDENCE-INTAKE-SYNC",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50D-LAWYER-COMPLETION-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50E-COMMAND-CENTER-EXECUTION-DASHBOARD",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51-PRODUCTION-READINESS-RC",
];

export function runLegalReliabilityProductionReadinessRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-production-readiness-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/legal-reliability-production-readiness/legal-reliability-production-readiness-rc-lock.ts");
  exists("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md");
  exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md");

  inc("src/features/legal-reliability-production-readiness/legal-reliability-production-readiness-rc-lock.ts", [
    "phase51f-legal-reliability-production-readiness-rc-gate",
    "verify:aibeopchin-legal-reliability-production-readiness-rc",
    "51-A Migration / Schema Readiness",
    "51-E Rollback / Disable / Incident Runbook",
    "NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY",
    "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION",
  ]);

  inc("src/features/legal-reliability-production-readiness/legal-reliability-production-readiness.policy.ts", [
    "assertProductionReadinessRcBoundary",
    "assertRoleBoundarySmoke",
    "NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS",
  ]);

  inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md", [
    "51-A",
    "51-F",
    "NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY",
    "verify:aibeopchin-legal-reliability-production-readiness-rc",
  ]);

  inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RUNBOOK.md", [
    "Phase 51",
    "LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED",
    "rollback",
  ]);

  inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md", [
    "Risk Radar",
    "Completion review",
    "NO_DASHBOARD_AUTO_MESSAGING",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 51", "LEGAL_RELIABILITY_PRODUCTION_READINESS"]);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "51-F",
    "COMPLETE · LOCKED",
    "verify:aibeopchin-legal-reliability-production-readiness-rc",
  ]);

  inc("src/features/legal-reliability-production-readiness/legal-reliability-production-readiness-flags.ts", [
    "LEGAL_RELIABILITY_ACTION_LOOP_ENABLED",
    "LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  for (const script of [
    "verify:aibeopchin-legal-reliability-predeploy-readiness",
    "verify:aibeopchin-legal-reliability-production-readiness-rc",
    "verify:aibeopchin-legal-reliability-action-loop-rc",
    "verify:aibeopchin-legal-reliability-action-operations-rc",
  ]) {
    if (!pkg.includes(script)) throw new Error(`missing ${script}`);
  }

  console.log(`[${label}] verify:aibeopchin-legal-reliability-predeploy-readiness …`);
  runLegalReliabilityPredeployReadinessBlock(execSync, root, label);

  console.log(`[${label}] npx prisma validate …`);
  execSync("npx prisma validate", { stdio: "inherit", cwd: root });

  execSync(
    "npm run test -- src/features/legal-reliability-production-readiness/legal-reliability-production-readiness.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
