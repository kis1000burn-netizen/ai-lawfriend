import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_STABILIZATION_RC_WITHOUT_54A_BASELINE_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54B_SEVERITY_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54C_HOTFIX_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54D_DEGRADED_MODE_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54E_SUPPORT_LOCK",
  "NO_STABILIZATION_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_STABILIZATION_RC_WITHOUT_CUSTOMER_SAFE_OPERATION",
  "NO_STABILIZATION_RC_WITHOUT_ROLLBACK_AND_DEGRADE_READINESS",
  "NO_STABILIZATION_RC_WITHOUT_SUPPORT_ESCALATION_READY",
  "NO_STABILIZATION_RC_WITHOUT_MASTER_VERIFY",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54A-PRODUCTION-STABILIZATION-MONITORING-BASELINE",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54D-DEGRADED-MODE",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54E-SUPPORT-OPS-ESCALATION",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54F-PRODUCTION-STABILIZATION-RC",
];

const BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-stabilization-baseline",
  "verify:aibeopchin-legal-reliability-incident-severity",
  "verify:aibeopchin-legal-reliability-hotfix-governance",
  "verify:aibeopchin-legal-reliability-degraded-mode",
  "verify:aibeopchin-legal-reliability-support-escalation",
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

exists("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc.schema.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc.policy.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc-evidence.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc-lock.ts");
exists("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc.test.ts");
exists("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_LOCK_SUMMARY.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_RUNBOOK.md");

inc("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc-lock.ts", [
  "phase54f-legal-reliability-production-stabilization-rc-gate",
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
  "COMMERCIALLY_STABLE_OPERATION",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc.schema.ts", [
  "productionStabilizationRcEvidenceSchema",
  "evidenceChain",
  "masterVerify",
  "customerSafeOperation",
  "safetyReadiness",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc.policy.ts", [
  "evaluateProductionStabilizationRcGate",
  "assertProductionStabilizationRcGateAllowed",
  "NO_STABILIZATION_RC_WITHOUT_54A_BASELINE_LOCK",
  "NO_STABILIZATION_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_STABILIZATION_RC_WITHOUT_MASTER_VERIFY",
  "NO_STABILIZATION_RC_WITHOUT_SUPPORT_ESCALATION_READY",
]);

inc("src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc-evidence.ts", [
  "buildProductionStabilizationRcEvidence",
  "phase54f-legal-reliability-production-stabilization-rc-evidence",
]);

inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_LOCK_SUMMARY.md", [
  "Product Phase 54-F",
  "COMPLETE · LOCKED · 54-F.1",
  "Commercially Stable Operation",
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
  "54-A",
  "54-E",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_RUNBOOK.md", [
  "54-F Production Stabilization RC",
  "54-A Monitoring Baseline COMPLETE · LOCKED",
  "54-E Support Escalation COMPLETE · LOCKED",
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
  "COMPLETE · LOCKED",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of EVIDENCE_TAGS) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

const pkg = read("package.json");
for (const script of [
  ...BUNDLED_VERIFY_SCRIPTS,
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
]) {
  if (!pkg.includes(script)) throw new Error(`missing ${script}`);
}

inc("tools/aibeopchin_navigator.py", [
  "Product Phase 54 COMPLETE · LOCKED",
  "54-F COMPLETE · LOCKED · 54-F.1",
  "COMMERCIALLY_STABLE_OPERATION",
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
]);

inc("DEPLOY_PRECHECK.md", [
  "5.5.15",
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
  "Commercially Stable Operation",
]);

inc("docs/OPERATIONS_INDEX.md", [
  "PRODUCTION_STABILIZATION_RC_RUNBOOK",
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
]);

inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "54-F",
  "COMPLETE · LOCKED · 54-F.1",
  "Commercially Stable Operation",
  "verify:aibeopchin-legal-reliability-production-stabilization-rc",
]);

inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_PHASE54_SPEC.md", [
  "Commercially Stable Operation",
  "54-F COMPLETE · LOCKED · 54-F.1",
]);

execSync(
  "npm run test -- src/features/legal-reliability-production-stabilization/legal-reliability-production-stabilization-rc.test.ts",
  { stdio: "inherit", cwd: root },
);

for (const script of BUNDLED_VERIFY_SCRIPTS) {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: root,
  });

  if (result.status !== 0) {
    console.error(`❌ Phase 54-F RC blocked: npm run ${script}`);
    process.exit(result.status ?? 1);
  }
}

console.log("✅ Phase 54-F Production Stabilization RC verified");
console.log("- 54-A Monitoring Baseline: LOCKED");
console.log("- 54-B Incident Severity: LOCKED");
console.log("- 54-C Hotfix Governance: LOCKED");
console.log("- 54-D Degraded Mode: LOCKED");
console.log("- 54-E Support Escalation: LOCKED");
console.log("- Legal Reliability: Commercially Stable Operation");
console.log(
  "verify:aibeopchin-legal-reliability-production-stabilization-rc PASS (Product Phase 54-F Production Stabilization RC)",
);
