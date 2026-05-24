import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/external-messaging/external-message-webhook.schema.ts",
  "src/features/platform/external-messaging/external-message-webhook-signature.ts",
  "src/features/platform/external-messaging/external-message-webhook-status-mapper.ts",
  "src/features/platform/external-messaging/external-message-webhook.service.ts",
  "src/features/platform/external-messaging/external-message-webhook.test.ts",
  "src/app/api/webhooks/external-messages/email/route.ts",
  "src/app/api/webhooks/external-messages/kakao/route.ts",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20D-WEBHOOK-STATUS-SYNC";

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
    throw new Error(`Missing required Phase 20-D file: ${file}`);
  }
}

assertIncludes("src/features/platform/external-messaging/external-message-webhook.schema.ts", [
  "EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES",
  "providerMessageId",
  "providerEventId",
  "DELIVERED",
  "BOUNCED",
  "READ",
]);

assertIncludes("src/features/platform/external-messaging/external-message-webhook-signature.ts", [
  "verifyExternalMessageWebhookSignature",
  "EXTERNAL_MESSAGE_EMAIL_WEBHOOK_SECRET",
  "EXTERNAL_MESSAGE_KAKAO_WEBHOOK_SECRET",
]);

assertIncludes("src/features/platform/external-messaging/external-message-webhook-status-mapper.ts", [
  "mapProviderWebhookStatus",
  "FAILED",
  "REJECTED",
]);

assertIncludes("src/features/platform/external-messaging/external-message-webhook.service.ts", [
  "processExternalMessageWebhookEvent",
  "mergeWebhookSafePayloadSummary",
  "processedWebhookEventIds",
  "reevaluateExternalMessageRedeliveryAfterWebhook",
  "writeAuditLog",
  "EXTERNAL_MESSAGE_WEBHOOK_STATUS_SYNC",
]);

assertIncludes("src/features/platform/external-messaging/external-message-webhook.test.ts", [
  "verifyExternalMessageWebhookSignature",
  "isWebhookEventAlreadyProcessed",
  "redactExternalMessagePayload",
  "reevaluateExternalMessageRedeliveryAfterWebhook",
]);

assertIncludes("src/app/api/webhooks/external-messages/email/route.ts", [
  "verifyExternalMessageWebhookSignature",
  "parseEmailWebhookEvents",
]);

assertIncludes("src/app/api/webhooks/external-messages/kakao/route.ts", [
  "verifyExternalMessageWebhookSignature",
  "parseKakaoWebhookEvents",
]);

assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md", [
  "20-A",
  "18-B",
  "19-B",
  "metadata only",
]);

assertIncludes("docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md", [
  "18-B",
]);

assertIncludes("docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md", [
  "19-B",
]);

assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md", [
  "20-D",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["20-D"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-real-messaging-phase20d")) {
  throw new Error("package.json must define verify:aibeopchin-real-messaging-phase20d");
}

execSync(
  "npm run test -- src/features/platform/external-messaging/external-message-webhook.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-real-messaging-phase20d PASS (Product Phase 20-D Webhook Status Sync)",
);
