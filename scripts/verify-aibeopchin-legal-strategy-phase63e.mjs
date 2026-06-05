import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE63E_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63E-LAWYER-REVIEW-ADOPTION-GATE";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63D-DRAFT-PARAGRAPH-GENERATOR",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63C-RISK-BACKFIRE-CHECK",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_ADOPTION_WITHOUT_LAWYER_DECISION",
  "NO_REJECTED_PARAGRAPH_DOCUMENT_INSERT",
  "NO_MODIFIED_PARAGRAPH_WITHOUT_MODIFIED_TEXT",
  "NO_DOCUMENT_INSERT_WITHOUT_ADOPTION",
  "NO_FINAL_DOCUMENT_TEXT_BY_AI",
  "NO_CLIENT_VISIBLE_ADOPTED_COUNTER_ARGUMENT_BY_DEFAULT",
  "NO_AUTO_FILED_ADOPTED_COUNTER_ARGUMENT",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "ADOPTION_AUDIT_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_LAWYER_REVIEW_ADOPTION_PHASE63E.md");
exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md");
exists("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.schema.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.policy.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.service.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.lock.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_LAWYER_REVIEW_ADOPTION_PHASE63E.md", [
  "Product Phase 63-E",
  "CounterArgumentAdoptionDecision",
  "CounterArgumentDocumentInsertCandidate",
  "DOCUMENT_INSERT_CANDIDATE",
  "COMPLETE · LOCKED · 63-E.1",
  "verify:aibeopchin-legal-strategy-phase63e",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.schema.ts", [
  "phase63e-lawyer-review-adoption-schema",
  "counterArgumentAdoptionDecisionSchema",
  "counterArgumentDocumentInsertCandidateSchema",
  "63-E.1",
  "ADOPT",
  "MODIFY",
  "REJECT",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.policy.ts", [
  "phase63e-lawyer-review-adoption-policy",
  "adoptDraftParagraph",
  "modifyDraftParagraph",
  "rejectDraftParagraph",
  "buildDocumentInsertCandidateFromDecision",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.service.ts", [
  "processLawyerAdoptionReview",
  "summarizeAdoptionReviewResult",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.lock.ts", [
  "phase63e-lawyer-review-adoption-lock",
  "COMPLETE_LOCKED",
  "PHASE63E_BOUNDARY_MARKERS",
  "PHASE63E_LAWYER_REVIEW_ADOPTION_VERIFY_SCRIPT",
  "PHASE63E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md", [
  "63-E",
  "COMPLETE · LOCKED · 63-E.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase63e",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE63E_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase63e")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase63e");
}

inc("tools/aibeopchin_navigator.py", [
  "63-E COMPLETE · LOCKED · 63-E.1",
  "verify:aibeopchin-legal-strategy-phase63e",
  "NO_ADOPTION_WITHOUT_LAWYER_DECISION",
]);

execSync(
  "npm run test -- src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.test.ts",
  { stdio: "inherit", cwd: root },
);

const phase63d = spawnSync("npm", ["run", "verify:aibeopchin-legal-strategy-phase63d"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (phase63d.status !== 0) {
  console.error("❌ Phase 63-E blocked: Phase 63-D prerequisite verify failed");
  process.exit(phase63d.status ?? 1);
}

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 63-E blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 63-E Lawyer Review & Adoption Gate verified");
console.log("- ADOPT/MODIFY: DocumentInsertCandidate promotion allowed");
console.log("- REJECT: document insert candidate blocked");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase63e PASS (Product Phase 63-E Lawyer Review & Adoption Gate)",
);
