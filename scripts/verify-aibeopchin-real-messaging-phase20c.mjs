import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/platform/external-messaging/external-message-kakao-config.ts",
  "src/features/platform/external-messaging/external-message-kakao-template-registry.ts",
  "src/features/platform/external-messaging/external-message-kakao-consent-guard.ts",
  "src/features/platform/external-messaging/external-message-kakao-message-builder.ts",
  "src/features/platform/external-messaging/external-message-kakao-alimtalk-transport.ts",
  "src/features/platform/external-messaging/external-message-kakao-alimtalk-adapter.ts",
  "src/features/platform/external-messaging/external-message-kakao-adapter.test.ts",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20C-KAKAO-ADAPTER";

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
    throw new Error(`Missing required Phase 20-C file: ${file}`);
  }
}

assertIncludes("src/features/platform/external-messaging/external-message-kakao-config.ts", [
  "KAKAO_PROVIDER",
  "resolveKakaoProvider",
  "ALIMTALK",
]);

assertIncludes("src/features/platform/external-messaging/external-message-kakao-template-registry.ts", [
  "KAKAO_ALIMTALK_TEMPLATE_REGISTRY",
  "KAKAO_TEMPLATE_KEY_NOT_REGISTERED",
  "KAKAO_TEMPLATE_VARIABLE_NOT_ALLOWED",
]);

assertIncludes("src/features/platform/external-messaging/external-message-kakao-consent-guard.ts", [
  "validateKakaoAlimtalkConsent",
  "KAKAO_CONSENT_REQUIRED",
]);

assertIncludes("src/features/platform/external-messaging/external-message-kakao-alimtalk-adapter.ts", [
  "ExternalMessageKakaoAlimtalkAdapter",
  "KAKAO_ALIMTALK",
]);

assertIncludes("src/features/platform/external-messaging/external-message-kakao-message-builder.ts", [
  "buildKakaoAlimtalkSafeVariables",
]);

assertIncludes("src/features/platform/external-messaging/external-message-log.service.ts", [
  "mapExternalMessageChannelToDeliveryChannel",
  "KAKAO_ALIMTALK",
  "phase20c-real-messaging-kakao-log-service",
]);

assertIncludes("src/features/platform/external-messaging/external-message-adapter.service.ts", [
  "ensureKakaoAdaptersRegistered",
  "phase20c-real-messaging-kakao-adapter-service",
]);

assertIncludes("src/features/platform/external-messaging/external-message-kakao-adapter.test.ts", [
  "maskExternalMessageRecipient",
  "redactExternalMessagePayload",
  "isRedeliveryEligibleError",
  "KAKAO_ALIMTALK",
]);

assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md", [
  "20-A",
  "20-B",
  "18-B",
  "19-B",
  "KAKAO_PROVIDER",
]);

assertIncludes("docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md", [
  "18-B",
]);

assertIncludes("docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md", [
  "19-B",
]);

assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md", [
  "20-C",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["20-C"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-real-messaging-phase20c")) {
  throw new Error("package.json must define verify:aibeopchin-real-messaging-phase20c");
}

execSync(
  "npm run test -- src/features/platform/external-messaging/external-message-kakao-adapter.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-real-messaging-phase20c PASS (Product Phase 20-C Kakao Adapter)",
);
