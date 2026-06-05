import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE64A_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64A-JUDGMENT-REASONING-SOURCE-MAP";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63F-COUNTER-ARGUMENT-DRAFT-ENGINE-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-INTELLIGENCE-PLATFORM-PHASE62_70-ROADMAP",
];

const BOUNDARY_MARKERS = [
  "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE",
  "NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW",
  "NO_CASE_OUTCOME_PREDICTION_AS_CERTAINTY",
  "NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT",
  "UNCERTAINTY_SIGNAL_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_SOURCE_MAP_PHASE64A.md");
exists(
  "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.schema.ts",
);
exists(
  "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.policy.ts",
);
exists(
  "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.lock.ts",
);
exists(
  "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.test.ts",
);

inc("docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_SOURCE_MAP_PHASE64A.md", [
  "Product Phase 64-A",
  "JudgmentReasoningSourceMap",
  "COMPLETE · LOCKED · 64-A.1",
  "verify:aibeopchin-legal-strategy-phase64a",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc(
  "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.schema.ts",
  [
    "phase64a-judgment-reasoning-source-map-schema",
    "judgmentReasoningSourceMapSchema",
    "JudgmentReasoningSourceMap",
    "64-A.1",
    "JudgmentReasoningSourceEntry",
    "JudgmentReasoningUncertaintySignal",
  ],
);

inc(
  "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.policy.ts",
  [
    "phase64a-judgment-reasoning-source-map-policy",
    "buildJudgmentReasoningSourceMap",
    "buildJudgmentReasoningSourceMapFromStrategyCandidate",
    "canRenderJudgmentReasoningView",
    "detectOutcomePredictionAsCertainty",
    ...BOUNDARY_MARKERS,
  ],
);

inc(
  "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.lock.ts",
  [
    "phase64a-judgment-reasoning-source-map-lock",
    "COMPLETE_LOCKED",
    "PHASE64A_BOUNDARY_MARKERS",
    "PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERIFY_SCRIPT",
    "PHASE64A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
  ],
);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE64A_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase64a")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase64a");
}

inc("tools/aibeopchin_navigator.py", [
  "64-A COMPLETE · LOCKED · 64-A.1",
  "verify:aibeopchin-legal-strategy-phase64a",
  "NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT",
]);

execSync(
  "npm run test -- src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.test.ts",
  { stdio: "inherit", cwd: root },
);

const counterArgumentRc = spawnSync(
  "npm",
  ["run", "verify:aibeopchin-counter-argument-draft-engine-rc"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: root,
  },
);

if (counterArgumentRc.status !== 0) {
  console.error("❌ Phase 64-A blocked: Counter-Argument Draft Engine RC verify failed");
  process.exit(counterArgumentRc.status ?? 1);
}

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 64-A blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 64-A Judgment Reasoning Source Map Schema verified");
console.log("- JudgmentReasoningSourceMap: sourceTrace + uncertainty signals REQUIRED");
console.log("- Canonical judgment sources + approved real-time signals only");
console.log("- Client-visible judgment reasoning blocked by default");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase64a PASS (Product Phase 64-A Judgment Reasoning Source Map Schema)",
);
