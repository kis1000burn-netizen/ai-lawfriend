import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE63D_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63D-DRAFT-PARAGRAPH-GENERATOR";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63C-RISK-BACKFIRE-CHECK",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63B-COUNTER-ARGUMENT-CANDIDATE-BUILDER",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_DRAFT_PARAGRAPH_WITHOUT_COUNTER_ARGUMENT",
  "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK",
  "NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK",
  "NO_FINAL_DOCUMENT_TEXT_BY_AI",
  "NO_DOCUMENT_INSERT_WITHOUT_LAWYER_APPROVAL",
  "NO_CLIENT_VISIBLE_DRAFT_PARAGRAPH",
  "NO_AUTO_FILED_DRAFT_PARAGRAPH",
  "NO_PARAGRAPH_WITHOUT_SOURCE_TRACE",
  "NO_PARAGRAPH_WITHOUT_AUDIT_REF",
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

exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_PARAGRAPH_GENERATOR_PHASE63D.md");
exists("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md");
exists("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.schema.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.policy.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.service.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.lock.ts");
exists("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_PARAGRAPH_GENERATOR_PHASE63D.md", [
  "Product Phase 63-D",
  "CounterArgumentDraftParagraph",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 63-D.1",
  "verify:aibeopchin-legal-strategy-phase63d",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.schema.ts", [
  "phase63d-draft-paragraph-generator-schema",
  "counterArgumentDraftParagraphSchema",
  "CounterArgumentDraftParagraph",
  "63-D.1",
  "FACTUAL_REBUTTAL",
  "JUDGMENT_DISTINCTION",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.policy.ts", [
  "phase63d-draft-paragraph-generator-policy",
  "buildCounterArgumentDraftParagraph",
  "evaluateDraftParagraphGenerationGate",
  "evaluateBackfireRiskReportForDraftParagraphGeneration",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.service.ts", [
  "generateDraftParagraphsFromCandidate",
  "summarizeDraftParagraph",
  "FACTUAL_REBUTTAL",
]);

inc("src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.lock.ts", [
  "phase63d-draft-paragraph-generator-lock",
  "COMPLETE_LOCKED",
  "PHASE63D_BOUNDARY_MARKERS",
  "PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERIFY_SCRIPT",
  "PHASE63D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md", [
  "63-D",
  "COMPLETE · LOCKED · 63-D.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase63d",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE63D_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase63d")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase63d");
}

inc("tools/aibeopchin_navigator.py", [
  "63-D COMPLETE · LOCKED · 63-D.1",
  "verify:aibeopchin-legal-strategy-phase63d",
  "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK",
]);

execSync(
  "npm run test -- src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.test.ts",
  { stdio: "inherit", cwd: root },
);

const phase63c = spawnSync("npm", ["run", "verify:aibeopchin-legal-strategy-phase63c"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (phase63c.status !== 0) {
  console.error("❌ Phase 63-D blocked: Phase 63-C prerequisite verify failed");
  process.exit(phase63c.status ?? 1);
}

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 63-D blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 63-D Draft Paragraph Generator verified");
console.log("- CounterArgumentDraftParagraph: LAWYER_REVIEW_REQUIRED default");
console.log("- CRITICAL risk: draft paragraph generation blocked");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase63d PASS (Product Phase 63-D Draft Paragraph Generator)",
);
