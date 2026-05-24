import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/external-messaging/secure-delivery-message-policy.ts",
  "src/features/platform/external-messaging/secure-delivery-message-builder.ts",
  "src/features/platform/external-messaging/secure-delivery-message.service.ts",
  "src/features/platform/external-messaging/secure-delivery-message.test.ts",
  "src/features/document-delivery/case-document-delivery-notification.service.ts",
  "src/features/client-portal/client-portal-notification.service.ts",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20E-SECURE-DELIVERY-INTEGRATION";

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
    throw new Error(`Missing required Phase 20-E file: ${file}`);
  }
}

assertIncludes("src/features/platform/external-messaging/secure-delivery-message-policy.ts", [
  "evaluateSecureDeliveryConsentForChannel",
  "assertSecurePortalLinkRequired",
  "SECURE_DELIVERY_FORBIDDEN_MESSAGE_CONTENT",
]);

assertIncludes("src/features/platform/external-messaging/secure-delivery-message-builder.ts", [
  "CLIENT_DOC_SHARE_V1",
  "SUPPLEMENT_REQUEST_V1",
  "COURT_DEADLINE_REMINDER_V1",
  "CLIENT_PORTAL_MESSAGE_V1",
  "buildSecureDeliveryExternalPayload",
  "safeLink",
]);

assertIncludes("src/features/platform/external-messaging/secure-delivery-message.service.ts", [
  "dispatchSecureDeliveryExternalMessage",
  "sendAndRecordExternalMessage",
  "SECURE_DELIVERY_EXTERNAL_MESSAGE_DISPATCH",
  "evaluateSecureDeliveryRedeliveryEligibility",
  "updateDeliveryStatus",
]);

assertIncludes("src/features/document-delivery/case-document-delivery-notification.service.ts", [
  "dispatchCaseDocumentDeliveryNotification",
  "DOCUMENT_DELIVERY",
]);

assertIncludes("src/features/client-portal/client-portal-notification.service.ts", [
  "notifySupplementRequestSent",
  "notifyCourtDeadlineReminder",
  "notifyClientPortalMessage",
]);

assertIncludes("src/features/secure-document-delivery/secure-document-delivery.service.ts", [
  "dispatchCaseDocumentDeliveryNotification",
  "recordExternalDeliveryNotification",
]);

assertIncludes("src/features/supplement-request/supplement-request.service.ts", [
  "notifySupplementRequestSent",
]);

assertIncludes("src/features/litigation-deadline-reminder/litigation-deadline-reminder.service.ts", [
  "notifyCourtDeadlineReminder",
]);

assertIncludes("src/features/client-portal/case-conversation.service.ts", [
  "notifyClientPortalMessage",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md",
  [
    "20-A",
    "15-F",
    "18-B",
    "19-B",
    "consent gate",
    "secure portal link",
    "ExternalMessageLog",
    "webhook",
  ],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["20-E"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-real-messaging-phase20e")) {
  throw new Error("package.json must define verify:aibeopchin-real-messaging-phase20e");
}

execSync(
  "npm run test -- src/features/platform/external-messaging/secure-delivery-message.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-real-messaging-phase20e PASS (Product Phase 20-E Secure Delivery Integration)",
);
