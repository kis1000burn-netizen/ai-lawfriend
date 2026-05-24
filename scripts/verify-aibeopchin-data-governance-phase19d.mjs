import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/lib/data-governance/attachment-lifecycle-policy.ts",
  "src/lib/data-governance/attachment-lifecycle-orphan-detection.service.ts",
  "src/lib/data-governance/attachment-lifecycle.validator.ts",
  "src/lib/data-governance/attachment-lifecycle.validator.test.ts",
  "docs/operations/AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19D-ATTACHMENT-LIFECYCLE-EXPIRY";

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
    throw new Error(`Missing required Phase 19-D file: ${file}`);
  }
}

assertIncludes("src/lib/data-governance/attachment-lifecycle-policy.ts", [
  "ATTACHMENT_LIFECYCLE_POLICY_MARKER_PHASE19D",
  "ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D",
  "LitigationUploadedFile",
  "LitigationExtractedText",
  "CaseSharedDocument",
  "CaseDocumentDelivery",
  "CasePackageShare",
  "ExternalMessageLog",
  "guardAttachmentLifecycleLegalHold",
  "evaluateLitigationUploadedFileLifecycleEligibility",
  "evaluateExternalMessageLogSecureLinkEligibility",
]);

assertIncludes("src/lib/data-governance/attachment-lifecycle-orphan-detection.service.ts", [
  "ATTACHMENT_ORPHAN_DETECTION_MARKER_PHASE19D",
  "detectLitigationStorageOrphanCandidates",
  "DISK_WITHOUT_DB",
  "DB_WITHOUT_DISK",
]);

assertIncludes("src/lib/data-governance/attachment-lifecycle.validator.ts", [
  "validateAttachmentLifecyclePolicy",
  "ATTACHMENT_LIFECYCLE_TARGETS",
]);

assertIncludes("docs/operations/AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md", [
  "19-F",
  "legal hold",
  "orphan",
  "RETAIN_CASE_LIFECYCLE",
]);

assertIncludes("src/features/secure-document-delivery/secure-document-delivery.service.ts", [
  "resolveCaseSharedDocumentEffectiveStatus",
]);

assertIncludes("docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md", ["19-D"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-data-governance-phase19d")) {
  throw new Error("package.json must define verify:aibeopchin-data-governance-phase19d");
}

execSync(
  "npm run test -- src/lib/data-governance/attachment-lifecycle.validator.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-data-governance-phase19d PASS (Phase 19-D Attachment Lifecycle / Expiry)",
);
