import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE64C_EVIDENCE_TAG =
  "EVIDENCE-20260605-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64C-JUDGMENT-REASONING-VIEW-RC";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64A-JUDGMENT-REASONING-SOURCE-MAP",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64B-JUDGMENT-REASONING-VIEW-BUILDER",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const CONSOLIDATED_RC_BOUNDARIES = [
  "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE",
  "NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW",
  "NO_CASE_OUTCOME_PREDICTION_AS_CERTAINTY",
  "NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT",
  "UNCERTAINTY_SIGNAL_REQUIRED",
  "NO_VIEW_WITHOUT_SOURCE_MAP",
  "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE",
  "NO_HIDDEN_REASONING_SOURCE",
  "NO_CERTAIN_OUTCOME_LANGUAGE",
  "NO_UNAPPROVED_SIGNAL_RENDERED_AS_AUTHORITY",
  "UNCERTAINTY_PANEL_REQUIRED",
  "LAWYER_REVIEW_REQUIRED_FOR_REASONING_VIEW_USE",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "JUDGMENT_BACKED_REASONING_MASTER_VERIFY_REQUIRED",
];

const RC_GATE_BOUNDARIES = [
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64A_SOURCE_MAP_LOCK",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64B_VIEW_BUILDER_LOCK",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_MASTER_VERIFY",
];

const BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-control-tower-brain-rc",
  "verify:aibeopchin-legal-strategy-phase64a",
  "verify:aibeopchin-legal-strategy-phase64b",
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

exists("docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_RC_LOCK_SUMMARY_PHASE64C.md");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64c-judgment-reasoning-view-rc.policy.ts");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64c-judgment-reasoning-view-rc.lock.ts");
exists("src/features/legal-strategy/judgment-backed-reasoning/phase64c-judgment-reasoning-view-rc.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_RC_LOCK_SUMMARY_PHASE64C.md", [
  "Product Phase 64-C",
  "COMPLETE · LOCKED · 64-C.1",
  "JUDGMENT_BACKED_REASONING_RC_LOCKED",
  "verify:aibeopchin-judgment-backed-reasoning-rc",
  ...CONSOLIDATED_RC_BOUNDARIES,
]);

inc("src/features/legal-strategy/judgment-backed-reasoning/phase64c-judgment-reasoning-view-rc.lock.ts", [
  "phase64c-judgment-reasoning-view-rc-gate",
  "COMPLETE_LOCKED",
  "64-C.1",
  "JUDGMENT_BACKED_REASONING_RC_LOCKED",
  "verify:aibeopchin-judgment-backed-reasoning-rc",
  ...BUNDLED_VERIFY_SCRIPTS,
]);

inc("src/features/legal-strategy/judgment-backed-reasoning/phase64c-judgment-reasoning-view-rc.policy.ts", [
  "phase64c-judgment-reasoning-view-rc-policy-v1",
  "evaluateJudgmentBackedReasoningRcGate",
  "assertJudgmentBackedReasoningRcGateAllowed",
  ...RC_GATE_BOUNDARIES,
  ...CONSOLIDATED_RC_BOUNDARIES,
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE64C_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

const pkg = read("package.json");
for (const script of [
  ...BUNDLED_VERIFY_SCRIPTS,
  "verify:aibeopchin-judgment-backed-reasoning-rc",
  "verify:aibeopchin-legal-strategy-phase64c",
]) {
  if (!pkg.includes(script)) throw new Error(`missing ${script}`);
}

inc("tools/aibeopchin_navigator.py", [
  "64-C COMPLETE · LOCKED · 64-C.1",
  "verify:aibeopchin-judgment-backed-reasoning-rc",
  "JUDGMENT_BACKED_REASONING_RC_LOCKED",
  "JUDGMENT_BACKED_REASONING_MASTER_VERIFY_REQUIRED",
]);

execSync(
  "npm run test -- src/features/legal-strategy/judgment-backed-reasoning/phase64c-judgment-reasoning-view-rc.test.ts",
  { stdio: "inherit", cwd: root },
);

for (const script of BUNDLED_VERIFY_SCRIPTS) {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: root,
  });

  if (result.status !== 0) {
    console.error(`❌ Phase 64-C RC blocked: npm run ${script}`);
    process.exit(result.status ?? 1);
  }
}

console.log("✅ Phase 64-C Judgment-backed Reasoning View RC verified");
console.log("- 64-A Judgment Reasoning Source Map: LOCKED");
console.log("- 64-B Judgment Reasoning View Builder: LOCKED");
console.log("- Platform status: JUDGMENT_BACKED_REASONING_RC_LOCKED");
console.log(
  "verify:aibeopchin-legal-strategy-phase64c PASS (Product Phase 64-C Judgment-backed Reasoning View RC)",
);
