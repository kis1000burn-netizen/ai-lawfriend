import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/reliability/document-pipeline-recovery.schema.ts",
  "src/features/platform/reliability/document-pipeline-recovery.policy.ts",
  "src/features/platform/reliability/document-pipeline-recovery.service.ts",
  "src/features/platform/reliability/document-pipeline-recovery.policy.test.ts",
  "src/app/api/admin/operations/document-pipeline-jobs/[id]/recover/route.ts",
  "docs/operations/AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md",
  "prisma/migrations/20260524240000_reliability_document_pipeline_job_phase18c/migration.sql",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18C-DOCUMENT-PIPELINE-RECOVERY";

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
    throw new Error(`Missing required Phase 18-C file: ${file}`);
  }
}

assertIncludes("src/features/platform/reliability/document-pipeline-recovery.schema.ts", [
  "RELIABILITY_DOCUMENT_PIPELINE_RECOVERY_MARKER_PHASE18C",
  "resumeFromStage",
]);

assertIncludes("src/features/platform/reliability/document-pipeline-recovery.policy.ts", [
  "evaluateDocumentPipelineRecoveryPolicy",
  "buildDuplicateGuardKey",
  "will not re-run",
]);

assertIncludes("src/features/platform/reliability/document-pipeline-recovery.service.ts", [
  "syncFailedDocumentPipelineJobs",
  "operatorRecoverDocumentPipelineJobService",
  "DOCUMENT_PIPELINE_OPERATOR_RECOVERED",
  "noReupload",
]);

assertIncludes("docs/operations/AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md", [
  "stage-preserving",
  "no re-upload",
  "duplicate guard",
]);

assertIncludes("prisma/schema.prisma", [
  "DocumentPipelineJob",
  "DocumentPipelineStage",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-reliability-phase18c")) {
  throw new Error("package.json must define verify:aibeopchin-reliability-phase18c");
}

assertIncludes("docs/operations/AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md", [
  "18-C",
]);

execSync(
  "npm run test -- src/features/platform/reliability/document-pipeline-recovery.policy.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-reliability-phase18c PASS (Phase 18-C Document Pipeline Recovery)",
);
