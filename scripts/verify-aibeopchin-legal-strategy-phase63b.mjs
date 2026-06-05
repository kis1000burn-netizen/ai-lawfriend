import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE63B_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63B-COUNTER-ARGUMENT-CANDIDATE-BUILDER";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63A-OPPONENT-ARGUMENT-SCHEMA",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62F-EVIDENCE-GAP-AUTO-PLANNER-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT",
  "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE",
  "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL",
  "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY",
  "NO_FINAL_LEGAL_ARGUMENT_BY_AI",
  "NO_AUTO_FILED_COUNTER_ARGUMENT",
  "NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT",
  "LAWYER_REVIEW_REQUIRED_FOR_COUNTER_ARGUMENT",
  "COUNTER_ARGUMENT_AUDIT_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_CANDIDATE_BUILDER_PHASE63B.md");
exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md");
exists("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.schema.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.policy.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.service.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.lock.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_CANDIDATE_BUILDER_PHASE63B.md", [
  "Product Phase 63-B",
  "CounterArgumentCandidate",
  "CounterArgumentDecomposition",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 63-B.1",
  "verify:aibeopchin-legal-strategy-phase63b",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.schema.ts", [
  "phase63b-counter-argument-candidate-schema",
  "counterArgumentCandidateSchema",
  "CounterArgumentCandidate",
  "63-B.1",
  "CounterArgumentDecomposition",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.policy.ts", [
  "phase63b-counter-argument-candidate-policy",
  "buildCounterArgumentCandidate",
  "evaluateReasoningContextForCounterArgument",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.service.ts", [
  "buildCounterArgumentCandidateFromOpponentArgument",
  "buildCounterArgumentDecomposition",
  "generateCounterArgumentCandidatesFromOpponentArguments",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.lock.ts", [
  "phase63b-counter-argument-candidate-lock",
  "COMPLETE_LOCKED",
  "PHASE63B_BOUNDARY_MARKERS",
  "PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERIFY_SCRIPT",
  "PHASE63B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md", [
  "63-B",
  "COMPLETE · LOCKED · 63-B.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase63b",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE63B_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase63b")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase63b");
}

inc("tools/aibeopchin_navigator.py", [
  "63-B COMPLETE · LOCKED · 63-B.1",
  "verify:aibeopchin-legal-strategy-phase63b",
  "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT",
]);

execSync(
  "npm run test -- src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 63-B blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 63-B Counter-Argument Candidate Builder verified");
console.log("- CounterArgumentCandidate: LAWYER_REVIEW_REQUIRED default");
console.log("- OpponentArgument + Gongbuho Reasoning Context grounding: REQUIRED");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase63b PASS (Product Phase 63-B Counter-Argument Candidate Builder)",
);
