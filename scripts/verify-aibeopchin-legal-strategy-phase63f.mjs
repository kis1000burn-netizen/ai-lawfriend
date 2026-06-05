import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE63F_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63F-COUNTER-ARGUMENT-DRAFT-ENGINE-RC";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63E-LAWYER-REVIEW-ADOPTION-GATE",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const CONSOLIDATED_RC_BOUNDARIES = [
  "NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT",
  "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE",
  "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL",
  "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY",
  "NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK",
  "NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL",
  "NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK",
  "NO_FINAL_LEGAL_ARGUMENT_BY_AI",
  "NO_FINAL_DOCUMENT_TEXT_BY_AI",
  "NO_DOCUMENT_INSERT_WITHOUT_ADOPTION",
  "NO_REJECTED_PARAGRAPH_DOCUMENT_INSERT",
  "NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT",
  "NO_AUTO_FILED_COUNTER_ARGUMENT",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "ADOPTION_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_MASTER_VERIFY_REQUIRED",
];

const RC_GATE_BOUNDARIES = [
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63A_OPPONENT_ARGUMENT_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63B_CANDIDATE_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63C_BACKFIRE_CHECK_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63D_DRAFT_PARAGRAPH_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63E_ADOPTION_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_MASTER_VERIFY",
];

const SUB_PHASE_LOCK_MARKERS = [
  "PHASE63F_SUB_PHASE_LOCK_MARKERS",
  "subPhaseLockMarkers",
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

exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK_SUMMARY.md");
exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md");
exists("src/features/legal-strategy/counter-argument-engine/phase63f-counter-argument-draft-engine-rc.policy.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63f-counter-argument-draft-engine-rc.lock.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63f-counter-argument-draft-engine-rc.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK_SUMMARY.md", [
  "Product Phase 63-F",
  "COMPLETE · LOCKED · 63-F.1",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED",
  "verify:aibeopchin-counter-argument-draft-engine-rc",
  "verify:aibeopchin-legal-strategy-phase63f",
  ...CONSOLIDATED_RC_BOUNDARIES,
  ...RC_GATE_BOUNDARIES,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63f-counter-argument-draft-engine-rc.policy.ts", [
  "phase63f-counter-argument-draft-engine-rc-policy-v1",
  "evaluateCounterArgumentDraftEngineRcGate",
  "assertCounterArgumentDraftEngineRcGateAllowed",
  ...CONSOLIDATED_RC_BOUNDARIES,
  ...RC_GATE_BOUNDARIES,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63f-counter-argument-draft-engine-rc.lock.ts", [
  "phase63f-counter-argument-draft-engine-rc-gate",
  "COMPLETE_LOCKED",
  "63-F.1",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED",
  "verify:aibeopchin-counter-argument-draft-engine-rc",
  "verify:aibeopchin-legal-strategy-phase63f",
  "verify:aibeopchin-control-tower-brain-rc",
  "verify:aibeopchin-legal-strategy-phase63a",
  "verify:aibeopchin-legal-strategy-phase63b",
  "verify:aibeopchin-legal-strategy-phase63c",
  "verify:aibeopchin-legal-strategy-phase63d",
  "verify:aibeopchin-legal-strategy-phase63e",
  ...SUB_PHASE_LOCK_MARKERS,
]);

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md", [
  "63-F",
  "COMPLETE · LOCKED · 63-F.1",
  "verify:aibeopchin-counter-argument-draft-engine-rc",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_MASTER_VERIFY_REQUIRED",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE63F_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-legal-strategy-phase63f")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase63f");
}
if (!pkg.includes("verify:aibeopchin-counter-argument-draft-engine-rc")) {
  throw new Error("missing verify:aibeopchin-counter-argument-draft-engine-rc");
}

inc("tools/aibeopchin_navigator.py", [
  "63-F COMPLETE · LOCKED · 63-F.1",
  "verify:aibeopchin-counter-argument-draft-engine-rc",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_MASTER_VERIFY_REQUIRED",
]);

execSync(
  "npm run test -- src/features/legal-strategy/counter-argument-engine/phase63f-counter-argument-draft-engine-rc.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 63-F blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 63-F Counter-Argument Draft Engine RC verified");
console.log("- 63-A~63-E sub-phase locks consolidated under RC gate");
console.log("- Platform status: COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase63f PASS (Product Phase 63-F Counter-Argument Draft Engine RC)",
);
