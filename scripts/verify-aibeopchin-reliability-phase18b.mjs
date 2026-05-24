import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/reliability/external-message-redelivery.schema.ts",
  "src/features/platform/reliability/external-message-redelivery.policy.ts",
  "src/features/platform/reliability/external-message-redelivery.service.ts",
  "src/features/platform/reliability/external-message-redelivery.policy.test.ts",
  "src/app/api/admin/operations/external-messages/[id]/redeliver/route.ts",
  "docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18B-EXTERNAL-MESSAGE-REDELIVERY";

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
    throw new Error(`Missing required Phase 18-B file: ${file}`);
  }
}

assertIncludes("src/features/platform/reliability/external-message-redelivery.schema.ts", [
  "RELIABILITY_EXTERNAL_MESSAGE_REDELIVERY_MARKER_PHASE18B",
  "metadataOnly",
]);

assertIncludes("src/features/platform/reliability/external-message-redelivery.policy.ts", [
  "Duplicate guard",
  "evaluateExternalMessageRedeliveryPolicy",
  "extractSafeRedeliveryMeta",
]);

assertIncludes("src/features/platform/reliability/external-message-redelivery.service.ts", [
  "syncFailedExternalMessagesToRetryJobs",
  "operatorRedeliverExternalMessageService",
  "EXTERNAL_MESSAGE_OPERATOR_REDELIVERED",
  "duplicateGuardContext",
]);

assertIncludes("docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md", [
  "duplicate guard",
  "metadata only",
  "safe re-delivery",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-reliability-phase18b")) {
  throw new Error("package.json must define verify:aibeopchin-reliability-phase18b");
}

assertIncludes("docs/operations/AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md", [
  "18-B",
]);

execSync(
  "npm run test -- src/features/platform/reliability/external-message-redelivery.policy.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-reliability-phase18b PASS (Phase 18-B External Message Safe Re-delivery)",
);
