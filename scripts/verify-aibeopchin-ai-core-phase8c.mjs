import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 8-C file: ${relativePath}`);
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
      throw new Error(`Forbidden term "${term}" still present in ${relativePath}`);
    }
  }
}

function main() {
  const required = [
    "src/features/ai-core/ai-core-openai.provider.ts",
    "src/features/ai-core/ai-prompt-builders.ts",
    "src/features/ai-core/ai-prompt-registry.test.ts",
    "src/features/ai-core/legal-document-template-map.ts",
  ];
  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("src/features/ai-core/ai-prompt-registry.ts", [
    "AI_PROMPT_REGISTRY_VERSION",
    "AI_TEMPLATE_PROMPT_KEY_BINDINGS",
    "resolvePromptKeyForOperation",
    "resolveTemplateAiPromptBinding",
  ]);

  assertIncludes("src/features/ai-core/ai-audit.ts", [
    "taskType",
    "promptVersion",
    "templateAiPromptKey",
  ]);

  assertIncludes("src/features/ai-core/ai-core-openai.provider.ts", [
    "PHASE8C_AI_CORE_OPENAI_PROVIDER",
    "responses.create",
  ]);

  assertExcludes("src/features/document-drafts/document-paragraph-ai.engine.ts", [
    "responses.create",
    "getOpenAIClient",
  ]);

  assertIncludes("src/lib/document-ai.ts", [
    "POST_OPS_CRITICAL_FIX_REGENERATE_MARKER",
    "mapLegalDocumentTypeToTemplateType",
  ]);
  assertExcludes("src/lib/document-ai.ts", [
    "invokeDocumentParagraphGenerate",
    "invokeDocumentParagraphRegenerate",
    "responses.create",
  ]);

  assertIncludes("src/app/api/cases/[caseId]/documents/generate/route.ts", [
    "templateAiPromptKey",
  ]);

  assertIncludes(
    "src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/regenerate/route.ts",
    ["invokeDocumentParagraphRegenerate", "templateAiPromptKey"],
  );

  assertIncludes("src/features/ai-core/ai-core-runtime.service.ts", [
    "PHASE8C_AI_CORE_LEGACY_CLEANUP",
    "invokeOpenAiDocumentParagraphGenerate",
    "invokeOpenAiDocumentParagraphRewrite",
  ]);

  assertExcludes("src/features/ai-core/ai-core-runtime.service.ts", ["responses.create"]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8C-LEGACY-CLEANUP-PROMPT-BINDING";
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  console.log("verify:aibeopchin-ai-core-phase8c PASS");
}

main();
