import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK",
  "NO_DEGRADE_WITHOUT_SEVERITY_TRIGGER",
  "NO_DEGRADE_WITHOUT_OPERATOR_APPROVAL",
  "NO_DEGRADE_WITHOUT_TENANT_OR_FEATURE_SCOPE",
  "NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE",
  "NO_DEGRADE_WITHOUT_READ_ONLY_FALLBACK",
  "NO_DEGRADE_WITHOUT_WRITE_COMPLETION_DISABLE_CONTROL",
  "NO_DEGRADE_WITHOUT_AUDIT_LOG",
  "NO_DEGRADE_WITHOUT_RECOVERY_CRITERIA",
  "NO_DEGRADE_WITHOUT_EXIT_REVIEW",
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

exists("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode.schema.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode.policy.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode-evidence.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode-rc-lock.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_RUNBOOK.md");

inc("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode-rc-lock.ts", [
  "phase54d-legal-reliability-degraded-mode-gate",
  "verify:aibeopchin-legal-reliability-degraded-mode",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode.schema.ts", [
  "degradedModeTypeSchema",
  "degradedModeScopeSchema",
  "degradedModeControlStateSchema",
  "degradedModeClientMessageSchema",
  "degradedModeRecoveryCriteriaSchema",
  "exitReview",
  "clientPortalReadOnly",
  "completionEnabled",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode.policy.ts", [
  "evaluateDegradedModeGate",
  "resolveRecommendedDegradedModesBySeverity",
  "assertDegradedModeAllowed",
  "NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK",
  "NO_DEGRADE_WITHOUT_RECOVERY_CRITERIA",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode-evidence.ts", [
  "buildDegradedModeEvidence",
  "phase54d-legal-reliability-degraded-mode-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_RUNBOOK.md", [
  "customer-safe partial operation",
  "Phase 54-B Incident Severity COMPLETE · LOCKED",
  "Phase 54-C Hotfix Governance COMPLETE · LOCKED",
  "READ_ONLY",
  "ACTION_LOOP_DISABLED",
  "FULL_SAFE_MODE",
  "internal strategy",
  "Risk Radar detail",
  "error rate returns to baseline",
  "exit review is completed",
  "npm run verify:aibeopchin-legal-reliability-degraded-mode",
  "controlled customer-safe operating state",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_CHECKLIST.md", [
  "54-B Incident Severity COMPLETE · LOCKED",
  "54-C Hotfix Governance COMPLETE · LOCKED",
  "Operator approved",
  "ACTION_LOOP_DISABLED",
  "FULL_SAFE_MODE",
  "Global disable is not used unless separately approved",
  "Write disabled if required",
  "Client Portal read-only fallback available",
  "Message contains no internal strategy",
  "Error rate back to baseline",
  "Exit review completed",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54D-DEGRADED-MODE",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 54-D evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-degraded-mode")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-degraded-mode");
}

inc("tools/aibeopchin_navigator.py", [
  "54-D COMPLETE · LOCKED · 54-D.1",
  "verify:aibeopchin-legal-reliability-degraded-mode",
]);

execSync(
  "npm run test -- src/features/legal-reliability-production-stabilization/legal-reliability-degraded-mode.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 54-D Customer-safe Rollout / Degraded Mode verified");
console.log("- 54-B/54-C dependency: LOCKED");
console.log("- Severity trigger: REQUIRED");
console.log("- Operator approval: REQUIRED");
console.log("- Tenant/feature scope: REQUIRED");
console.log("- Client-safe message: REQUIRED");
console.log("- Read-only fallback: REQUIRED");
console.log("- Write/completion disable control: REQUIRED");
console.log("- AuditLog: REQUIRED");
console.log("- Recovery criteria: REQUIRED");
console.log("- Exit review: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-degraded-mode PASS (Product Phase 54-D Customer-safe Rollout / Degraded Mode)",
);
