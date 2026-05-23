import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required Phase 8-A file: ${relativePath}`);
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
  "docs/ai/README.md",
  "docs/ai/AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md",
  "src/features/ai-core/ai-core-policy.ts",
  "src/features/ai-core/ai-provider-ssot.ts",
  "src/features/ai-core/ai-prompt-registry.ts",
  "src/features/ai-core/ai-context-builder.ts",
  "src/features/ai-core/ai-output-schema-validator.ts",
  "src/features/ai-core/ai-audit.ts",
  "src/features/ai-core/generation-mode-runtime.ts",
  "src/features/ai-core/index.ts",
  "src/features/ai-core/ai-core-policy.test.ts",
];

function main() {
  for (const file of requiredFiles) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md", [
    "Provider SSOT",
    "Prompt Registry",
    "Context Builder",
    "Output Schema Validator",
    "AI Audit",
    "generationMode",
    "verify:aibeopchin-ai-core-phase8a",
    "verify:post-ops-critical-fix",
  ]);

  assertIncludes("src/features/ai-core/ai-core-policy.ts", [
    "PHASE8A_AI_CORE_DOCUMENT_UNIFICATION",
  ]);

  assertIncludes("src/features/ai-core/ai-provider-ssot.ts", [
    "PHASE8A_AI_PROVIDER_SSOT",
    "OPENAI_API_KEY",
    "getOpenAIClient",
  ]);

  assertIncludes("src/features/ai-core/ai-prompt-registry.ts", [
    "PHASE8A_AI_PROMPT_REGISTRY",
    "document.generation.integrated",
    "document.paragraph.rewrite",
  ]);

  assertIncludes("src/features/ai-core/ai-context-builder.ts", [
    "buildIntegratedDocumentContext",
    "PHASE8D_AI_CONTEXT_BUILDER_NATIVE",
  ]);

  assertIncludes("src/features/ai-core/ai-output-schema-validator.ts", [
    "PHASE8A_AI_OUTPUT_SCHEMA_VALIDATOR",
    "checkForbiddenAssertions",
    "DOCUMENT_REGENERATE_GUARDRAIL_VIOLATION",
  ]);

  assertIncludes("src/features/ai-core/ai-audit.ts", [
    "PHASE8A_AI_AUDIT",
    "buildAiAuditRecord",
    "toPublicSafeAiAuditRecord",
  ]);

  const generationMode = readFile("src/features/ai-core/generation-mode-runtime.ts");
  if (!generationMode.includes("PHASE8A_GENERATION_MODE_RUNTIME")) {
    throw new Error("generation-mode-runtime missing marker");
  }
  for (const mode of ["MANUAL_ONLY", "AI_GENERATE", "AI_REGENERATE", "LOCK_AFTER_APPROVAL"]) {
    if (!generationMode.includes(`"${mode}"`)) {
      throw new Error(`generation-mode-runtime missing case ${mode}`);
    }
  }

  const postOps = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (!postOps.includes("EVIDENCE-20260523-AIBEOPCHIN-POST-OPS-CRITICAL-FIX")) {
    throw new Error("Post-Ops Critical Fix evidence must precede Phase 8-A");
  }

  const tag = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8A-DOCUMENT-UNIFICATION-SPEC";
  if (!postOps.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  console.log("verify:aibeopchin-ai-core-phase8a PASS");
}

main();
