import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const PHASE59C_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59C-REASONING-CONTEXT";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA",
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59B-REAL-TIME-LEGAL-SIGNAL",
];

const BOUNDARY_MARKERS = [
  "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT",
  "NO_CROSS_TENANT_REASONING_CONTEXT",
  "NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY",
  "NO_SOURCELESS_CONTEXT_ITEM",
  "NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW",
  "NO_STRATEGY_OUTPUT_WITHOUT_REASONING_LIMITS",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "CONTEXT_BUNDLE_AUDIT_REQUIRED",
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

exists("docs/gongbuho/AIBEOPCHIN_GONGBUHO_REASONING_CONTEXT_PHASE59C.md");
exists("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema.ts");
exists("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.policy.ts");
exists("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder.ts");
exists("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.lock.ts");
exists("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.test.ts");

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_REASONING_CONTEXT_PHASE59C.md", [
  "Product Phase 59-C",
  "Gongbuho Retrieval-Augmented Reasoning",
  "COMPLETE · LOCKED · 59-C.1",
  "GongbuhoReasoningContextBundle",
  "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
  "verify:aibeopchin-gongbuho-intelligence-phase59c",
]);

inc("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema.ts", [
  "phase59c-gongbuho-reasoning-context-schema",
  "gongbuhoReasoningContextBundleSchema",
  "reasoningLimits",
  "excludedItems",
  "59-C.1",
]);

inc("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.policy.ts", [
  "phase59c-gongbuho-reasoning-context-policy",
  "canIncludeMemoryItemInStrongReasoning",
  "canIncludeRealTimeSignalInContext",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder.ts", [
  "phase59c-gongbuho-reasoning-context-builder",
  "buildGongbuhoReasoningContextBundle",
]);

inc("src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.lock.ts", [
  "phase59c-gongbuho-reasoning-context-lock",
  "COMPLETE_LOCKED",
  "verify:aibeopchin-gongbuho-intelligence-phase59c",
  ...BOUNDARY_MARKERS,
]);

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md", [
  "59-C",
  "COMPLETE · LOCKED · 59-C.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59c",
  "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE59C_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-gongbuho-intelligence-phase59c")) {
  throw new Error("missing verify:aibeopchin-gongbuho-intelligence-phase59c");
}

inc("tools/aibeopchin_navigator.py", [
  "59-C COMPLETE · LOCKED · 59-C.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59c",
  "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
]);

execSync(
  "npm run test -- src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 59-C Gongbuho Retrieval-Augmented Reasoning verified");
console.log("- GongbuhoReasoningContextBundle: LOCKED");
console.log("- Strong memory: LAWYER_CONFIRMED / LOCKED only");
console.log("- Approved signals: APPROVED_FOR_AI_USE only");
console.log(
  "verify:aibeopchin-gongbuho-intelligence-phase59c PASS (Product Phase 59-C Gongbuho Retrieval-Augmented Reasoning)",
);
