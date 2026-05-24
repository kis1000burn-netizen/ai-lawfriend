import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/lib/data-governance/data-redaction-policy.schema.ts",
  "src/lib/data-governance/data-redaction-policy.registry.ts",
  "src/lib/data-governance/data-redaction.service.ts",
  "src/lib/data-governance/data-redaction.validator.ts",
  "src/lib/data-governance/data-redaction.service.test.ts",
  "docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19B-PII-LEGAL-REDACTION";

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
    throw new Error(`Missing required Phase 19-B file: ${file}`);
  }
}

assertIncludes("src/lib/data-governance/data-redaction-policy.schema.ts", [
  "DATA_GOVERNANCE_REDACTION_POLICY_MARKER_PHASE19B",
  "AUDIT_LOG_METADATA",
  "VOICE_TRANSCRIPT_TEXT",
]);

assertIncludes("src/lib/data-governance/data-redaction-policy.registry.ts", [
  "DATA_REDACTION_FORBIDDEN_RAW_KEYS",
  "RETRY_JOB_FAILURE_PAYLOAD",
  "AI_AUDIT_METADATA",
]);

assertIncludes("src/lib/data-governance/data-redaction.service.ts", [
  "redactAuditLogMetadataForExport",
  "redactRetryJobFailurePayload",
  "redactAiAuditMetadata",
]);

assertIncludes("src/lib/data-governance/data-redaction.validator.ts", [
  "validateDataRedactionRegistry",
  "RETENTION_MODEL_MISSING",
]);

assertIncludes("docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md", [
  "registry tier",
  "failurePayload",
  "AUDIT_PERSIST",
]);

assertIncludes("src/lib/audit-log.ts", ["redactAuditLogMetadataForPersist"]);
assertIncludes("src/lib/data-governance/audit-log-export-redaction.service.ts", [
  "redactAuditLogMetadataForExportSurface",
  "redactAuditLogRowForExport",
]);
assertIncludes("src/features/platform/reliability/retry-job.service.ts", [
  "redactRetryJobFailurePayload",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-data-governance-phase19b")) {
  throw new Error("package.json must define verify:aibeopchin-data-governance-phase19b");
}

assertIncludes("docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md", ["19-B"]);

execSync("npm run test -- src/lib/data-governance/data-redaction.service.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-data-governance-phase19b PASS (Phase 19-B PII / Legal Sensitive Redaction)",
);
