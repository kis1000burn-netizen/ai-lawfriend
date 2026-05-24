import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md",
  "src/lib/data-governance/data-retention-policy.schema.ts",
  "src/lib/data-governance/data-retention-policy.registry.ts",
  "src/lib/data-governance/data-retention-policy.validator.ts",
  "src/lib/data-governance/data-retention-policy.registry.test.ts",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19A-DATA-RETENTION-POLICY";

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
    throw new Error(`Missing required Phase 19-A file: ${file}`);
  }
}

assertIncludes("docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md", [
  "19-A",
  "19-F",
  "purge job",
  "Phase 18",
  "Phase 17",
]);

assertIncludes("src/lib/data-governance/data-retention-policy.schema.ts", [
  "DATA_GOVERNANCE_RETENTION_CONSTITUTION_MARKER_PHASE19A",
  "DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A",
  "LEGAL_SENSITIVE",
]);

assertIncludes("src/lib/data-governance/data-retention-policy.registry.ts", [
  "DATA_RETENTION_REQUIRED_PRISMA_MODELS",
  "AuditLog",
  "VoiceTranscript",
  "RetryJob",
]);

assertIncludes("src/lib/data-governance/data-retention-policy.validator.ts", [
  "validateDataRetentionRegistryConstitution",
  "LEGAL_HOLD_PURGE_CONFLICT",
]);

assertIncludes("docs/OPERATIONS_INDEX.md", [
  "AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md",
  "Phase 19-A",
]);

assertIncludes("docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md", [
  "Phase 19",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-data-governance-phase19a")) {
  throw new Error("package.json must define verify:aibeopchin-data-governance-phase19a");
}

execSync(
  "npm run test -- src/lib/data-governance/data-retention-policy.registry.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-data-governance-phase19a PASS (Phase 19-A Data Retention Policy Constitution)",
);
