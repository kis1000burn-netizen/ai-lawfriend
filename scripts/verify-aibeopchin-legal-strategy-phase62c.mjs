import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE62C_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62C-SUPPLEMENT-REQUEST-DRAFT-GENERATOR";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62B-EVIDENCE-GAP-DETECTION-ENGINE",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP",
  "NO_CLIENT_VISIBLE_DRAFT_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_SEND_SUPPLEMENT_REQUEST",
  "NO_AUTO_KAKAO_OR_EMAIL_MESSAGE",
  "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_DRAFT_WITHOUT_SOURCE_TRACE",
  "NO_DRAFT_WITHOUT_AUDIT_REF",
  "LAWYER_REVIEW_REQUIRED_FOR_SUPPLEMENT_REQUEST",
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

exists("docs/legal-strategy/AIBEOPCHIN_SUPPLEMENT_REQUEST_DRAFT_GENERATOR_PHASE62C.md");
exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md");
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.schema.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.policy.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.service.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.lock.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.test.ts",
);

inc("docs/legal-strategy/AIBEOPCHIN_SUPPLEMENT_REQUEST_DRAFT_GENERATOR_PHASE62C.md", [
  "Product Phase 62-C",
  "SupplementRequestDraft",
  "CLIENT_COLLABORATION_PORTAL_DRAFT",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETE · LOCKED · 62-C.1",
  "verify:aibeopchin-legal-strategy-phase62c",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.schema.ts", [
  "phase62c-supplement-request-draft-schema",
  "supplementRequestDraftSchema",
  "SupplementRequestDraft",
  "62-C.1",
  "clientSafeDraftItems",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.policy.ts", [
  "phase62c-supplement-request-draft-policy",
  "buildSupplementRequestDraft",
  "assertSupplementRequestDraftAllowed",
  "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.service.ts", [
  "generateSupplementRequestDraftFromDetectionReport",
  "generateSupplementRequestDraftsFromDetectionReport",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.lock.ts", [
  "phase62c-supplement-request-draft-lock",
  "COMPLETE_LOCKED",
  "PHASE62C_BOUNDARY_MARKERS",
  "PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERIFY_SCRIPT",
  "PHASE62C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md", [
  "62-C",
  "COMPLETE · LOCKED · 62-C.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase62c",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE62C_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase62c")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase62c");
}

inc("tools/aibeopchin_navigator.py", [
  "62-C COMPLETE · LOCKED · 62-C.1",
  "verify:aibeopchin-legal-strategy-phase62c",
  "NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP",
]);

execSync(
  "npm run test -- src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 62-C blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 62-C Supplement Request Draft Generator verified");
console.log("- SupplementRequestDraft: clientVisible/send/autoMessage/autoTask blocked");
console.log("- CLIENT_COLLABORATION_PORTAL_DRAFT only · internal strategy leak blocked");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase62c PASS (Product Phase 62-C Supplement Request Draft Generator)",
);
