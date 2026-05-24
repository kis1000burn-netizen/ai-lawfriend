import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/reliability/retry-job.schema.ts",
  "src/features/platform/reliability/retry-job.service.ts",
  "src/features/platform/reliability/retry-job-policy.ts",
  "src/features/platform/reliability/retry-job-policy.test.ts",
  "src/app/api/admin/operations/retry-jobs/route.ts",
  "src/app/api/admin/operations/retry-jobs/[id]/retry/route.ts",
  "src/app/(protected)/admin/operations/retry-jobs/page.tsx",
  "docs/operations/AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md",
  "prisma/migrations/20260524230000_reliability_retry_job_phase18a/migration.sql",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18A-RETRY-JOB-RECOVERY";

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
    throw new Error(`Missing required Phase 18-A file: ${file}`);
  }
}

assertIncludes("src/features/platform/reliability/retry-job.schema.ts", [
  "RELIABILITY_RETRY_JOB_MARKER_PHASE18A",
  "recordFailedRetryJobInputSchema",
]);

assertIncludes("src/features/platform/reliability/retry-job-policy.ts", [
  "OPERATOR_APPROVAL",
  "BLOCKED",
  "evaluateRetryJobPolicy",
]);

assertIncludes("src/features/platform/reliability/retry-job.service.ts", [
  "recordFailedRetryJob",
  "operatorQueueRetryJobService",
  "RETRY_JOB_OPERATOR_QUEUED",
]);

assertIncludes("docs/operations/AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md", [
  "failed job recovery",
  "retryable",
  "OPERATOR_APPROVAL",
]);

const schema = read("prisma/schema.prisma");
if (!schema.includes("model RetryJob")) {
  throw new Error("prisma/schema.prisma must define RetryJob model");
}

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-reliability-phase18a")) {
  throw new Error("package.json must define verify:aibeopchin-reliability-phase18a");
}

execSync("npm run test -- src/features/platform/reliability/retry-job-policy.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-reliability-phase18a PASS (Phase 18-A Retry Queue / Failed Job Recovery)",
);
