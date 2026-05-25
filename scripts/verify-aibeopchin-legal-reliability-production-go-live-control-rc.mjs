import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const BOUNDARY_MARKERS = [
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53A_APPROVAL_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53B_MIGRATION_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53C_ROLE_SMOKE_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53D_ACTION_SMOKE_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53E_MONITORING_LOCK",
  "NO_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_RC_WITHOUT_ROLLBACK_READINESS",
  "NO_RC_WITH_CLIENT_BOUNDARY_RISK",
  "NO_RC_WITH_AUTO_COMPLETION_OR_AUTO_FILING_RISK",
  "NO_RC_WITHOUT_MASTER_VERIFY",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53A-PRODUCTION-GO-LIVE-APPROVAL-GATE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53B-PRODUCTION-MIGRATION-LIVE-EVIDENCE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53C-PRODUCTION-ROLE-SMOKE-CLIENT-BOUNDARY",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53D-PRODUCTION-ACTION-LOOP-OPERATIONS-SMOKE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53E-POST-GO-LIVE-MONITORING-ROLLBACK-READINESS",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53F-PRODUCTION-GO-LIVE-CONTROL-RC",
];

const BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-go-live-approval-gate",
  "verify:aibeopchin-legal-reliability-production-migration-evidence",
  "verify:aibeopchin-legal-reliability-production-role-smoke",
  "verify:aibeopchin-legal-reliability-production-action-smoke",
  "verify:aibeopchin-legal-reliability-post-go-live-monitoring",
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

exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc.schema.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc.policy.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc-evidence.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc-lock.ts");
exists("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc.test.ts");
exists("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md");
exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_RUNBOOK.md");

inc("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc-lock.ts", [
  "phase53f-legal-reliability-production-go-live-control-rc-gate",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc.schema.ts", [
  "productionGoLiveControlRcEvidenceSchema",
  "evidenceChain",
  "masterVerify",
  "monitoringEvidenceRef",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc.policy.ts", [
  "evaluateProductionGoLiveControlRcGate",
  "assertProductionGoLiveControlRcGateAllowed",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53A_APPROVAL_LOCK",
  "NO_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_RC_WITHOUT_MASTER_VERIFY",
  "NO_RC_WITH_CLIENT_BOUNDARY_RISK",
  "NO_RC_WITH_AUTO_COMPLETION_OR_AUTO_FILING_RISK",
  "NO_RC_WITHOUT_ROLLBACK_READINESS",
]);

inc("src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc-evidence.ts", [
  "buildProductionGoLiveControlRcEvidence",
  "phase53f-legal-reliability-production-go-live-control-rc-evidence",
]);

inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md", [
  "Product Phase 53-F",
  "COMPLETE · LOCKED · 53-F.1",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
  "53-A",
  "53-E",
]);

inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_RUNBOOK.md", [
  "53-F Production Go-Live Control RC",
  "53-A approval gate locked",
  "53-E post-go-live monitoring locked",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
  "COMPLETE · LOCKED",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of EVIDENCE_TAGS) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

const pkg = read("package.json");
for (const script of [
  ...BUNDLED_VERIFY_SCRIPTS,
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
]) {
  if (!pkg.includes(script)) throw new Error(`missing ${script}`);
}

inc("tools/aibeopchin_navigator.py", [
  "Product Phase 53 COMPLETE · LOCKED",
  "53-F COMPLETE · LOCKED · 53-F.1",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
]);

inc("DEPLOY_PRECHECK.md", [
  "5.5.9",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
  "Production go-live is not considered closed until Phase 53-F is COMPLETE · LOCKED",
]);

inc("docs/OPERATIONS_INDEX.md", [
  "PRODUCTION_GO_LIVE_CONTROL_RC_RUNBOOK",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
]);

inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "53-F",
  "COMPLETE · LOCKED · 53-F.1",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
]);

execSync(
  "npm run test -- src/features/legal-reliability-go-live-control/legal-reliability-go-live-control-rc.test.ts",
  { stdio: "inherit", cwd: root },
);

for (const script of BUNDLED_VERIFY_SCRIPTS) {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: root,
  });

  if (result.status !== 0) {
    console.error(`❌ Phase 53-F RC blocked: npm run ${script}`);
    process.exit(result.status ?? 1);
  }
}

console.log("✅ Phase 53-F Production Go-Live Control RC verified");
console.log("- 53-A approval gate: LOCKED");
console.log("- 53-B production migration evidence: LOCKED");
console.log("- 53-C role smoke/client boundary: LOCKED");
console.log("- 53-D action loop/operations smoke: LOCKED");
console.log("- 53-E post-go-live monitoring/rollback readiness: LOCKED");
console.log("- Production Go-Live Control: COMPLETE · LOCKED");
console.log(
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc PASS (Product Phase 53-F Production Go-Live Control RC)",
);
