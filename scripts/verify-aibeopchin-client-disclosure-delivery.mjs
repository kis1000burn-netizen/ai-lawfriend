import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 11-C file: ${relativePath}`);
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
    "docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md",
    "src/features/ai-core/client-disclosure-delivery-lock.ts",
    "src/features/ai-core/client-disclosure-delivery.schema.ts",
    "src/features/ai-core/client-disclosure-delivery.service.ts",
    "src/features/ai-core/client-disclosure-delivery.service.test.ts",
    "src/components/cases/client-disclosure-delivery-panel.tsx",
    "src/app/api/cases/[caseId]/client-disclosure-delivery/route.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md", [
    "Phase **11‑C**",
    "CaseClientDisclosureRelease",
    "intelligenceGraph",
    "client-disclosure-delivery",
    "verify:aibeopchin-client-disclosure-delivery",
    "11-C.1",
  ]);

  assertIncludes("src/features/ai-core/client-disclosure-delivery.service.ts", [
    "PHASE11C_CLIENT_DISCLOSURE_DELIVERY_SERVICE_MARKER",
    "getClientDisclosureDelivery",
    "loadLatestClientDisclosureReleaseRecord",
    "buildClientDisclosureDeliveryPayloadFromRelease",
    "mapClientDisclosureDeliveryToSummaryShape",
  ]);

  assertIncludes("src/app/api/cases/[caseId]/summary/generate/route.ts", [
    "Phase 11-C",
    "getClientDisclosureDelivery",
    "isClientSafeDisclosureAudience",
  ]);

  assertIncludes("src/components/cases/case-detail-client.tsx", [
    "ClientDisclosureDeliveryPanel",
    'currentUser.role === "CLIENT"',
  ]);

  const previewRoute = readFile("src/app/api/cases/[caseId]/client-disclosure-preview/route.ts");
  if (!previewRoute.includes("getClientDisclosurePreview")) {
    throw new Error("client-disclosure-preview route must remain lawyer-facing");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11C-CLIENT-DISCLOSURE-DELIVERY";
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **11-C** |")) {
    throw new Error("docs/ai/README.md must include Phase **11-C** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-client-disclosure-delivery")) {
    throw new Error("package.json must define verify:aibeopchin-client-disclosure-delivery");
  }

  console.log("verify:aibeopchin-client-disclosure-delivery PASS");
}

main();
