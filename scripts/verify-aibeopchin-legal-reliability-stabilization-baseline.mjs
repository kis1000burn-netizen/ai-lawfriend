import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_BASELINE_WITHOUT_PHASE53_COMPLETE_LOCK",
  "NO_BASELINE_WITHOUT_ERROR_RATE_THRESHOLD",
  "NO_BASELINE_WITHOUT_LATENCY_THRESHOLD",
  "NO_BASELINE_WITHOUT_ACTION_LOOP_SUCCESS_THRESHOLD",
  "NO_BASELINE_WITHOUT_OPERATIONS_QUEUE_BACKLOG_THRESHOLD",
  "NO_BASELINE_WITHOUT_AUDIT_LOG_COVERAGE_THRESHOLD",
  "NO_BASELINE_WITHOUT_ROLE_DENIAL_PATTERN",
  "NO_BASELINE_WITHOUT_DEGRADE_READINESS_SIGNAL",
  "NO_BASELINE_WITHOUT_OPERATOR_BASELINE_SIGNOFF",
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

exists("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline.schema.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline.policy.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline-evidence.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline-rc-lock.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_RUNBOOK.md");

inc("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline-rc-lock.ts", [
  "phase54a-legal-reliability-stabilization-baseline-gate",
  "verify:aibeopchin-legal-reliability-stabilization-baseline",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline.schema.ts", [
  "stabilizationErrorRateBaselineSchema",
  "stabilizationLatencyBaselineSchema",
  "stabilizationActionLoopBaselineSchema",
  "stabilizationOperationsQueueBaselineSchema",
  "stabilizationAuditCoverageBaselineSchema",
  "stabilizationRoleDenialPatternSchema",
  "stabilizationDegradeReadinessSignalSchema",
  "operatorSignoff",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline.policy.ts", [
  "evaluateStabilizationBaselineGate",
  "assertStabilizationBaselineGateAllowed",
  "NO_BASELINE_WITHOUT_PHASE53_COMPLETE_LOCK",
  "NO_BASELINE_WITHOUT_ERROR_RATE_THRESHOLD",
  "NO_BASELINE_WITHOUT_DEGRADE_READINESS_SIGNAL",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline-evidence.ts", [
  "buildStabilizationBaselineEvidence",
  "phase54a-legal-reliability-stabilization-baseline-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_RUNBOOK.md", [
  "Phase 53-F Production Go-Live Control RC COMPLETE · LOCKED",
  "npm run verify:aibeopchin-legal-reliability-production-go-live-control-rc",
  "npm run verify:aibeopchin-legal-reliability-stabilization-baseline",
  "What is normal, warning, and critical during customer operation",
  "Action Loop API",
  "Read-only degrade can activate",
  "Operator Closeout",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_CHECKLIST.md", [
  "Phase 53-F Production Go-Live Control RC COMPLETE · LOCKED",
  "Action Loop API error rate normal/warning/critical threshold defined",
  "Lawyer Workbench P95 latency threshold defined",
  "Candidate creation success rate threshold defined",
  "Open queue backlog threshold defined",
  "Action candidate audit coverage threshold defined",
  "CLIENT internal access allowed not observed",
  "Read-only degrade can activate",
  "Operator signed off",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54A-PRODUCTION-STABILIZATION-MONITORING-BASELINE",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 54-A evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-stabilization-baseline")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-stabilization-baseline");
}

inc("tools/aibeopchin_navigator.py", [
  "54-A COMPLETE · LOCKED · 54-A.1",
  "verify:aibeopchin-legal-reliability-stabilization-baseline",
]);

execSync(
  "npm run test -- src/features/legal-reliability-production-stabilization/legal-reliability-stabilization-baseline.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 54-A Production Stabilization Monitoring Baseline verified");
console.log("- Phase 53-F dependency: LOCKED");
console.log("- Error rate baseline: REQUIRED");
console.log("- Latency baseline: REQUIRED");
console.log("- Action Loop success baseline: REQUIRED");
console.log("- Operations queue backlog baseline: REQUIRED");
console.log("- AuditLog coverage baseline: REQUIRED");
console.log("- Role denial pattern: REQUIRED");
console.log("- Degrade readiness signal: REQUIRED");
console.log("- Operator baseline sign-off: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-stabilization-baseline PASS (Product Phase 54-A Production Stabilization Monitoring Baseline)",
);
