import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_POST_GO_LIVE_MONITORING_WITHOUT_53A_53B_53C_53D_LOCK",
  "NO_GO_LIVE_CLOSEOUT_WITHOUT_MONITORING_WINDOW",
  "NO_CLOSEOUT_WITH_ACTION_LOOP_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_ACTION_OPERATIONS_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION",
  "NO_CLOSEOUT_WITH_AUDIT_LOG_GAP",
  "NO_CLOSEOUT_WITH_ROLLBACK_FLAG_UNVERIFIED",
  "NO_CLOSEOUT_WITH_AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL",
  "NO_CLOSEOUT_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL",
  "NO_CLOSEOUT_WITHOUT_OPERATOR_SIGNOFF",
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

exists("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring.schema.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring.policy.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring-evidence.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring-rc-lock.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_RUNBOOK.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md");

inc("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring-rc-lock.ts", [
  "phase53e-legal-reliability-post-go-live-monitoring-gate",
  "verify:aibeopchin-legal-reliability-post-go-live-monitoring",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring.schema.ts", [
  "postGoLiveMonitoringEvidenceSchema",
  "postGoLiveMonitoringWindowSchema",
  "monitoringWindow",
  "rollbackReadinessSchema",
  "POST_GO_LIVE_MONITORING_WINDOW_PHASES",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring.policy.ts", [
  "evaluatePostGoLiveMonitoringGate",
  "assertPostGoLiveMonitoringGateAllowed",
  "NO_CLOSEOUT_WITH_ACTION_LOOP_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_ACTION_OPERATIONS_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION",
  "NO_CLOSEOUT_WITH_AUDIT_LOG_GAP",
  "NO_CLOSEOUT_WITH_ROLLBACK_FLAG_UNVERIFIED",
  "NO_CLOSEOUT_WITH_AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL",
  "NO_CLOSEOUT_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL",
  "NO_CLOSEOUT_WITHOUT_OPERATOR_SIGNOFF",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring-evidence.ts", [
  "buildPostGoLiveMonitoringEvidence",
  "phase53e-legal-reliability-post-go-live-monitoring-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_RUNBOOK.md", [
  "Phase 53-A Production Go-Live Approval Gate LOCKED",
  "Phase 53-B Production Migration Evidence LOCKED",
  "Phase 53-C Production Role Smoke LOCKED",
  "Phase 53-D Production Action Smoke LOCKED",
  "T+0 ~ T+30m",
  "Action Loop / Operations error rate",
  "Read-only degrade verified",
  "operator closeout is signed",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_CHECKLIST.md", [
  "Phase 53-A approval gate locked",
  "Phase 53-B production migration evidence locked",
  "Phase 53-C production role smoke locked",
  "Phase 53-D production action smoke locked",
  "No Action Loop error spike",
  "No Operations error spike",
  "No CLIENT internal access",
  "Read-only degrade verified",
  "Operator signed off",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md", [
  "Rollback Readiness Window",
  "LEGAL_RELIABILITY_ACTION_LOOP_ENABLED",
  "read-only degrade",
  "rollback owner available",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53E-POST-GO-LIVE-MONITORING-ROLLBACK-READINESS",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 53-E evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-post-go-live-monitoring")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-post-go-live-monitoring");
}

execSync(
  "npm run test -- src/features/legal-reliability-go-live-control/legal-reliability-post-go-live-monitoring.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 53-E Post-Go-Live Monitoring & Rollback Readiness Window verified");
console.log("- 53-A/53-B/53-C/53-D dependency: LOCKED");
console.log("- Monitoring window: REQUIRED");
console.log("- Action Loop / Operations error spike detection: LOCKED");
console.log("- CLIENT boundary violation detection: LOCKED");
console.log("- AuditLog coverage: REQUIRED");
console.log("- Read-only degrade / rollback flags: VERIFIED");
console.log("- Operator closeout sign-off: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-post-go-live-monitoring PASS (Product Phase 53-E Post-Go-Live Monitoring & Rollback Readiness Window)",
);
