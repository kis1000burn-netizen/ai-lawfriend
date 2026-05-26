import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE61A_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-STRATEGY-PHASE61A-STRATEGY-CANDIDATE-SCHEMA";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59F-RC-LOCK",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_AI_FINAL_LEGAL_STRATEGY",
  "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
  "LAWYER_REVIEW_REQUIRED_FOR_STRATEGY_USE",
  "GONGBUHO_REASONING_CONTEXT_REQUIRED",
  "NO_STRATEGY_WITHOUT_SOURCE_TRACE",
  "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL",
  "NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY",
  "NO_AUTO_FILING_OR_CLIENT_REQUEST",
  "STRATEGY_CANDIDATE_AUDIT_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_STRATEGY_CANDIDATE_PHASE61A.md");
exists("docs/legal-strategy/AIBEOPCHIN_AI_LEGAL_STRATEGY_ASSISTANT_PHASE61_SPEC.md");
exists("src/features/legal-strategy-assistant/phase61a-strategy-candidate.schema.ts");
exists("src/features/legal-strategy-assistant/phase61a-strategy-candidate.policy.ts");
exists("src/features/legal-strategy-assistant/phase61a-strategy-candidate.lock.ts");
exists("src/features/legal-strategy-assistant/phase61a-strategy-candidate.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_STRATEGY_CANDIDATE_PHASE61A.md", [
  "Product Phase 61-A",
  "StrategyCandidate",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 61-A.1",
  "verify:aibeopchin-legal-strategy-phase61a",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy-assistant/phase61a-strategy-candidate.schema.ts", [
  "phase61a-strategy-candidate-schema",
  "strategyCandidateSchema",
  "StrategyCandidate",
  "61-A.1",
  "GONGBUHO_REASONING_CONTEXT",
]);

inc("src/features/legal-strategy-assistant/phase61a-strategy-candidate.policy.ts", [
  "phase61a-strategy-candidate-policy",
  "buildStrategyCandidate",
  "evaluateReasoningContextForStrategy",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy-assistant/phase61a-strategy-candidate.lock.ts", [
  "phase61a-strategy-candidate-lock",
  "COMPLETE_LOCKED",
  "PHASE61A_BOUNDARY_MARKERS",
  "PHASE61A_STRATEGY_CANDIDATE_VERIFY_SCRIPT",
  "PHASE61A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_AI_LEGAL_STRATEGY_ASSISTANT_PHASE61_SPEC.md", [
  "61-A",
  "COMPLETE · LOCKED · 61-A.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase61a",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE61A_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase61a")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase61a");
}

inc("tools/aibeopchin_navigator.py", [
  "61-A COMPLETE · LOCKED · 61-A.1",
  "verify:aibeopchin-legal-strategy-phase61a",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
]);

execSync(
  "npm run test -- src/features/legal-strategy-assistant/phase61a-strategy-candidate.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 61-A blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 61-A AI Legal Strategy Candidate Schema verified");
console.log("- StrategyCandidate: LAWYER_REVIEW_REQUIRED default");
console.log("- Gongbuho Reasoning Context grounding: REQUIRED");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase61a PASS (Product Phase 61-A Strategy Candidate Schema)",
);
