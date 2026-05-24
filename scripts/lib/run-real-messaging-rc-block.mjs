import fs from "node:fs";
import path from "node:path";

/**
 * Shared Real Messaging RC block (Product Phase 20-F).
 * Bundles 20-A~E static gates + 15-F/18-B/19-B compatibility cross-link.
 */
export function createRealMessagingRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Real Messaging RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20A-ADAPTER-CONTRACT",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20B-EMAIL-ADAPTER",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20C-KAKAO-ADAPTER",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20D-WEBHOOK-STATUS-SYNC",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20E-SECURE-DELIVERY-INTEGRATION",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-SECURE-DOCUMENT-KAKAO-NOTICE-PHASE15F",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18B-EXTERNAL-MESSAGE-REDELIVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19B-PII-LEGAL-REDACTION",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-real-messaging-phase20a",
  "verify:aibeopchin-real-messaging-phase20b",
  "verify:aibeopchin-real-messaging-phase20c",
  "verify:aibeopchin-real-messaging-phase20d",
  "verify:aibeopchin-real-messaging-phase20e",
];

const ENV_EXAMPLE_KEYS = [
  "EMAIL_PROVIDER",
  "SMTP_HOST",
  "KAKAO_PROVIDER",
  "KAKAO_ALIMTALK_API_URL",
  "EXTERNAL_MESSAGE_EMAIL_WEBHOOK_SECRET",
  "EXTERNAL_MESSAGE_KAKAO_WEBHOOK_SECRET",
  "EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ACTOR_USER_ID",
  "EXTERNAL_MESSAGE_LIVE_SEND_ENABLED",
  "EXTERNAL_MESSAGE_LIVE_SEND_RECIPIENT_ALLOWLIST",
];

export function runRealMessagingRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-real-messaging-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createRealMessagingRcFsHelpers(root);

  assertFileExists("src/features/platform/external-messaging/real-messaging-rc-lock.ts");
  assertFileExists("src/features/platform/external-messaging/real-messaging-rc-lock.test.ts");
  assertFileExists("src/features/platform/external-messaging/real-messaging-live-send.policy.ts");
  assertFileExists("src/features/platform/external-messaging/real-messaging-live-send.policy.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_REAL_MESSAGING_RC_RUNBOOK.md");

  assertIncludes("src/features/platform/external-messaging/real-messaging-rc-lock.ts", [
    "REAL_MESSAGING_RC_LOCK_MARKER_PHASE20F",
    "verify:aibeopchin-real-messaging-rc",
    "REAL_MESSAGING_RC_PHASE18B_CROSS_LINK",
    "REAL_MESSAGING_RC_PHASE19B_CROSS_LINK",
    "REAL_MESSAGING_RC_PHASE15F_CROSS_LINK",
    "EXTERNAL_MESSAGE_LIVE_SEND_ENABLED",
    "DRY_RUN",
  ]);

  assertIncludes("src/features/platform/external-messaging/real-messaging-live-send.policy.ts", [
    "BUNDLED_RC_VERIFY",
    "CONSENT_GATE_ACK",
    "LIMITED_LIVE_SEND_FLAG",
    "RECIPIENT_ALLOWLIST",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md", [
    "20-A",
    "20-E",
    "20-F",
    "verify:aibeopchin-real-messaging-rc",
    "15-F",
    "18-B",
    "19-B",
    "DRY_RUN",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_REAL_MESSAGING_RC_RUNBOOK.md", [
    "verify:aibeopchin-real-messaging-rc",
    "operator checklist",
    "limited live send",
    "consent gate",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md",
    "AIBEOPCHIN_REAL_MESSAGING_RC_RUNBOOK.md",
    "Product 20-F",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md", [
    "18-B",
    "20",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md", [
    "19-B",
    "ExternalMessageLog",
  ]);

  assertIncludes("src/features/secure-document-delivery/secure-document-delivery.service.ts", [
    "dispatchCaseDocumentDeliveryNotification",
  ]);

  assertIncludes("src/features/platform/external-messaging/secure-delivery-message.service.ts", [
    "evaluateSecureDeliveryRedeliveryEligibility",
    "redactExternalMessagePayload",
  ]);

  const envExample = readFile(".env.example");
  for (const key of ENV_EXAMPLE_KEYS) {
    if (!envExample.includes(key)) {
      throw new Error(`.env.example missing Real Messaging RC env key: ${key}`);
    }
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-real-messaging-rc")) {
    throw new Error("package.json must define verify:aibeopchin-real-messaging-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["20-F"]);

  assertIncludes("docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md", [
    "Phase 20",
    "18-B",
  ]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] real-messaging-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/platform/external-messaging/real-messaging-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );

  console.log(`[${label}] real-messaging-live-send.policy Vitest …`);
  execSync(
    "npm run test -- src/features/platform/external-messaging/real-messaging-live-send.policy.test.ts",
    { stdio: "inherit", cwd: root },
  );

  console.log(`[${label}] external-message-redelivery.policy Vitest (18-B compat) …`);
  execSync(
    "npm run test -- src/features/platform/reliability/external-message-redelivery.policy.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
