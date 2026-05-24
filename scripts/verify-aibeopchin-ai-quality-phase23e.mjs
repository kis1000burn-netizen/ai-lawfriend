import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/ai-quality/client-safe-case-progress-pack.schema.ts",
  "src/features/ai-quality/client-safe-case-progress-pack.policy.ts",
  "src/features/ai-quality/client-safe-case-progress-pack.service.ts",
  "src/features/ai-quality/client-safe-case-progress-pack.test.ts",
  "docs/operations/AIBEOPCHIN_CLIENT_SAFE_CASE_PROGRESS_PACK_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23E-CLIENT-SAFE-CASE-PROGRESS-PACK";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required Phase 23-E file: ${file}`);
  }
}

assertIncludes("src/features/ai-quality/client-safe-case-progress-pack.policy.ts", [
  "CLIENT_SAFE_BLOCKED_CATEGORIES",
  "assembleClientSafeCaseProgressPack",
  "releaseGatePassed",
]);

assertIncludes("src/features/ai-quality/client-safe-case-progress-pack.service.ts", [
  "buildClientSafeCaseProgressPackForCase",
  "caseClientDisclosureRelease",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_CLIENT_SAFE_CASE_PROGRESS_PACK_RUNBOOK.md",
  ["23-E", "Client-safe Case Progress Pack"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "23-E",
  "Client-safe Case Progress Pack",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-ai-quality-phase23e")) {
  throw new Error("package.json must define verify:aibeopchin-ai-quality-phase23e");
}

execSync("npm run test -- src/features/ai-quality/client-safe-case-progress-pack.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-ai-quality-phase23e PASS (Product Phase 23-E Client-safe Case Progress Pack)",
);
