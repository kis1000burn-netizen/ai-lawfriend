import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 11-B file: ${relativePath}`);
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
    "docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md",
    "src/features/ai-core/client-disclosure-preview.schema.ts",
    "src/features/ai-core/client-disclosure-preview.service.ts",
    "src/features/ai-core/client-disclosure-preview.service.test.ts",
    "src/components/cases/client-disclosure-preview-panel.tsx",
    "src/app/(protected)/cases/[caseId]/client-disclosure-preview/page.tsx",
    "src/app/api/cases/[caseId]/client-disclosure-preview/route.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md", [
    "Phase **11‑B**",
    "CLIENT_VISIBLE",
    "CONFIRMED",
    "EDITED",
    "projectClientSafeStatements",
    "CaseClientDisclosureRelease",
    "verify:aibeopchin-client-disclosure-preview",
    "11-B.1",
  ]);

  assertIncludes("prisma/schema.prisma", ["model CaseClientDisclosureRelease"]);

  assertIncludes("src/features/ai-core/client-disclosure-preview.service.ts", [
    "PHASE11B_CLIENT_DISCLOSURE_PREVIEW_SERVICE_MARKER",
    "getClientDisclosurePreview",
    "recordClientDisclosureRelease",
    "computeClientDisclosurePreviewDiff",
  ]);

  assertIncludes("src/components/cases/client-disclosure-preview-panel.tsx", [
    "ClientDisclosurePreviewPanel",
    "client-disclosure-preview",
    "CLIENT_DISCLOSURE_PREVIEW_PANEL_MARKER_PHASE11B",
  ]);

  assertIncludes("src/components/cases/case-detail-client.tsx", ["client-disclosure-preview"]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11B-CLIENT-DISCLOSURE-PREVIEW";
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **11-B** |")) {
    throw new Error("docs/ai/README.md must include Phase **11-B** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-client-disclosure-preview")) {
    throw new Error("package.json must define verify:aibeopchin-client-disclosure-preview");
  }

  console.log("verify:aibeopchin-client-disclosure-preview PASS");
}

main();
