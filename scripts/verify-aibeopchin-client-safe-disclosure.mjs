import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 10-C file: ${relativePath}`);
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
    "docs/ai/AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md",
    "src/features/ai-core/client-safe-disclosure.schema.ts",
    "src/features/ai-core/client-safe-disclosure.service.ts",
    "src/features/ai-core/client-safe-disclosure-validator.ts",
    "src/features/ai-core/client-safe-disclosure.schema.test.ts",
    "src/features/ai-core/client-safe-disclosure.service.test.ts",
    "src/features/ai-core/client-safe-disclosure-validator.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md", [
    "Phase **10‑C**",
    "CLIENT_VISIBLE",
    "PENDING",
    "Radar",
    "clientSafeDisclosure",
    "verify:aibeopchin-client-safe-disclosure",
    "10-C.1",
    "projectClientSafeStatements",
  ]);

  assertIncludes("src/features/ai-core/client-safe-disclosure.schema.ts", [
    "PHASE10C_CLIENT_SAFE_DISCLOSURE",
    "CLIENT_SAFE_DISCLOSURE_VERSION",
    "CLIENT_SAFE_BLOCKED_CATEGORIES",
  ]);

  assertIncludes("src/features/ai-core/client-safe-disclosure.service.ts", [
    "applyClientSafeDisclosureToSummaryResult",
    "projectClientSafeStatements",
    "PHASE10C_CLIENT_SAFE_DISCLOSURE_SERVICE",
  ]);

  assertIncludes("src/features/ai-core/client-safe-disclosure-validator.ts", [
    "validateClientSafeDisclosureLayer",
    "CLIENT_SAFE_DISCLOSURE_VALIDATOR_MARKER",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-runtime.service.ts", [
    "applyClientSafeDisclosureToSummaryResult",
    "clientSafeDisclosure",
  ]);

  const route = readFile("src/app/api/cases/[caseId]/summary/generate/route.ts");
  if (!route.includes("Phase 10-C")) {
    throw new Error("summary/generate route must document Phase 10-C client disclosure");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag10b = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10B-AI-GOVERNANCE-AUDIT-USAGE-METERING";
  const tag10c = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10C-CLIENT-SAFE-DISCLOSURE-LAYER";
  if (!impl.includes(tag10b)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag10b}`);
  }
  if (!impl.includes(tag10c)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag10c}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md")) {
    throw new Error("docs/ai/README.md must link Client-Safe Disclosure spec");
  }
  if (!readme.includes("| **10-C** |")) {
    throw new Error("docs/ai/README.md must include Phase **10-C** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-client-safe-disclosure")) {
    throw new Error("package.json must define verify:aibeopchin-client-safe-disclosure");
  }

  console.log("verify:aibeopchin-client-safe-disclosure PASS");
}

main();
