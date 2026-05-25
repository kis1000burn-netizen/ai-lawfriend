import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_PRODUCTION_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_APPROVER_LEDGER",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_ROLLBACK_OWNER",
  "NO_PRODUCTION_GO_LIVE_WITH_FAILED_PREDEPLOY_RC",
  "NO_PRODUCTION_GO_LIVE_WITH_PENDING_MIGRATION_RISK",
  "NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS",
  "NO_PRODUCTION_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING",
  "NO_PRODUCTION_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH",
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

exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc-lock.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-approval.schema.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-approval.policy.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-approval-ledger.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-approval.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_RUNBOOK.md");
exists("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md");

inc("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc-lock.ts", [
  "phase53a-legal-reliability-go-live-approval-gate",
  "verify:aibeopchin-legal-reliability-go-live-approval-gate",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-go-live-approval.schema.ts", [
  "approverLedger",
  "rollbackOwnerUserId",
  "rollbackOwnerAcknowledged",
  "stagingEvidenceRef",
  "featureFlagKillSwitchVerified",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-go-live-approval.policy.ts", [
  "evaluateProductionGoLiveApprovalGate",
  "NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS",
  "NO_PRODUCTION_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING",
  "NO_PRODUCTION_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md", [
  "Phase 52 Staging Live Validation RC PASS",
  "Rollback owner acknowledged",
  "Approver ledger recorded",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_RUNBOOK.md", [
  "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
  "npm run predeploy:check",
  "LEGAL_RELIABILITY_ACTION_LOOP_ENABLED=false",
  "Approval ledger",
]);

inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md", [
  "53-A",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_APPROVER_LEDGER",
  "verify:aibeopchin-legal-reliability-go-live-approval-gate",
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53A-PRODUCTION-GO-LIVE-APPROVAL-GATE",
)) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 53-A evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-go-live-approval-gate")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-go-live-approval-gate");
}

execSync(
  "npm run test -- src/features/legal-reliability-go-live-control/legal-reliability-go-live-approval.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 53-A Production Go-Live Approval Gate verified");
console.log("- Staging evidence dependency: LOCKED");
console.log("- Approver ledger: REQUIRED");
console.log("- Rollback owner acknowledgement: REQUIRED");
console.log("- Migration/schema drift gate: LOCKED");
console.log("- CLIENT internal access boundary: LOCKED");
console.log("- Auto completion / auto filing boundary: LOCKED");
console.log("- Feature flag kill switch: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-go-live-approval-gate PASS (Product Phase 53-A Production Go-Live Approval Gate)",
);
