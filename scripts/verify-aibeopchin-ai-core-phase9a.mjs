import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required Phase 9-A file: ${relativePath}`);
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

const requiredFiles = [
  "docs/ai/AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md",
  "src/features/ai-core/case-summary-ai-core-policy.ts",
  "src/features/ai-core/case-summary-ai-core-policy.test.ts",
  "src/app/api/cases/[caseId]/summary/generate/route.ts",
  "docs/project-governance/CASE_SUMMARY_OUTPUT_SPEC.md",
];

function main() {
  for (const file of requiredFiles) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md", [
    "Phase **9-A**",
    "CASE_SUMMARY_GENERATE",
    "CASE_SUMMARY_REGENERATE",
    "CaseSummaryAiMode",
    "case.summary.generate",
    "case.summary.regenerate",
    "RULE_BASED",
    "AI_ENRICH",
    "AI_REGENERATE",
    "LOCK_AFTER_LAWYER_REVIEW",
    "verify:aibeopchin-ai-core-phase9a",
    "verify:aibeopchin-ai-core-rc",
    "CASE_SUMMARY_OUTPUT_SPEC",
    "8-C.1",
    "9-B",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-policy.ts", [
    "PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION",
    "CASE_SUMMARY_AI_OPERATIONS",
    "CASE_SUMMARY_AI_MODES",
    "case.summary.generate",
    "shouldInvokeLlmOnCaseSummaryGenerate",
    "shouldInvokeLlmOnCaseSummaryRegenerate",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag8e = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tag8e)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag8e} (Phase 9-A requires 8-E RC)`);
  }

  const tag9a = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9A-CASE-SUMMARY-INTEGRATION-SPEC";
  if (!impl.includes(tag9a)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9a}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md")) {
    throw new Error("docs/ai/README.md must link Case Summary integration spec (Phase 9-A)");
  }
  if (!readme.includes("| **9-A** |")) {
    throw new Error("docs/ai/README.md must include Phase **9-A** row");
  }

  const promptRegistry = readFile("src/features/ai-core/ai-prompt-registry.ts");
  if (!promptRegistry.includes('AI_PROMPT_REGISTRY_VERSION = "8-C.1"')) {
    throw new Error("ai-prompt-registry version must remain 8-C.1 (Phase 9-A RC boundary)");
  }
  if (promptRegistry.includes("case.summary.generate")) {
    throw new Error(
      "document ai-prompt-registry must not include case.summary.generate (use case-summary-prompt-registry 9-B.1)",
    );
  }

  const generationMode = readFile("src/features/ai-core/generation-mode-runtime.ts");
  if (!generationMode.includes("PHASE8A_GENERATION_MODE_RUNTIME")) {
    throw new Error("generation-mode-runtime must remain Phase 8-A SSOT (Phase 9-A RC boundary)");
  }

  console.log("verify:aibeopchin-ai-core-phase9a PASS");
}

main();
