import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_PRODUCTION_ACTION_SMOKE_WITHOUT_53A_53B_53C_LOCK",
  "NO_GO_LIVE_WITHOUT_ACTION_LOOP_LIVE_SMOKE",
  "NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER",
  "NO_OPERATION_QUEUE_WITHOUT_APPROVED_ACTION",
  "NO_AUTO_OPERATION_COMPLETION_IN_PRODUCTION",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION",
  "NO_AUTO_FILING_OR_AUTO_SUBMISSION_IN_PRODUCTION",
  "NO_ACTION_SMOKE_WITHOUT_AUDIT_EVIDENCE",
  "NO_CLIENT_VISIBLE_INTERNAL_STRATEGY_DURING_SMOKE",
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

exists("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke.schema.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke.policy.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke-evidence.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke-rc-lock.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_RUNBOOK.md");

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke-rc-lock.ts", [
  "phase53d-legal-reliability-production-action-smoke-gate",
  "verify:aibeopchin-legal-reliability-production-action-smoke",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke.schema.ts", [
  "productionActionSmokeEvidenceSchema",
  "actionLoopSmoke",
  "actionOperationsSmoke",
  "downstreamSafety",
  "PRODUCTION_ACTION_SMOKE_MINIMUM_PATH",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke.policy.ts", [
  "evaluateProductionActionSmokeGate",
  "assertProductionActionSmokeGateAllowed",
  "NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER",
  "NO_OPERATION_QUEUE_WITHOUT_APPROVED_ACTION",
  "NO_AUTO_OPERATION_COMPLETION_IN_PRODUCTION",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION",
  "NO_AUTO_FILING_OR_AUTO_SUBMISSION_IN_PRODUCTION",
  "NO_CLIENT_VISIBLE_INTERNAL_STRATEGY_DURING_SMOKE",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke-evidence.ts", [
  "buildProductionActionSmokeEvidence",
  "phase53d-legal-reliability-production-action-smoke-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_RUNBOOK.md", [
  "Phase 53-A Production Go-Live Approval Gate LOCKED",
  "Phase 53-B Production Migration Evidence LOCKED",
  "Phase 53-C Production Role Smoke LOCKED",
  "Risk Radar action candidate created",
  "SupplementRequest DRAFT only",
  "Operation created only from approved action",
  "Auto completion disabled",
  "Unreviewed evidence downstream blocked",
  "AuditLog refs",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_CHECKLIST.md", [
  "Phase 53-A approval gate locked",
  "Phase 53-B production migration evidence locked",
  "Phase 53-C production role smoke locked",
  "Risk Radar action candidate created",
  "SupplementRequest DRAFT created after approval",
  "Operation created from approved action only",
  "Auto completion disabled",
  "Auto filing disabled",
  "CLIENT cannot access internal Risk Radar",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53D-PRODUCTION-ACTION-LOOP-OPERATIONS-SMOKE",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 53-D evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-production-action-smoke")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-production-action-smoke");
}

execSync(
  "npm run test -- src/features/legal-reliability-go-live-control/legal-reliability-production-action-smoke.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 53-D Production Action Loop / Operations Live Smoke verified");
console.log("- 53-A/53-B/53-C dependency: LOCKED");
console.log("- Risk Radar candidate smoke: REQUIRED");
console.log("- Graph Gap evidence request smoke: REQUIRED");
console.log("- Lawyer decision ledger: REQUIRED");
console.log("- SupplementRequest boundary: DRAFT_ONLY");
console.log("- Operation Queue: APPROVED_ACTION_ONLY");
console.log("- Auto completion / auto filing: BLOCKED");
console.log("- Unreviewed evidence downstream: BLOCKED");
console.log("- Client internal strategy visibility: BLOCKED");
console.log(
  "verify:aibeopchin-legal-reliability-production-action-smoke PASS (Product Phase 53-D Production Action Loop / Operations Live Smoke)",
);
