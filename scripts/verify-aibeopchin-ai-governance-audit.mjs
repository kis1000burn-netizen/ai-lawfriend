import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 10-B file: ${relativePath}`);
  }
}

function assertIncludes(relativePath, terms) {
  const content = readFile(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

function main() {
  const required = [
    "docs/ai/AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md",
    "src/features/ai-core/ai-governance-audit.schema.ts",
    "src/features/ai-core/ai-governance-usage-meter.service.ts",
    "src/features/ai-core/ai-governance-audit.service.ts",
    "src/features/ai-core/ai-governance-audit.schema.test.ts",
    "src/features/ai-core/ai-governance-usage-meter.service.test.ts",
    "src/features/ai-core/ai-governance-audit.service.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md", [
    "Phase **10‑B**",
    "GOVERNANCE_INVOKE_DENIED",
    "LLM_USAGE_RECORDED",
    "TENANT_TOKEN_BUDGET_EXCEEDED",
    "CASE_LLM_LIMIT_EXCEEDED",
    "verify:aibeopchin-ai-governance-audit",
    "10-B.1",
    "recordAiGovernanceInvokeAudit",
  ]);

  assertIncludes("src/features/ai-core/ai-governance-audit.schema.ts", [
    "PHASE10B_AI_GOVERNANCE_AUDIT",
    "AI_GOVERNANCE_AUDIT_VERSION",
    "aiGovernanceUsageMeterSnapshotSchema",
  ]);

  assertIncludes("src/features/ai-core/ai-governance-usage-meter.service.ts", [
    "evaluateAiGovernanceMeterGate",
    "recordAiGovernanceFeatureUsage",
    "PHASE10B_AI_GOVERNANCE_USAGE_METER",
  ]);

  assertIncludes("src/features/ai-core/ai-governance-audit.service.ts", [
    "persistAiGovernanceDenialAudit",
    "recordAiGovernanceInvokeAudit",
    "assertCaseSummaryGovernanceAndMeterAllowsInvoke",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-runtime.service.ts", [
    "assertCaseSummaryGovernanceAndMeterAllowsInvoke",
    "recordAiGovernanceInvokeAudit",
  ]);

  const route = readFile("src/app/api/cases/[caseId]/summary/generate/route.ts");
  if (!route.includes("Phase 10-B")) {
    throw new Error("summary/generate route must document Phase 10-B audit/metering");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag10a = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10A-AI-GOVERNANCE-CONTROL-MATRIX";
  const tag10b = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10B-AI-GOVERNANCE-AUDIT-USAGE-METERING";
  if (!impl.includes(tag10a)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag10a}`);
  }
  if (!impl.includes(tag10b)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag10b}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md")) {
    throw new Error("docs/ai/README.md must link AI Governance Audit spec");
  }
  if (!readme.includes("| **10-B** |")) {
    throw new Error("docs/ai/README.md must include Phase **10-B** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-ai-governance-audit")) {
    throw new Error("package.json must define verify:aibeopchin-ai-governance-audit");
  }

  console.log("verify:aibeopchin-ai-governance-audit PASS");
}

main();
