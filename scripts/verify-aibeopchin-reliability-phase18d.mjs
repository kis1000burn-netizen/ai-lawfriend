import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/reliability/ai-fallback-circuit-breaker.schema.ts",
  "src/features/platform/reliability/ai-fallback-circuit-breaker.policy.ts",
  "src/features/platform/reliability/ai-fallback-circuit-breaker.service.ts",
  "src/features/platform/reliability/ai-circuit-state.store.ts",
  "src/features/platform/reliability/ai-fallback-circuit-breaker.policy.test.ts",
  "docs/operations/AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md",
  "prisma/migrations/20260524250000_reliability_ai_call_retry_source_phase18d/migration.sql",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18D-AI-FALLBACK-CIRCUIT-BREAKER";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required Phase 18-D file: ${file}`);
  }
}

assertIncludes("src/features/platform/reliability/ai-fallback-circuit-breaker.schema.ts", [
  "RELIABILITY_AI_FALLBACK_CIRCUIT_BREAKER_MARKER_PHASE18D",
  "AiFallbackPolicyResult",
]);

assertIncludes("src/features/platform/reliability/ai-fallback-circuit-breaker.policy.ts", [
  "evaluateAiFallbackPolicy",
  "classifyAiFailureReason",
  "BUDGET_EXCEEDED",
]);

assertIncludes("src/features/platform/reliability/ai-fallback-circuit-breaker.service.ts", [
  "handleAiProviderCallFailure",
  "preAiCallCircuitCheck",
  "AI_FALLBACK_INVOKED",
  "AI_CIRCUIT_BREAKER_OPENED",
]);

assertIncludes("src/features/platform/reliability/ai-circuit-state.store.ts", [
  "recordAiProviderFailure",
  "assertAiCircuitAllowsInvoke",
]);

assertIncludes("docs/operations/AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md", [
  "circuit breaker",
  "classifyAiFailureReason",
  "AI_FALLBACK_INVOKED",
]);

assertIncludes("prisma/schema.prisma", ["AI_CALL"]);

assertIncludes("src/features/ai-core/ai-core-runtime.service.ts", [
  "handleAiProviderCallFailure",
  "preAiCallCircuitCheck",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-reliability-phase18d")) {
  throw new Error("package.json must define verify:aibeopchin-reliability-phase18d");
}

assertIncludes("docs/operations/AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md", ["18-D"]);

execSync(
  "npm run test -- src/features/platform/reliability/ai-fallback-circuit-breaker.policy.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-reliability-phase18d PASS (Phase 18-D AI Fallback & Circuit Breaker)",
);
