import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_INCIDENT_SEVERITY_WITHOUT_PHASE54A_BASELINE",
  "NO_SEVERITY_WITHOUT_CUSTOMER_IMPACT_CLASSIFICATION",
  "NO_SEVERITY_WITHOUT_ROLE_BOUNDARY_CLASSIFICATION",
  "NO_SEVERITY_WITHOUT_AUTOMATION_RISK_CLASSIFICATION",
  "NO_SEVERITY_WITHOUT_ACTION_LOOP_IMPACT_CLASSIFICATION",
  "NO_SEVERITY_WITHOUT_QUEUE_IMPACT_CLASSIFICATION",
  "NO_SEVERITY_WITHOUT_LATENCY_DEGRADATION_CLASSIFICATION",
  "NO_SEVERITY_WITHOUT_ESCALATION_TARGET",
  "NO_SEVERITY_WITHOUT_OPERATOR_RESPONSE_WINDOW",
  "NO_SEVERITY_WITHOUT_INCIDENT_AUDIT_REQUIREMENT",
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

exists("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity.schema.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity.policy.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity-evidence.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity-rc-lock.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity.test.ts");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_CHECKLIST.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_RUNBOOK.md");

inc("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity-rc-lock.ts", [
  "phase54b-legal-reliability-incident-severity-gate",
  "verify:aibeopchin-legal-reliability-incident-severity",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity.schema.ts", [
  "incidentSeveritySchema",
  "incidentCategorySchema",
  "escalationMatrix",
  "operatorReadiness",
  "SEV_0",
  "SEV_4",
  "ROLE_BOUNDARY",
  "AUTOMATION_RISK",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity.policy.ts", [
  "evaluateIncidentSeverityGate",
  "assertIncidentSeverityGateAllowed",
  "NO_INCIDENT_SEVERITY_WITHOUT_PHASE54A_BASELINE",
  "NO_SEVERITY_WITHOUT_AUTOMATION_RISK_CLASSIFICATION",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity-evidence.ts", [
  "buildIncidentSeverityEvidence",
  "phase54b-legal-reliability-incident-severity-evidence",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_RUNBOOK.md", [
  "Severity Philosophy",
  "customer impact",
  "privilege exposure",
  "automation risk",
  "operational blockage",
  "legal submission risk",
  "audit integrity risk",
  "SEV-0",
  "Immediate escalation required",
  "SEV-1",
  "Automation mutation risk",
  "SEV-2",
  "Operational blockage risk",
  "SEV-3",
  "Performance degradation risk",
  "SEV-4",
  "Minor customer-visible issue",
  "npm run verify:aibeopchin-legal-reliability-stabilization-baseline",
  "npm run verify:aibeopchin-legal-reliability-incident-severity",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_CHECKLIST.md", [
  "Phase 54-A baseline locked",
  "SEV-0 defined",
  "SEV-1 defined",
  "SEV-2 defined",
  "SEV-3 defined",
  "SEV-4 defined",
  "Role boundary incidents classified",
  "Automation risk incidents classified",
  "Action Loop incidents classified",
  "Queue incidents classified",
  "Latency incidents classified",
  "Escalation matrix defined",
  "Operator response windows defined",
  "Incident audit required",
  "Rollback evaluation readiness verified",
  "Degraded mode readiness verified",
  "Support escalation readiness verified",
]);

if (
  !read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY",
  )
) {
  throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 54-B evidence tag");
}

if (!read("package.json").includes("verify:aibeopchin-legal-reliability-incident-severity")) {
  throw new Error("missing verify:aibeopchin-legal-reliability-incident-severity");
}

inc("tools/aibeopchin_navigator.py", [
  "54-B COMPLETE · LOCKED · 54-B.1",
  "verify:aibeopchin-legal-reliability-incident-severity",
]);

execSync(
  "npm run test -- src/features/legal-reliability-production-stabilization/legal-reliability-incident-severity.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 54-B Customer Impact / Incident Severity Tracking verified");
console.log("- Phase 54-A baseline dependency: LOCKED");
console.log("- SEV-0~4 severity levels: REQUIRED");
console.log("- Role boundary classification: REQUIRED");
console.log("- Automation risk classification: REQUIRED");
console.log("- Action Loop impact classification: REQUIRED");
console.log("- Queue impact classification: REQUIRED");
console.log("- Latency degradation classification: REQUIRED");
console.log("- Escalation matrix: REQUIRED");
console.log("- Operator response windows: REQUIRED");
console.log("- Incident audit requirement: REQUIRED");
console.log(
  "verify:aibeopchin-legal-reliability-incident-severity PASS (Product Phase 54-B Customer Impact / Incident Severity Tracking)",
);
