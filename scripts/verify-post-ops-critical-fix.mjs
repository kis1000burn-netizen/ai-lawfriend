import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
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
  const opsPaths = readFile("src/lib/auth/ops-admin-paths.ts");
  if (!opsPaths.includes('"/admin/voice"')) {
    throw new Error("ops-admin-paths must allow STAFF /admin/voice");
  }
  if (!opsPaths.includes('"/admin/cmb"')) {
    throw new Error("ops-admin-paths must allow STAFF /admin/cmb");
  }

  const documentAi = readFile("src/lib/document-ai.ts");
  const aiCoreRuntime = readFile("src/features/ai-core/ai-core-runtime.service.ts");
  if (!documentAi.includes("POST_OPS_CRITICAL_FIX_REGENERATE_MARKER")) {
    throw new Error("document-ai.ts missing POST_OPS_CRITICAL_FIX_REGENERATE_MARKER");
  }
  if (documentAi.includes("[재작성 지시 반영]")) {
    throw new Error("document-ai regenerate stub must be removed");
  }
  if (
    !documentAi.includes("invokeDocumentParagraphRegenerate") &&
    !aiCoreRuntime.includes("invokeOpenAiDocumentParagraphRewrite")
  ) {
    throw new Error("regenerate must delegate to ai-core OpenAI provider");
  }
  if (
    !documentAi.includes("invokeDocumentParagraphRegenerate") &&
    !aiCoreRuntime.includes("checkForbiddenAssertions")
  ) {
    throw new Error("regenerate must apply checkForbiddenAssertions via ai-core");
  }

  assertIncludes("src/features/ai-core/ai-prompt-builders.ts", [
    "buildDocumentGenerationGuardrail",
  ]);

  const opsTest = readFile("src/lib/auth/__tests__/ops-admin-paths.test.ts");
  if (!opsTest.includes("/admin/voice/transcripts")) {
    throw new Error("ops-admin-paths.test must cover /admin/voice");
  }
  if (!opsTest.includes("/admin/cmb/operations-studio")) {
    throw new Error("ops-admin-paths.test must cover /admin/cmb");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag = "EVIDENCE-20260523-AIBEOPCHIN-POST-OPS-CRITICAL-FIX";
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  console.log("verify:post-ops-critical-fix PASS");
}

main();
