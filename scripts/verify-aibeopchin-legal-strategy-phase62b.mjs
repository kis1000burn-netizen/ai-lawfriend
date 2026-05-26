import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE62B_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62B-EVIDENCE-GAP-DETECTION-ENGINE";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62A-EVIDENCE-GAP-CANDIDATE-SCHEMA",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_DETECTION_WITHOUT_REASONING_CONTEXT",
  "NO_DETECTION_WITHOUT_SOURCE_TRACE",
  "NO_CLIENT_VISIBLE_DETECTION_REPORT",
  "NO_AUTO_SUPPLEMENT_REQUEST_FROM_DETECTION",
  "NO_AUTO_TASK_CREATION_FROM_DETECTION",
  "NO_AUTO_FILING_FROM_DETECTION",
  "NO_GAP_FROM_UNAPPROVED_SIGNAL",
  "NO_GAP_FROM_AI_CANDIDATE_MEMORY",
  "NO_CROSS_TENANT_GAP_DETECTION",
  "DETECTION_REPORT_AUDIT_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_DETECTION_ENGINE_PHASE62B.md");
exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md");
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.schema.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.policy.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.service.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.lock.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.test.ts",
);

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_DETECTION_ENGINE_PHASE62B.md", [
  "Product Phase 62-B",
  "EvidenceGapDetectionReport",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 62-B.1",
  "verify:aibeopchin-legal-strategy-phase62b",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.schema.ts", [
  "phase62b-evidence-gap-detection-engine-schema",
  "evidenceGapDetectionReportSchema",
  "EvidenceGapDetectionReport",
  "62-B.1",
  "CLAIM_EVIDENCE",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.policy.ts", [
  "phase62b-evidence-gap-detection-policy",
  "assertEvidenceGapDetectionAllowed",
  "evaluateStrategyCandidateForDetection",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.service.ts", [
  "detectEvidenceGapsFromReasoningContext",
  "rankEvidenceGapCandidates",
  "buildEvidenceGapDetectionReport",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.lock.ts", [
  "phase62b-evidence-gap-detection-engine-lock",
  "COMPLETE_LOCKED",
  "PHASE62B_BOUNDARY_MARKERS",
  "PHASE62B_EVIDENCE_GAP_DETECTION_VERIFY_SCRIPT",
  "PHASE62B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md", [
  "62-B",
  "COMPLETE · LOCKED · 62-B.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase62b",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE62B_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase62b")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase62b");
}

inc("tools/aibeopchin_navigator.py", [
  "62-B COMPLETE · LOCKED · 62-B.1",
  "verify:aibeopchin-legal-strategy-phase62b",
  "NO_DETECTION_WITHOUT_REASONING_CONTEXT",
]);

execSync(
  "npm run test -- src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 62-B blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 62-B Evidence Gap Detection Engine verified");
console.log("- EvidenceGapDetectionReport: clientVisible/autoTask/autoFiling blocked");
console.log("- Gongbuho Reasoning Context + StrategyCandidate sourceTrace comparison: REQUIRED");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase62b PASS (Product Phase 62-B Evidence Gap Detection Engine)",
);
