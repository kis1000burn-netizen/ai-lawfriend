import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/lib/data-governance/audit-log-retention-policy.ts",
  "src/lib/data-governance/audit-log-export-policy.ts",
  "src/lib/data-governance/audit-log-export-redaction.service.ts",
  "src/lib/data-governance/audit-log-retention.validator.ts",
  "src/lib/data-governance/audit-log-retention.validator.test.ts",
  "docs/operations/AIBEOPCHIN_AUDIT_LOG_RETENTION_EXPORT_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19C-AUDIT-LOG-RETENTION-EXPORT";

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
    throw new Error(`Missing required Phase 19-C file: ${file}`);
  }
}

assertIncludes("src/lib/data-governance/audit-log-retention-policy.ts", [
  "AUDIT_LOG_RETENTION_POLICY_MARKER_PHASE19C",
  "AUDIT_LOG_DEFAULT_RETENTION_DAYS",
  "AUDIT_LOG_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19C",
  "isAuditLogEligibleForRetentionPurge",
  "getAuditLogRetentionQueryFloorDate",
]);

assertIncludes("src/lib/data-governance/audit-log-export-policy.ts", [
  "AUDIT_LOG_EXPORT_POLICY_MARKER_PHASE19C",
  "AUDIT_LOG_EXPORT_MAX_ROWS",
  "AUDIT_LOG_EXPORT_AUDIT_ACTION",
  "assertAuditLogExportAllowed",
  "normalizeAuditLogExportQuery",
]);

assertIncludes("src/lib/data-governance/audit-log-export-redaction.service.ts", [
  "AUDIT_LOG_EXPORT_REDACTION_SERVICE_MARKER_PHASE19C",
  "redactAuditLogMetadataForExportSurface",
  "redactAuditLogRowForExport",
  "maskEmail",
]);

assertIncludes("src/lib/data-governance/audit-log-retention.validator.ts", [
  "validateAuditLogRetentionExportPolicy",
  "exportRedactionRequired",
]);

assertIncludes("docs/operations/AIBEOPCHIN_AUDIT_LOG_RETENTION_EXPORT_RUNBOOK.md", [
  "AUDIT_LOG_XLSX_EXPORTED",
  "730",
  "다운로드 감사",
]);

assertIncludes("src/features/audit-logs/audit-log.service.ts", [
  "assertAuditLogExportAllowed",
  "normalizeAuditLogExportQuery",
  "redactAuditLogRowForExport",
  "AUDIT_LOG_EXPORT_AUDIT_ACTION",
  "writeAuditLog",
]);

assertIncludes("src/features/audit-logs/audit-log.repository.ts", [
  "AUDIT_LOG_EXPORT_MAX_ROWS",
  "getAuditLogRetentionQueryFloorDate",
  "applyRetentionFloor",
]);

assertIncludes("docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md", ["19-C"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-data-governance-phase19c")) {
  throw new Error("package.json must define verify:aibeopchin-data-governance-phase19c");
}

execSync(
  "npm run test -- src/lib/data-governance/audit-log-retention.validator.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-data-governance-phase19c PASS (Phase 19-C AuditLog Retention & Export)",
);
