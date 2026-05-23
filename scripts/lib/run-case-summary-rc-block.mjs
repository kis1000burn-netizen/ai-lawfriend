import fs from "node:fs";
import path from "node:path";

/**
 * Shared Case Summary RC block (Tier 2).
 * Used by verify:aibeopchin-case-summary-rc AND verify:aibeopchin-ai-core-rc Tier 2.
 * Must NOT exec the standalone npm script (no circular calls).
 */
export function createRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Case Summary RC file: ${relativePath}`);
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

  return { readFile, assertFileExists, assertIncludes };
}

export function assertCaseSummaryAiModeEnvValidForRcFromProcessEnv() {
  const allowed = ["RULE_BASED", "AI_ENRICH", "AI_REGENERATE", "LOCK_AFTER_LAWYER_REVIEW"];
  const raw = process.env.CASE_SUMMARY_AI_MODE?.trim();
  if (!raw) {
    return;
  }
  if (!allowed.includes(raw)) {
    throw new Error(
      `Invalid CASE_SUMMARY_AI_MODE="${raw}" — expected one of: ${allowed.join(", ")}`,
    );
  }
}

export function runCaseSummaryRcBlock(execSync, root, label = "verify:case-summary-rc") {
  const { readFile, assertFileExists, assertIncludes } = createRcFsHelpers(root);

  for (const script of ["verify:aibeopchin-ai-core-phase9a", "verify:aibeopchin-ai-core-phase9b"]) {
    console.log(`[${label}] running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  assertFileExists("docs/ai/AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/ai/AIBEOPCHIN_CASE_SUMMARY_PREDEPLOY_CLOSURE_CHECKLIST.md");
  assertFileExists("src/features/ai-core/case-summary-rc-lock.ts");

  const rcLock = readFile("src/features/ai-core/ai-rc-lock.ts");
  if (rcLock.includes('"verify:aibeopchin-case-summary-rc"')) {
    throw new Error(
      "ai-rc-lock Tier2 script list must not include verify:aibeopchin-case-summary-rc (circular risk)",
    );
  }

  assertIncludes("docs/ai/AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md", [
    "CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD_MAPPING",
    "case_overview",
    "summary.content.caseOverview",
    "persistCaseSummaryAiCoreAudit",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-policy.ts", [
    'mode === "LOCK_AFTER_LAWYER_REVIEW"',
    "assertCaseSummaryAiModeEnvValidForRc",
  ]);

  assertIncludes("src/features/ai-core/case-summary-prompt-registry.ts", [
    'CASE_SUMMARY_PROMPT_REGISTRY_VERSION = "9-B.1"',
  ]);

  assertIncludes("src/app/api/cases/[caseId]/summary/generate/route.ts", [
    "invokeCaseSummaryGenerate",
  ]);

  const documentRegistry = readFile("src/features/ai-core/ai-prompt-registry.ts");
  if (!documentRegistry.includes('AI_PROMPT_REGISTRY_VERSION = "8-C.1"')) {
    throw new Error("document AI_PROMPT_REGISTRY_VERSION must remain 8-C.1");
  }

  const openAiProvider = readFile("src/features/ai-core/ai-core-openai.provider.ts");
  if (openAiProvider.includes("case.summary")) {
    throw new Error("document openai provider must not include case.summary keys");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagClosure = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE";
  if (!impl.includes(tagClosure)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagClosure}`);
  }

  for (const tag of [
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9A-CASE-SUMMARY-INTEGRATION-SPEC",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9B-CASE-SUMMARY-RUNTIME",
  ]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const envExample = readFile(".env.example");
  for (const envKey of ["CASE_SUMMARY_AI_MODE", "OPENAI_CASE_SUMMARY_MODEL"]) {
    if (!envExample.includes(envKey)) {
      throw new Error(`.env.example must document ${envKey}`);
    }
  }

  assertCaseSummaryAiModeEnvValidForRcFromProcessEnv();

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **9-C** |") || !readme.includes("RC LOCKED")) {
    throw new Error("docs/ai/README.md must include Phase **9-C** RC LOCKED row");
  }

  console.log(`[${label}] running Case Summary Vitest bundle …`);
  execSync(
    "npm run test -- src/features/ai-core/case-summary-ai-core-runtime.service.test.ts src/features/ai-core/case-summary-context-builder.test.ts src/features/ai-core/case-summary-prompt-registry.test.ts src/features/ai-core/case-summary-ai-core-policy.test.ts src/app/api/cases/[caseId]/summary/generate/route.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
