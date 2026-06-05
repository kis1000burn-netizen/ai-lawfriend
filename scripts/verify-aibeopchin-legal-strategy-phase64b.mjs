import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE64B_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64B-JUDGMENT-REASONING-VIEW-BUILDER";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64A-JUDGMENT-REASONING-SOURCE-MAP",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-INTELLIGENCE-PLATFORM-PHASE62_70-ROADMAP",
];

const BOUNDARY_MARKERS = [
  "NO_VIEW_WITHOUT_SOURCE_MAP",
  "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE",
  "NO_HIDDEN_REASONING_SOURCE",
  "NO_CERTAIN_OUTCOME_LANGUAGE",
  "NO_CLIENT_VISIBLE_REASONING_VIEW_BY_DEFAULT",
  "NO_UNAPPROVED_SIGNAL_RENDERED_AS_AUTHORITY",
  "UNCERTAINTY_PANEL_REQUIRED",
  "LAWYER_REVIEW_REQUIRED_FOR_REASONING_VIEW_USE",
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

exists("docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_BUILDER_PHASE64B.md");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.schema.ts");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.policy.ts");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.service.ts");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.lock.ts");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_BUILDER_PHASE64B.md", [
  "Product Phase 64-B",
  "JudgmentReasoningView",
  "COMPLETE · LOCKED · 64-B.1",
  "verify:aibeopchin-legal-strategy-phase64b",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.schema.ts", [
  "phase64b-judgment-reasoning-view-schema",
  "judgmentReasoningViewSchema",
  "JudgmentReasoningView",
  "64-B.1",
  "JudgmentReasoningCard",
  "JudgmentReasoningUncertaintyPanel",
]);

inc("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.policy.ts", [
  "phase64b-judgment-reasoning-view-policy",
  "buildJudgmentReasoningView",
  "buildJudgmentReasoningCards",
  "buildJudgmentFavorabilityBadge",
  "buildUncertaintyPanel",
  "assertJudgmentReasoningViewAllowed",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.service.ts", [
  "phase64b-judgment-reasoning-view-service",
  "composeJudgmentReasoningView",
]);

inc("src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.lock.ts", [
  "phase64b-judgment-reasoning-view-lock",
  "COMPLETE_LOCKED",
  "PHASE64B_BOUNDARY_MARKERS",
  "PHASE64B_JUDGMENT_REASONING_VIEW_VERIFY_SCRIPT",
  "PHASE64B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE64B_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase64b")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase64b");
}

inc("tools/aibeopchin_navigator.py", [
  "64-B COMPLETE · LOCKED · 64-B.1",
  "verify:aibeopchin-legal-strategy-phase64b",
  "NO_CLIENT_VISIBLE_REASONING_VIEW_BY_DEFAULT",
]);

execSync(
  "npm run test -- src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.test.ts",
  { stdio: "inherit", cwd: root },
);

const phase64a = spawnSync("npm", ["run", "verify:aibeopchin-legal-strategy-phase64a"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (phase64a.status !== 0) {
  console.error("❌ Phase 64-B blocked: Phase 64-A verify failed");
  process.exit(phase64a.status ?? 1);
}

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 64-B blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 64-B Judgment Reasoning View Builder verified");
console.log("- JudgmentReasoningView: source map + cards + uncertainty panel REQUIRED");
console.log("- Canonical judgment cards + approved signal authority only");
console.log("- Client-visible reasoning view blocked by default");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase64b PASS (Product Phase 64-B Judgment Reasoning View Builder)",
);
