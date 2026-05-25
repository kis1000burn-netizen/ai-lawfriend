import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_SUPPORT_ESCALATION_WITHOUT_54A_54D_LOCK",
  "NO_ESCALATION_WITHOUT_SEVERITY_OWNER",
  "NO_ESCALATION_WITHOUT_RESPONSE_WINDOW",
  "NO_ESCALATION_WITHOUT_ENGINEERING_OWNER",
  "NO_ESCALATION_WITHOUT_LEGAL_OPS_OWNER",
  "NO_ESCALATION_WITHOUT_CUSTOMER_SUPPORT_OWNER",
  "NO_CUSTOMER_MESSAGE_WITHOUT_SAFE_TEMPLATE",
  "NO_SUPPORT_ACTION_WITHOUT_AUDIT_LOG",
  "NO_INCIDENT_CLOSEOUT_WITHOUT_SUPPORT_REVIEW",
  "NO_STABILIZATION_RC_WITHOUT_SUPPORT_READY",
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

exists("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation.schema.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation.policy.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation-evidence.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation-rc-lock.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_RUNBOOK.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_CUSTOMER_SAFE_MESSAGE_TEMPLATES.md");

inc("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation-rc-lock.ts", [
  "phase54e-legal-reliability-support-escalation-gate",
  "verify:aibeopchin-legal-reliability-support-escalation",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation.schema.ts", [
  "supportEscalationRoleSchema",
  "supportResponseWindowSchema",
  "supportOwnerAssignmentSchema",
  "customerSafeMessageTemplateSchema",
  "supportAuditRequirementSchema",
  "readinessDrill",
  "supportReadinessReviewed",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation.policy.ts", [
  "evaluateSupportEscalationGate",
  "assertSupportEscalationAllowed",
  "NO_SUPPORT_ESCALATION_WITHOUT_54A_54D_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_SUPPORT_READY",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation-evidence.ts", [
  "buildSupportEscalationEvidence",
  "phase54e-legal-reliability-support-escalation-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_RUNBOOK.md", [
  "human response system",
  "Phase 54-A Monitoring Baseline COMPLETE · LOCKED",
  "Phase 54-D Degraded Mode COMPLETE · LOCKED",
  "ENGINEERING_LEAD",
  "CUSTOMER_SUPPORT_OWNER",
  "acknowledge within 5m",
  "Risk Radar detail",
  "SEV-0 escalation drill",
  "npm run verify:aibeopchin-legal-reliability-support-escalation",
  "governed response chain",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_CHECKLIST.md", [
  "54-A Monitoring Baseline COMPLETE · LOCKED",
  "54-D Degraded Mode COMPLETE · LOCKED",
  "SEV-0 owner defined",
  "Operator owner assigned",
  "Customer-safe message templates ready",
  "Templates contain no internal strategy",
  "SEV-0 drill completed",
  "Support readiness reviewed",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_CUSTOMER_SAFE_MESSAGE_TEMPLATES.md", [
  "customer-safe wording",
  "internal strategy",
  "Risk Radar details",
  "SEV-0 Template",
  "SEV-4 Template",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54E-SUPPORT-OPS-ESCALATION",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 54-E evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-support-escalation")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-support-escalation");
}

inc("tools/aibeopchin_navigator.py", [
  "54-E COMPLETE · LOCKED · 54-E.1",
  "verify:aibeopchin-legal-reliability-support-escalation",
]);

execSync(
  "npm run test -- src/features/legal-reliability-production-stabilization/legal-reliability-support-escalation.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 54-E Support / Ops Escalation Readiness verified");
console.log("- 54-A~54-D dependency: LOCKED");
console.log("- Severity owners and backup owners: REQUIRED");
console.log("- Response windows: REQUIRED");
console.log("- Engineering / Legal Ops / Support owners: REQUIRED");
console.log("- Customer-safe message templates: REQUIRED");
console.log("- Support audit: REQUIRED");
console.log("- Readiness drills: REQUIRED");
console.log("- Support closeout review: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-support-escalation PASS (Product Phase 54-E Support / Ops Escalation Readiness)",
);
