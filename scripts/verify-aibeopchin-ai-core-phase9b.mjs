import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 9-B file: ${relativePath}`);
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
    "src/features/ai-core/case-summary-context-builder.ts",
    "src/features/ai-core/case-summary-ai-core-runtime.service.ts",
    "src/features/ai-core/case-summary-prompt-registry.ts",
    "src/features/ai-core/case-summary-openai.provider.ts",
    "src/features/ai-core/case-summary-audit.ts",
    "src/features/ai-core/case-summary-output-validator.ts",
    "src/features/ai-core/case-summary-ai-core-runtime.service.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("src/features/ai-core/case-summary-prompt-registry.ts", [
    'CASE_SUMMARY_PROMPT_REGISTRY_VERSION = "9-B.1"',
    "CASE_SUMMARY_REGISTRY_PROMPT_KEYS",
    "CASE_SUMMARY_PROMPT_KEYS.GENERATE",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-runtime.service.ts", [
    "PHASE9B_CASE_SUMMARY_AI_CORE_RUNTIME",
    "invokeCaseSummaryGenerate",
    "buildCaseSummaryGenerationContext",
    "persistCaseSummaryAiCoreAudit",
    "shouldInvokeLlmOnCaseSummaryGenerate",
  ]);

  assertIncludes("src/app/api/cases/[caseId]/summary/generate/route.ts", [
    "invokeCaseSummaryGenerate",
  ]);

  const documentRegistry = readFile("src/features/ai-core/ai-prompt-registry.ts");
  if (!documentRegistry.includes('AI_PROMPT_REGISTRY_VERSION = "8-C.1"')) {
    throw new Error("document AI_PROMPT_REGISTRY_VERSION must remain 8-C.1");
  }

  const openAiProvider = readFile("src/features/ai-core/ai-core-openai.provider.ts");
  if (openAiProvider.includes("case.summary.generate")) {
    throw new Error("document openai provider must not include case summary keys");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag9a = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9A-CASE-SUMMARY-INTEGRATION-SPEC";
  const tag9b = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9B-CASE-SUMMARY-RUNTIME";
  if (!impl.includes(tag9a)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9a}`);
  }
  if (!impl.includes(tag9b)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9b}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **9-B** |")) {
    throw new Error("docs/ai/README.md must include Phase **9-B** row");
  }

  const rcLockTs = readFile("src/features/ai-core/ai-rc-lock.ts");
  if (!rcLockTs.includes("AI_CORE_RC_CASE_SUMMARY_TIER2_VERIFY_SCRIPTS")) {
    throw new Error("ai-rc-lock.ts missing AI_CORE_RC_CASE_SUMMARY_TIER2_VERIFY_SCRIPTS");
  }
  if (rcLockTs.includes('"verify:aibeopchin-case-summary-rc"')) {
    throw new Error(
      "ai-rc-lock Tier2 must not list verify:aibeopchin-case-summary-rc (9-C-FIX circular guard)",
    );
  }

  console.log("verify:aibeopchin-ai-core-phase9b PASS");
}

main();
