import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const PHASE59E_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59E-REUSABLE-LEGAL-PATTERN";

const PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59D-LAWYER-FEEDBACK-LEARNING";

const BOUNDARY_MARKERS = [
  "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
  "NO_RAW_CLIENT_FACT_IN_PATTERN",
  "NO_PATTERN_WITHOUT_ANONYMIZATION",
  "NO_PATTERN_WITHOUT_LAWYER_APPROVED_OR_MODIFIED_SOURCE",
  "NO_GLOBAL_PATTERN_WITHOUT_EXTRA_GOVERNANCE",
  "NO_CROSS_TENANT_PATTERN_WITHOUT_POLICY",
  "NO_PATTERN_WITHOUT_AUDIT_REF",
  "NO_PATTERN_WITHOUT_SOURCE_TRACE",
  "NO_PATTERN_DIRECTLY_VISIBLE_TO_CLIENT",
  "PATTERN_REUSE_SCOPE_REQUIRED",
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

exists("docs/gongbuho/AIBEOPCHIN_GONGBUHO_REUSABLE_LEGAL_PATTERN_PHASE59E.md");
exists("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema.ts");
exists("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.policy.ts");
exists("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.builder.ts");
exists("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.lock.ts");
exists("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.test.ts");

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_REUSABLE_LEGAL_PATTERN_PHASE59E.md", [
  "Product Phase 59-E",
  "Reusable Legal Pattern Library",
  "COMPLETE · LOCKED · 59-E.1",
  "ReusableLegalPattern",
  "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
  "APPROVED_FOR_REUSE",
  "verify:aibeopchin-gongbuho-intelligence-phase59e",
]);

inc("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema.ts", [
  "phase59e-reusable-legal-pattern-schema",
  "reusableLegalPatternSchema",
  "sourceTraceIds",
  "rawClientFactIncluded",
  "anonymizationVerified",
  "clientDirectVisible",
]);

inc("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.policy.ts", [
  "phase59e-reusable-legal-pattern-policy",
  "evaluateReusableLegalPatternCreation",
  "evaluateReusableLegalPatternReasoningAssist",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.builder.ts", [
  "phase59e-reusable-legal-pattern-builder",
  "buildReusableLegalPatternFromLearningTrace",
  "canUseReusableLegalPatternForReasoningAssist",
]);

inc("src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.lock.ts", [
  "phase59e-reusable-legal-pattern-lock",
  "COMPLETE_LOCKED",
  "verify:aibeopchin-gongbuho-intelligence-phase59e",
  ...BOUNDARY_MARKERS,
]);

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md", [
  "59-E",
  "COMPLETE · LOCKED · 59-E.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59e",
  "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(PHASE59E_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${PHASE59E_EVIDENCE_TAG}`);
}
if (!impl.includes(PREREQ_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing prereq ${PREREQ_EVIDENCE_TAG}`);
}

if (!read("package.json").includes("verify:aibeopchin-gongbuho-intelligence-phase59e")) {
  throw new Error("missing verify:aibeopchin-gongbuho-intelligence-phase59e");
}

inc("tools/aibeopchin_navigator.py", [
  "59-E COMPLETE · LOCKED · 59-E.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59e",
  "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
]);

execSync(
  "npm run test -- src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 59-E Reusable Legal Pattern Library verified");
console.log("- ReusableLegalPattern: LOCKED");
console.log("- APPROVED_FOR_REUSE only for reasoning assist");
console.log("- REJECTED trace promotion: BLOCKED");
console.log(
  "verify:aibeopchin-gongbuho-intelligence-phase59e PASS (Product Phase 59-E Reusable Legal Pattern Library)",
);
