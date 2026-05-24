import fs from "node:fs";
import path from "node:path";

/**
 * Shared Reliability RC block (Phase 18-E).
 * Bundles 18-A~D static gates + Phase 17 monitoring cross-link.
 */
export function createReliabilityRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Reliability RC file: ${relativePath}`);
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

  return { readFile, assertFileExists, assertIncludes };
}

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18A-RETRY-JOB-RECOVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18B-EXTERNAL-MESSAGE-REDELIVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18C-DOCUMENT-PIPELINE-RECOVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18D-AI-FALLBACK-CIRCUIT-BREAKER",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC",
];

const PHASE17_PREREQ_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17-PRODUCTION-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17F-LIVE-SMOKE",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-reliability-phase18a",
  "verify:aibeopchin-reliability-phase18b",
  "verify:aibeopchin-reliability-phase18c",
  "verify:aibeopchin-reliability-phase18d",
];

export function runReliabilityRcBlock(execSync, root, label = "verify:aibeopchin-reliability-rc") {
  const { readFile, assertFileExists, assertIncludes } = createReliabilityRcFsHelpers(root);

  assertFileExists("src/features/platform/reliability-rc-lock.ts");
  assertFileExists("src/features/platform/reliability-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md");

  assertFileExists("prisma/migrations/20260524230000_reliability_retry_job_phase18a/migration.sql");
  assertFileExists(
    "prisma/migrations/20260524240000_reliability_document_pipeline_job_phase18c/migration.sql",
  );
  assertFileExists(
    "prisma/migrations/20260524250000_reliability_ai_call_retry_source_phase18d/migration.sql",
  );

  assertIncludes("src/features/platform/reliability-rc-lock.ts", [
    "RELIABILITY_RC_LOCK_MARKER_PHASE18E",
    "verify:aibeopchin-reliability-rc",
    "RELIABILITY_RC_PHASE17_CROSS_LINK",
    "cron",
    "document pipeline",
    "AI call",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md", [
    "18-A",
    "18-B",
    "18-C",
    "18-D",
    "18-E",
    "Phase 17",
    "verify:aibeopchin-reliability-rc",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md", [
    "verify:aibeopchin-reliability-rc",
    "18-A",
    "18-D",
    "Phase 17",
    "복구·차단·재시도·수동검토",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md",
    "AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md",
    "Phase 18-E",
  ]);

  assertIncludes("prisma/schema.prisma", [
    "model RetryJob",
    "model DocumentPipelineJob",
    "AI_CALL",
  ]);

  assertIncludes("src/app/(protected)/admin/operations/retry-jobs/page.tsx", [
    "/admin/operations/monitoring",
    "syncFailedCronLogsToRetryJobs",
    "syncFailedExternalMessagesToRetryJobs",
    "syncFailedDocumentPipelineJobs",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PHASE17_PREREQ_TAGS]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-reliability-rc")) {
    throw new Error("package.json must define verify:aibeopchin-reliability-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md", [
    "Phase 18",
    "Reliability",
    "retry-jobs",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md", [
    "/admin/operations/monitoring",
  ]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] reliability-rc-lock Vitest …`);
  execSync("npm run test -- src/features/platform/reliability-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
