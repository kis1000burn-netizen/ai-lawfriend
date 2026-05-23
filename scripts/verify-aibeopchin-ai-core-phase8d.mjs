import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 8-D file: ${relativePath}`);
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

function assertExcludes(relativePath, terms) {
  const content = readFile(relativePath);
  for (const term of terms) {
    if (content.includes(term)) {
      throw new Error(`Forbidden term "${term}" in ${relativePath}`);
    }
  }
}

function main() {
  const required = [
    "src/features/ai-core/ai-integrated-context-builder.ts",
    "src/features/ai-core/ai-core-audit-policy.ts",
    "src/features/ai-core/ai-integrated-context-builder.test.ts",
    "src/features/ai-core/ai-core-audit-closure.test.ts",
    "src/app/api/admin/ai-core/audit-policy/route.ts",
    "tests/e2e/aibeopchin-ai-core-audit-smoke.spec.ts",
  ];
  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("src/features/ai-core/ai-integrated-context-builder.ts", [
    "PHASE8D_AI_INTEGRATED_CONTEXT_BUILDER",
    "buildIntegratedDocumentContext",
  ]);

  assertIncludes("src/features/ai-core/ai-context-builder.ts", [
    "PHASE8D_AI_CONTEXT_BUILDER_NATIVE",
  ]);

  assertExcludes("src/features/document-generation/build-document-generation-prompt.ts", [
    "stringifySafeJson",
    "buildDocumentGenerationGuardrail",
  ]);

  assertIncludes("src/app/api/cases/[caseId]/documents/generate/route.ts", [
    "buildIntegratedDocumentContext",
  ]);

  for (const shim of [
    "src/features/document-drafts/document-paragraph-ai.engine.ts",
    "src/features/document-drafts/document-paragraph-ai.prompts.ts",
    "src/features/document-drafts/document-paragraph-ai.utils.ts",
  ]) {
    assertIncludes(shim, ["PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM"]);
    assertExcludes(shim, ["responses.create", "getOpenAIClient"]);
  }

  assertIncludes("src/features/ai-core/ai-core-audit-policy.ts", [
    "assertPublicSafeAiAuditMetadata",
    "getAiCoreAuditPolicySnapshot",
    "templateAiPromptKey",
    "generationMode",
  ]);

  assertIncludes("tests/e2e/aibeopchin-ai-core-audit-smoke.spec.ts", [
    "/api/admin/ai-core/audit-policy",
    "promptRegistryVersion",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8D-NATIVE-CONTEXT-AUDIT-CLOSURE";
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  console.log("verify:aibeopchin-ai-core-phase8d PASS");
}

main();
