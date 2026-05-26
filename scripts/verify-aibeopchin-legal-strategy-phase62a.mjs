import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE62A_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62A-EVIDENCE-GAP-CANDIDATE-SCHEMA";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-STRATEGY-PHASE61A-STRATEGY-CANDIDATE-SCHEMA",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-INTELLIGENCE-PLATFORM-PHASE62_70-ROADMAP",
];

const BOUNDARY_MARKERS = [
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE",
  "NO_AI_FINAL_EVIDENCE_JUDGMENT",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "LAWYER_REVIEW_REQUIRED_FOR_REQUEST",
  "GONGBUHO_REASONING_CONTEXT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "EVIDENCE_GAP_CANDIDATE_AUDIT_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_CANDIDATE_PHASE62A.md");
exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md");
exists("src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.schema.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.policy.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.lock.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_CANDIDATE_PHASE62A.md", [
  "Product Phase 62-A",
  "EvidenceGapCandidate",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 62-A.1",
  "verify:aibeopchin-legal-strategy-phase62a",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.schema.ts", [
  "phase62a-evidence-gap-candidate-schema",
  "evidenceGapCandidateSchema",
  "EvidenceGapCandidate",
  "62-A.1",
  "SuggestedSupplementItem",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.policy.ts", [
  "phase62a-evidence-gap-candidate-policy",
  "buildEvidenceGapCandidate",
  "evaluateReasoningContextForEvidenceGap",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.lock.ts", [
  "phase62a-evidence-gap-candidate-lock",
  "COMPLETE_LOCKED",
  "PHASE62A_BOUNDARY_MARKERS",
  "PHASE62A_EVIDENCE_GAP_CANDIDATE_VERIFY_SCRIPT",
  "PHASE62A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md", [
  "62-A",
  "COMPLETE · LOCKED · 62-A.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase62a",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE62A_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase62a")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase62a");
}

inc("tools/aibeopchin_navigator.py", [
  "62-A COMPLETE · LOCKED · 62-A.1",
  "verify:aibeopchin-legal-strategy-phase62a",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
]);

execSync(
  "npm run test -- src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 62-A blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 62-A Evidence Gap Candidate Schema verified");
console.log("- EvidenceGapCandidate: LAWYER_REVIEW_REQUIRED default");
console.log("- Gongbuho Reasoning Context + StrategyCandidate grounding: REQUIRED");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase62a PASS (Product Phase 62-A Evidence Gap Candidate Schema)",
);
