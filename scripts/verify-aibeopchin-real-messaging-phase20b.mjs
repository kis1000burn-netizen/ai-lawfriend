import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/external-messaging/external-message-email-config.ts",
  "src/features/platform/external-messaging/external-message-email-template-allowlist.ts",
  "src/features/platform/external-messaging/external-message-email-body-builder.ts",
  "src/features/platform/external-messaging/external-message-provider-response-redaction.ts",
  "src/features/platform/external-messaging/external-message-email-transport.ts",
  "src/features/platform/external-messaging/external-message-smtp-adapter.ts",
  "src/features/platform/external-messaging/external-message-sendgrid-adapter.ts",
  "src/features/platform/external-messaging/external-message-log.service.ts",
  "src/features/platform/external-messaging/external-message-email-adapter.test.ts",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20B-EMAIL-ADAPTER";

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
    throw new Error(`Missing required Phase 20-B file: ${file}`);
  }
}

assertIncludes("src/features/platform/external-messaging/external-message-email-config.ts", [
  "EMAIL_PROVIDER",
  "resolveEmailProvider",
  "SMTP",
  "SENDGRID",
]);

assertIncludes("src/features/platform/external-messaging/external-message-email-template-allowlist.ts", [
  "EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST",
  "EMAIL_TEMPLATE_KEY_NOT_ALLOWED",
]);

assertIncludes("src/features/platform/external-messaging/external-message-email-body-builder.ts", [
  "buildSafeEmailSubject",
  "buildSafeEmailContent",
  "법률 문서 본문은 이메일로 전송되지 않습니다",
]);

assertIncludes("src/features/platform/external-messaging/external-message-smtp-adapter.ts", [
  "ExternalMessageSmtpAdapter",
  "SMTP",
]);

assertIncludes("src/features/platform/external-messaging/external-message-sendgrid-adapter.ts", [
  "ExternalMessageSendGridAdapter",
  "SENDGRID",
]);

assertIncludes("src/features/platform/external-messaging/external-message-provider-response-redaction.ts", [
  "redactProviderRawResponse",
  "FORBIDDEN_RESPONSE_KEYS",
]);

assertIncludes("src/features/platform/external-messaging/external-message-log.service.ts", [
  "recordExternalMessageAdapterResult",
  "mapProviderResultToExternalMessageLogStatus",
  "SENT",
  "FAILED",
]);

assertIncludes("src/features/platform/external-messaging/external-message-adapter.service.ts", [
  "ensureEmailAdaptersRegistered",
  "phase20b-real-messaging-email-adapter-service",
]);

assertIncludes("src/features/platform/external-messaging/external-message-email-adapter.test.ts", [
  "maskExternalMessageRecipient",
  "redactExternalMessagePayload",
  "isRedeliveryEligibleError",
]);

assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md", [
  "20-A",
  "18-B",
  "19-B",
  "EMAIL_PROVIDER",
]);

assertIncludes("docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md", [
  "18-B",
]);

assertIncludes("docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md", [
  "19-B",
]);

assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md", [
  "20-B",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["20-B"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-real-messaging-phase20b")) {
  throw new Error("package.json must define verify:aibeopchin-real-messaging-phase20b");
}

execSync(
  "npm run test -- src/features/platform/external-messaging/external-message-email-adapter.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-real-messaging-phase20b PASS (Product Phase 20-B Email Adapter)",
);
