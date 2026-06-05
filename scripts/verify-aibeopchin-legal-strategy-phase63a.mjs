import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE63A_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63A-OPPONENT-ARGUMENT-SCHEMA";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62F-EVIDENCE-GAP-AUTO-PLANNER-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-INTELLIGENCE-PLATFORM-PHASE62_70-ROADMAP",
];

const BOUNDARY_MARKERS = [
  "NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT",
  "NO_AUTO_FILED_COUNTER_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE",
  "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL",
  "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY",
  "NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT",
  "NO_FINAL_LEGAL_ARGUMENT_BY_AI",
  "LAWYER_REVIEW_REQUIRED_FOR_DOCUMENT_USE",
  "OPPONENT_ARGUMENT_AUDIT_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_OPPONENT_ARGUMENT_SCHEMA_PHASE63A.md");
exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md");
exists("src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.schema.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.policy.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.lock.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_OPPONENT_ARGUMENT_SCHEMA_PHASE63A.md", [
  "Product Phase 63-A",
  "OpponentArgument",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 63-A.1",
  "verify:aibeopchin-legal-strategy-phase63a",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.schema.ts", [
  "phase63a-opponent-argument-schema",
  "opponentArgumentSchema",
  "OpponentArgument",
  "63-A.1",
  "OpponentPremiseFact",
  "OpponentLegalPoint",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.policy.ts", [
  "phase63a-opponent-argument-policy",
  "buildOpponentArgument",
  "buildOpponentArgumentFromMemoryClaim",
  "evaluateReasoningContextForOpponentArgument",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.lock.ts", [
  "phase63a-opponent-argument-lock",
  "COMPLETE_LOCKED",
  "PHASE63A_BOUNDARY_MARKERS",
  "PHASE63A_OPPONENT_ARGUMENT_VERIFY_SCRIPT",
  "PHASE63A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md", [
  "63-A",
  "COMPLETE · LOCKED · 63-A.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase63a",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE63A_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase63a")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase63a");
}

inc("tools/aibeopchin_navigator.py", [
  "63-A COMPLETE · LOCKED · 63-A.1",
  "verify:aibeopchin-legal-strategy-phase63a",
  "NO_AUTO_FILED_COUNTER_ARGUMENT",
]);

execSync(
  "npm run test -- src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 63-A blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 63-A Opponent Argument Schema verified");
console.log("- OpponentArgument: LAWYER_REVIEW_REQUIRED default · auto-confirmed blocked");
console.log("- Gongbuho Reasoning Context + sourceTrace grounding: REQUIRED");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase63a PASS (Product Phase 63-A Opponent Argument Schema)",
);
