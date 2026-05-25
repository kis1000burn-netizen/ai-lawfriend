import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const PHASE59D_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59D-LAWYER-FEEDBACK-LEARNING";

const PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59C-REASONING-CONTEXT";

const BOUNDARY_MARKERS = [
  "NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION",
  "NO_REJECTED_SUGGESTION_REUSE",
  "NO_RAW_CLIENT_FACT_IN_REUSABLE_TRACE",
  "NO_GLOBAL_REUSE_WITHOUT_ANONYMIZATION",
  "NO_CROSS_TENANT_LEARNING_WITHOUT_POLICY",
  "NO_AI_SELF_REINFORCEMENT_WITHOUT_REVIEW",
  "NO_LEARNING_TRACE_WITHOUT_SOURCE_BUNDLE",
  "NO_LEARNING_TRACE_WITHOUT_AUDIT_REF",
  "LAWYER_DECISION_LEDGER_REQUIRED",
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

exists("docs/gongbuho/AIBEOPCHIN_GONGBUHO_LAWYER_FEEDBACK_LEARNING_PHASE59D.md");
exists("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.schema.ts");
exists("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.policy.ts");
exists("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.service.ts");
exists("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.lock.ts");
exists("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.test.ts");

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_LAWYER_FEEDBACK_LEARNING_PHASE59D.md", [
  "Product Phase 59-D",
  "Lawyer Feedback Learning Loop",
  "COMPLETE · LOCKED · 59-D.1",
  "GongbuhoLearningTrace",
  "NO_REJECTED_SUGGESTION_REUSE",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "verify:aibeopchin-gongbuho-intelligence-phase59d",
]);

inc("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.schema.ts", [
  "phase59d-lawyer-feedback-learning-schema",
  "gongbuhoLawyerFeedbackLearningTraceSchema",
  "sourceBundleId",
  "rawClientFactIncluded",
  "lawyerDecisionLedgerRef",
]);

inc("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.policy.ts", [
  "phase59d-lawyer-feedback-learning-policy",
  "evaluateLawyerFeedbackLearningTraceCreation",
  "evaluateLearningTraceReusability",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.service.ts", [
  "phase59d-lawyer-feedback-learning-service",
  "createLawyerFeedbackLearningTraceService",
  "buildLawyerFeedbackDecisionLedgerEntry",
]);

inc("src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.lock.ts", [
  "phase59d-lawyer-feedback-learning-lock",
  "COMPLETE_LOCKED",
  "verify:aibeopchin-gongbuho-intelligence-phase59d",
  ...BOUNDARY_MARKERS,
]);

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md", [
  "59-D",
  "COMPLETE · LOCKED · 59-D.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59d",
  "NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(PHASE59D_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${PHASE59D_EVIDENCE_TAG}`);
}
if (!impl.includes(PREREQ_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing prereq ${PREREQ_EVIDENCE_TAG}`);
}

if (!read("package.json").includes("verify:aibeopchin-gongbuho-intelligence-phase59d")) {
  throw new Error("missing verify:aibeopchin-gongbuho-intelligence-phase59d");
}

inc("tools/aibeopchin_navigator.py", [
  "59-D COMPLETE · LOCKED · 59-D.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59d",
  "NO_REJECTED_SUGGESTION_REUSE",
]);

execSync(
  "npm run test -- src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 59-D Lawyer Feedback Learning Loop verified");
console.log("- GongbuhoLearningTrace: LOCKED");
console.log("- Lawyer Decision Ledger: REQUIRED");
console.log("- REJECTED reuse: BLOCKED");
console.log(
  "verify:aibeopchin-gongbuho-intelligence-phase59d PASS (Product Phase 59-D Lawyer Feedback Learning Loop)",
);
