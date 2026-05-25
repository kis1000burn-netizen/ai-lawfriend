import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_PRODUCTION_ROLE_SMOKE_WITHOUT_53A_53B_LOCK",
  "NO_GO_LIVE_WITHOUT_PRODUCTION_ROLE_SMOKE",
  "NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY",
  "NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS",
  "NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL",
  "NO_STAFF_ADMIN_PRIVILEGE_ESCALATION",
  "NO_LAWYER_COMPLETION_WITHOUT_REVIEW_BOUNDARY",
  "NO_ROLE_SMOKE_WITH_SHARED_OR_UNKNOWN_ACCOUNT",
  "NO_GO_LIVE_WITH_FAILED_AUTHZ_AUDIT_LOG",
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

exists("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke.schema.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke.policy.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke-evidence.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke-rc-lock.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_RUNBOOK.md");

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke-rc-lock.ts", [
  "phase53c-legal-reliability-production-role-smoke-gate",
  "verify:aibeopchin-legal-reliability-production-role-smoke",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke.schema.ts", [
  "productionRoleSmokeEvidenceSchema",
  "clientBoundary",
  "internalLegalReliabilityBlocked",
  "actionOperationsBlocked",
  "goLiveControlBlocked",
  "PRODUCTION_ROLE_SMOKE_MATRIX",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke.policy.ts", [
  "evaluateProductionRoleSmokeGate",
  "assertProductionRoleSmokeGateAllowed",
  "NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY",
  "NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS",
  "NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL",
  "NO_STAFF_ADMIN_PRIVILEGE_ESCALATION",
  "NO_GO_LIVE_WITH_FAILED_AUTHZ_AUDIT_LOG",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke-evidence.ts", [
  "buildProductionRoleSmokeEvidence",
  "phase53c-legal-reliability-production-role-smoke-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_RUNBOOK.md", [
  "Phase 53-A Production Go-Live Approval Gate LOCKED",
  "Phase 53-B Production Migration Apply",
  "CLIENT cannot access Lawyer Workbench",
  "Go-Live Control",
  "AuthZ audit log refs",
  "NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_CHECKLIST.md", [
  "Phase 53-A approval gate locked",
  "Phase 53-B production migration evidence locked",
  "CLIENT cannot access Lawyer Workbench",
  "CLIENT cannot access Action Operations Queue",
  "STAFF cannot access ADMIN-only go-live approval",
  "AuthZ audit log reference recorded",
  "Role matrix",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53C-PRODUCTION-ROLE-SMOKE-CLIENT-BOUNDARY",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 53-C evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-production-role-smoke")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-production-role-smoke");
}

execSync(
  "npm run test -- src/features/legal-reliability-go-live-control/legal-reliability-production-role-smoke.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 53-C Production Role Smoke & Client Boundary Live Check verified");
console.log("- 53-A/53-B dependency: LOCKED");
console.log("- CLIENT internal Legal Reliability access: BLOCKED");
console.log("- CLIENT Action Operations access: BLOCKED");
console.log("- CLIENT Go-Live Control access: BLOCKED");
console.log("- STAFF admin privilege escalation: BLOCKED");
console.log("- LAWYER unreviewed completion boundary: LOCKED");
console.log("- AuthZ audit evidence: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-production-role-smoke PASS (Product Phase 53-C Production Role Smoke & Client Boundary Live Check)",
);
