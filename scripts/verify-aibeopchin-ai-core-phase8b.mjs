import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 8-B file: ${relativePath}`);
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
  assertFileExists("src/features/ai-core/ai-core-runtime.service.ts");
  assertFileExists("src/features/ai-core/ai-core-runtime.service.test.ts");

  assertIncludes("src/features/ai-core/ai-core-runtime.service.ts", [
    "PHASE8B_AI_CORE_ROUTE_MIGRATION",
    "invokeDocumentParagraphGenerate",
    "invokeDocumentParagraphRegenerate",
    "invokeDraftParagraphRegenerateBatch",
    "resolveGenerationModeRuntimeGate",
    "persistAiCoreAudit",
  ]);

  assertIncludes("src/app/api/cases/[caseId]/documents/generate/route.ts", [
    "invokeDocumentParagraphGenerate",
    "aiAuditTrail",
    "persistAiCoreAudit",
  ]);

  assertIncludes(
    "src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/regenerate/route.ts",
    ["parseParagraphGenerationMode", "auditContext", "invokeDocumentParagraphRegenerate"],
  );

  assertIncludes("src/features/document-drafts/document-draft.service.ts", [
    "invokeDraftParagraphRegenerateBatch",
  ]);

  const documentAi = readFile("src/lib/document-ai.ts");
  if (
    !documentAi.includes("invokeDocumentParagraphGenerate") &&
    !documentAi.includes("POST_OPS_CRITICAL_FIX_REGENERATE_MARKER")
  ) {
    throw new Error("document-ai must expose Post-Ops marker or ai-core wrappers");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8B-ROUTE-MIGRATION";
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  console.log("verify:aibeopchin-ai-core-phase8b PASS");
}

main();
