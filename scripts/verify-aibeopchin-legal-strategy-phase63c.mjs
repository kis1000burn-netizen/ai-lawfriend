import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE63C_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63C-RISK-BACKFIRE-CHECK";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63B-COUNTER-ARGUMENT-CANDIDATE-BUILDER",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63A-OPPONENT-ARGUMENT-SCHEMA",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK",
  "NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL",
  "NO_CLIENT_VISIBLE_BACKFIRE_RISK",
  "NO_OVERSTATED_FACT_IN_COUNTER_ARGUMENT",
  "NO_WEAKNESS_EXPOSURE_WITHOUT_LAWYER_REVIEW",
  "NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE",
  "NO_UNFAVORABLE_JUDGMENT_IGNORED",
  "BACKFIRE_RISK_REPORT_AUDIT_REQUIRED",
  "LAWYER_REVIEW_REQUIRED_FOR_RISK_ACCEPTANCE",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_RISK_BACKFIRE_CHECK_PHASE63C.md");
exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md");
exists("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.schema.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.policy.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.service.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.lock.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_RISK_BACKFIRE_CHECK_PHASE63C.md", [
  "Product Phase 63-C",
  "BackfireRiskReport",
  "BackfireRiskSignal",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 63-C.1",
  "verify:aibeopchin-legal-strategy-phase63c",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.schema.ts", [
  "phase63c-risk-backfire-check-schema",
  "backfireRiskReportSchema",
  "BackfireRiskReport",
  "63-C.1",
  "OUR_WEAKNESS_EXPOSURE",
  "INCONSISTENT_WITH_PRIOR_STATEMENT",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.policy.ts", [
  "phase63c-risk-backfire-check-policy",
  "buildBackfireRiskReport",
  "evaluateCounterArgumentCandidateForBackfireCheck",
  "computeBackfireRiskLevel",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.service.ts", [
  "detectBackfireRiskSignals",
  "runBackfireRiskCheck",
  "OVERSTATED_FACT",
  "UNFAVORABLE_JUDGMENT_LINK",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.lock.ts", [
  "phase63c-risk-backfire-check-lock",
  "COMPLETE_LOCKED",
  "PHASE63C_BOUNDARY_MARKERS",
  "PHASE63C_RISK_BACKFIRE_CHECK_VERIFY_SCRIPT",
  "PHASE63C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md", [
  "63-C",
  "COMPLETE · LOCKED · 63-C.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase63c",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE63C_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase63c")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase63c");
}

inc("tools/aibeopchin_navigator.py", [
  "63-C COMPLETE · LOCKED · 63-C.1",
  "verify:aibeopchin-legal-strategy-phase63c",
  "NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK",
]);

execSync(
  "npm run test -- src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.test.ts",
  { stdio: "inherit", cwd: root },
);

const phase63b = spawnSync("npm", ["run", "verify:aibeopchin-legal-strategy-phase63b"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (phase63b.status !== 0) {
  console.error("❌ Phase 63-C blocked: Phase 63-B prerequisite verify failed");
  process.exit(phase63b.status ?? 1);
}

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 63-C blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 63-C Risk & Backfire Check verified");
console.log("- BackfireRiskReport: LAWYER_REVIEW_REQUIRED default");
console.log("- CRITICAL risk: documentUseAllowed / clientVisibleAllowed / autoFileAllowed blocked");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase63c PASS (Product Phase 63-C Risk & Backfire Check)",
);
