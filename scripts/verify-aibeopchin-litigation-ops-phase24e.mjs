import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/litigation-ops/client-litigation-progress-sync.schema.ts",
  "src/features/litigation-ops/client-litigation-progress-sync.policy.ts",
  "src/features/litigation-ops/client-litigation-progress-sync.service.ts",
  "src/features/litigation-ops/client-litigation-progress-sync.test.ts",
  "docs/operations/AIBEOPCHIN_CLIENT_LITIGATION_PROGRESS_SYNC_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24E-CLIENT-LITIGATION-PROGRESS-SYNC";

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
    throw new Error(`Missing required Phase 24-E file: ${file}`);
  }
}

assertIncludes("src/features/litigation-ops/client-litigation-progress-sync.service.ts", [
  "syncClientLitigationProgressForCase",
  "listClientVisibleDeadlines",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_CLIENT_LITIGATION_PROGRESS_SYNC_RUNBOOK.md",
  ["24-E", "Client-facing Litigation Progress Sync"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "24-E",
  "Client-facing Litigation Progress Sync",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-litigation-ops-phase24e")) {
  throw new Error("package.json must define verify:aibeopchin-litigation-ops-phase24e");
}

execSync("npm run test -- src/features/litigation-ops/client-litigation-progress-sync.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-litigation-ops-phase24e PASS (Product Phase 24-E Client-facing Litigation Progress Sync)",
);
