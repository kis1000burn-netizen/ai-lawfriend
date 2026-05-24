import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/external-messaging/external-message-adapter.schema.ts",
  "src/features/platform/external-messaging/external-message-adapter.contract.ts",
  "src/features/platform/external-messaging/external-message-adapter-result.ts",
  "src/features/platform/external-messaging/external-message-provider-error.ts",
  "src/features/platform/external-messaging/external-message-channel-policy.ts",
  "src/features/platform/external-messaging/external-message-template-policy.ts",
  "src/features/platform/external-messaging/external-message-dry-run-adapter.ts",
  "src/features/platform/external-messaging/external-message-adapter.service.ts",
  "src/features/platform/external-messaging/external-message-adapter.test.ts",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20A-ADAPTER-CONTRACT";

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
    throw new Error(`Missing required Phase 20-A file: ${file}`);
  }
}

assertIncludes("src/features/platform/external-messaging/external-message-adapter.contract.ts", [
  "ExternalMessageAdapter",
  "validatePayload",
  "mapProviderError",
]);

assertIncludes("src/features/platform/external-messaging/external-message-adapter.schema.ts", [
  "ExternalMessageChannel",
  "ExternalMessageProvider",
  "ExternalMessageSendPayload",
  "templateKey",
  "idempotencyKey",
]);

assertIncludes("src/features/platform/external-messaging/external-message-adapter-result.ts", [
  "ExternalMessageProviderResult",
  "rawProviderResponseRedacted",
  "DRY_RUN",
]);

assertIncludes("src/features/platform/external-messaging/external-message-provider-error.ts", [
  "ExternalMessageProviderErrorCode",
  "redeliveryEligible",
]);

assertIncludes("src/features/platform/external-messaging/external-message-dry-run-adapter.ts", [
  "ExternalMessageDryRunAdapter",
  "DRY_RUN",
]);

assertIncludes("src/features/platform/external-messaging/external-message-channel-policy.ts", [
  "maskExternalMessageRecipient",
  "TEMPLATE_KEY_REQUIRED",
  "IDEMPOTENCY_KEY_REQUIRED",
]);

assertIncludes("src/features/platform/external-messaging/external-message-adapter.service.ts", [
  "sendExternalMessageViaAdapter",
  "buildExternalMessageLogSafeSummary",
  "redactExternalMessagePayload",
]);

assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md", [
  "18-B",
  "19-B",
  "dry-run",
]);

assertIncludes("docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md", [
  "18-B",
]);

assertIncludes("docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md", [
  "19-B",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["20-A"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-real-messaging-phase20a")) {
  throw new Error("package.json must define verify:aibeopchin-real-messaging-phase20a");
}

execSync("npm run test -- src/features/platform/external-messaging/external-message-adapter.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-real-messaging-phase20a PASS (Product Phase 20-A Adapter Contract)",
);
