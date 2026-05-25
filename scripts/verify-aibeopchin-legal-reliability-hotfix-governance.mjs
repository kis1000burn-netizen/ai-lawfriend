import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY",
  "NO_HOTFIX_WITHOUT_SEVERITY_CLASSIFICATION",
  "NO_HOTFIX_WITHOUT_APPROVAL_CHAIN",
  "NO_HOTFIX_WITHOUT_SCOPE_LIMIT",
  "NO_HOTFIX_WITHOUT_ROLLBACK_PLAN",
  "NO_HOTFIX_WITHOUT_POST_PATCH_VERIFY",
  "NO_HOTFIX_WITHOUT_CUSTOMER_IMPACT_RECORD",
  "NO_EMERGENCY_PATCH_WITHOUT_AUDIT_LOG",
  "NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL",
  "NO_HOTFIX_WITHOUT_CLOSEOUT_REVIEW",
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

exists("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance.schema.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance.policy.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance-evidence.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance-rc-lock.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_RUNBOOK.md");

inc("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance-rc-lock.ts", [
  "phase54c-legal-reliability-hotfix-governance-gate",
  "verify:aibeopchin-legal-reliability-hotfix-governance",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance.schema.ts", [
  "hotfixSeveritySchema",
  "hotfixTypeSchema",
  "hotfixRiskAreaSchema",
  "hotfixApprovalSchema",
  "hotfixScopeSchema",
  "hotfixVerificationSchema",
  "hotfixCustomerImpactSchema",
  "extraMigrationApprovalUserId",
  "closeoutReviewCompleted",
  "SEV_0",
  "SEV_4",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance.policy.ts", [
  "evaluateHotfixGovernanceGate",
  "resolveAllowedHotfixTypeBySeverity",
  "assertHotfixGovernanceAllowed",
  "NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY",
  "NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance-evidence.ts", [
  "buildHotfixGovernanceEvidence",
  "phase54c-legal-reliability-hotfix-governance-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_RUNBOOK.md", [
  "Hotfixes are fast but never uncontrolled",
  "Phase 54-A Monitoring Baseline COMPLETE · LOCKED",
  "Phase 54-B Incident Severity COMPLETE · LOCKED",
  "SEV-0",
  "EMERGENCY_PATCH",
  "SEV-4",
  "Emergency patch is not allowed for SEV-4",
  "Migration Hotfix Rule",
  "extra approval",
  "npm run verify:aibeopchin-legal-reliability-hotfix-governance",
  "closeout review is completed",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_CHECKLIST.md", [
  "54-A Monitoring Baseline COMPLETE · LOCKED",
  "54-B Incident Severity COMPLETE · LOCKED",
  "SEV-0: EMERGENCY_PATCH / HOTFIX / ROLLBACK_ONLY only",
  "SEV-4: STANDARD_PATCH / CONFIG_ONLY only",
  "Rollback owner acknowledged",
  "Includes database migration: YES / NO",
  "extra migration approval recorded",
  "Post-patch verify PASS",
  "Customer impact recorded",
  "AuditLog written",
  "Closeout review completed",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 54-C evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-hotfix-governance")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-hotfix-governance");
}

inc("tools/aibeopchin_navigator.py", [
  "54-C COMPLETE · LOCKED · 54-C.1",
  "verify:aibeopchin-legal-reliability-hotfix-governance",
]);

execSync(
  "npm run test -- src/features/legal-reliability-production-stabilization/legal-reliability-hotfix-governance.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 54-C Hotfix / Emergency Patch Governance verified");
console.log("- 54-B incident severity dependency: LOCKED");
console.log("- Severity classification: REQUIRED");
console.log("- Approval chain: REQUIRED");
console.log("- Scope limit: REQUIRED");
console.log("- Migration hotfix extra approval: REQUIRED");
console.log("- Rollback plan: REQUIRED");
console.log("- Post-patch verify: REQUIRED");
console.log("- Customer impact record: REQUIRED");
console.log("- Audit log: REQUIRED");
console.log("- Closeout review: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-hotfix-governance PASS (Product Phase 54-C Hotfix / Emergency Patch Governance)",
);
