import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const PHASE59B_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59B-REAL-TIME-LEGAL-SIGNAL";

const PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA";

const BOUNDARY_MARKERS = [
  "REAL_TIME_SIGNAL_NOT_AUTHORITY",
  "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
  "NO_UNVERIFIED_SIGNAL_IN_STRONG_REASONING",
  "NO_STALE_SIGNAL_IN_AI_CONTEXT",
  "NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW",
  "NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW",
  "SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL",
  "SIGNAL_STATUS_TRANSITION_REQUIRED",
  "COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE",
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

exists("docs/gongbuho/AIBEOPCHIN_GONGBUHO_REAL_TIME_LEGAL_SIGNAL_PHASE59B.md");
exists("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.schema.ts");
exists("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.policy.ts");
exists("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal-compiler.ts");
exists("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.lock.ts");
exists("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.test.ts");

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_REAL_TIME_LEGAL_SIGNAL_PHASE59B.md", [
  "Product Phase 59-B",
  "Real-time Legal Signal Connector",
  "COMPLETE · LOCKED · 59-B.1",
  "APPROVED_FOR_AI_USE",
  "REAL_TIME_SIGNAL_NOT_AUTHORITY",
  "COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE",
  "verify:aibeopchin-gongbuho-intelligence-phase59b",
]);

inc("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.schema.ts", [
  "phase59b-real-time-legal-signal-schema",
  "realTimeLegalSignalSchema",
  "REJECTED",
  "STALE",
  "CONFLICTED",
  "UNVERIFIED_SOURCE",
  "APPROVED_FOR_AI_USE",
]);

inc("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.policy.ts", [
  "phase59b-real-time-legal-signal-policy",
  "canTransitionRealTimeLegalSignalStatus",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal-compiler.ts", [
  "phase59b-real-time-legal-signal-compiler",
  "canUseAsStrongReasoningGround",
  "canInjectIntoPromptContext",
  "canUseInClientVisibleOutput",
  "validateCanonicalSourceRefs",
]);

inc("src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.lock.ts", [
  "phase59b-real-time-legal-signal-lock",
  "COMPLETE_LOCKED",
  "verify:aibeopchin-gongbuho-intelligence-phase59b",
  ...BOUNDARY_MARKERS,
]);

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md", [
  "59-B",
  "COMPLETE · LOCKED · 59-B.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59b",
  "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(PHASE59B_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${PHASE59B_EVIDENCE_TAG}`);
}
if (!impl.includes(PREREQ_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing prereq ${PREREQ_EVIDENCE_TAG}`);
}

if (!read("package.json").includes("verify:aibeopchin-gongbuho-intelligence-phase59b")) {
  throw new Error("missing verify:aibeopchin-gongbuho-intelligence-phase59b");
}

inc("tools/aibeopchin_navigator.py", [
  "59-B COMPLETE · LOCKED · 59-B.1",
  "verify:aibeopchin-gongbuho-intelligence-phase59b",
  "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
]);

execSync(
  "npm run test -- src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 59-B Real-time Legal Signal Connector verified");
console.log("- Signal status transitions: LOCKED");
console.log("- Compiler Policy gate: LOCKED");
console.log("- Strong reasoning ground: APPROVED_FOR_AI_USE only");
console.log(
  "verify:aibeopchin-gongbuho-intelligence-phase59b PASS (Product Phase 59-B Real-time Legal Signal Connector)",
);
