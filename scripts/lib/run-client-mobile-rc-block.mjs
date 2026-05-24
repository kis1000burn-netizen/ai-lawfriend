import fs from "node:fs";
import path from "node:path";

/**
 * Shared Client Mobile / PWA RC block (Product Phase 21-F).
 * Bundles 21-A~E static gates + Phase 20-F deep-link cross-link.
 */
export function createClientMobileRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Client Mobile RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21A-PORTAL-BASELINE",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21B-UPLOAD-UX",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21C-PWA-INSTALL",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21D-PUSH-NOTIFICATION-SURFACE",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21E-ACCESSIBILITY-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-client-mobile-phase21a",
  "verify:aibeopchin-client-mobile-phase21b",
  "verify:aibeopchin-client-mobile-phase21c",
  "verify:aibeopchin-client-mobile-phase21d",
  "verify:aibeopchin-client-mobile-phase21e",
];

const ENV_EXAMPLE_KEYS = [
  "CLIENT_PORTAL_VAPID_PUBLIC_KEY",
  "CLIENT_PORTAL_WEB_PUSH_LIVE_SEND",
  "NEXT_PUBLIC_FF_CLIENT_PORTAL_PUSH_SURFACE",
];

const CACHE_DENY_TERMS = [
  "/api/",
  "/client/cases/",
  "shared-documents",
  "messages",
  "attachment",
  "push-subscriptions",
  "notifications",
];

export function runClientMobileRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-client-mobile-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createClientMobileRcFsHelpers(root);

  assertFileExists("src/features/client-portal/client-mobile-pwa-rc-lock.ts");
  assertFileExists("src/features/client-portal/client-mobile-pwa-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_RUNBOOK.md");

  assertFileExists(
    "prisma/migrations/20260525180000_client_portal_push_notification_phase21d/migration.sql",
  );

  assertIncludes("src/features/client-portal/client-mobile-pwa-rc-lock.ts", [
    "CLIENT_MOBILE_PWA_RC_LOCK_MARKER_PHASE21F",
    "verify:aibeopchin-client-mobile-rc",
    "CLIENT_MOBILE_PWA_RC_PHASE20F_CROSS_LINK",
    "CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_DEFAULT_MODE",
    "CLIENT_MOBILE_PWA_RC_SENSITIVE_CACHE_DENY_TERMS",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md", [
    "21-A",
    "21-E",
    "21-F",
    "verify:aibeopchin-client-mobile-rc",
    "20-F",
    "push live send",
    "cache denylist",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_RUNBOOK.md", [
    "verify:aibeopchin-client-mobile-rc",
    "Operator checklist",
    "21-A",
    "21-E",
    "push live send OFF",
    "deep link",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md",
    "AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_RUNBOOK.md",
    "Product 21-F",
  ]);

  assertIncludes("src/features/client-portal/client-portal-mobile.policy.ts", [
    "CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES",
    "resolveClientPortalMobileDeepLink",
    "supplement",
    "deadlines",
  ]);

  assertIncludes(
    "src/features/platform/external-messaging/secure-delivery-message-builder.ts",
    ["buildSecureDeliveryPortalPath", "?tab=supplement", "?tab=deadlines"],
  );

  assertIncludes("src/features/client-portal/client-portal-push-notification.policy.ts", [
    "isClientPortalWebPushLiveSendEnabled",
    "CLIENT_PORTAL_WEB_PUSH_LIVE_SEND_ENV",
  ]);

  const policy = readFile("src/features/client-portal/client-portal-pwa.policy.ts");
  const sw = readFile("public/client/sw.js");
  for (const term of CACHE_DENY_TERMS) {
    if (!policy.includes(`"${term}"`)) {
      throw new Error(`PWA policy denylist missing term: ${term}`);
    }
    if (!sw.includes(`"${term}"`)) {
      throw new Error(`Service worker denylist missing term: ${term}`);
    }
  }

  const envExample = readFile(".env.example");
  for (const key of ENV_EXAMPLE_KEYS) {
    if (!envExample.includes(key)) {
      throw new Error(`.env.example missing Client Mobile RC env key: ${key}`);
    }
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-client-mobile-rc")) {
    throw new Error("package.json must define verify:aibeopchin-client-mobile-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["21-F"]);

  assertIncludes("docs/platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md", [
    "Phase 21",
    "21-F",
  ]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] client-mobile-pwa-rc-lock Vitest …`);
  execSync("npm run test -- src/features/client-portal/client-mobile-pwa-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] push live send OFF policy Vitest …`);
  execSync(
    "npm run test -- src/features/client-portal/client-portal-push-notification.policy.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
