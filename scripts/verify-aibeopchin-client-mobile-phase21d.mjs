import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/client-portal/client-portal-push-notification.policy.ts",
  "src/features/client-portal/client-portal-push-notification.policy.test.ts",
  "src/features/client-portal/client-portal-push-notification.repository.ts",
  "src/features/client-portal/client-portal-push-notification.service.ts",
  "src/app/api/client/push-subscriptions/route.ts",
  "src/app/api/client/push-subscriptions/vapid-public-key/route.ts",
  "src/app/api/client/notification-preferences/route.ts",
  "src/app/api/client/notifications/route.ts",
  "src/components/client-portal/client-portal-push-notification-panel.tsx",
  "src/components/client-portal/client-portal-notification-center.tsx",
  "prisma/migrations/20260525180000_client_portal_push_notification_phase21d/migration.sql",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21D-PUSH-NOTIFICATION-SURFACE";

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
    throw new Error(`Missing required Phase 21-D file: ${file}`);
  }
}

assertIncludes("src/features/client-portal/client-portal-push-notification.policy.ts", [
  "CLIENT_PORTAL_PUSH_FORBIDDEN_PAYLOAD_KEYS",
  "isClientPortalWebPushLiveSendEnabled",
  "buildClientPortalPushPayload",
  "phase21d-client-portal-push-notification-surface",
]);

assertIncludes("public/client/sw.js", [
  'addEventListener("push"',
  'addEventListener("notificationclick"',
  "metadata-only fallback",
]);

assertIncludes("src/features/client-portal/client-portal-notification.service.ts", [
  "recordClientPortalNotificationCenterInAppEntry",
  "prepareClientPortalWebPushDispatch",
  "phase21d-client-portal-notification-push-surface",
]);

assertIncludes("src/app/(protected)/client/layout.tsx", [
  "ClientPortalPushNotificationPanel",
  "phase21d-client-portal-push-layout",
]);

assertIncludes("src/components/client-portal/client-portal-push-notification-panel.tsx", [
  "client-portal-push-permission",
  "client-portal-push-subscribe",
  "기본 OFF",
]);

assertIncludes("src/components/client-portal/client-portal-notification-center.tsx", [
  "client-portal-notification-center",
  "Phase 20",
]);

assertIncludes("prisma/schema.prisma", [
  "webPushOptIn",
  "ClientPushSubscription",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md",
  ["21-D", "live send", "cache denylist", "ExternalMessageLog", "consent"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["21-D"]);

const migration = read(
  "prisma/migrations/20260525180000_client_portal_push_notification_phase21d/migration.sql",
);
if (!migration.includes("webPushOptIn") || !migration.includes("ClientPushSubscription")) {
  throw new Error("Phase 21-D migration missing push schema changes");
}

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-client-mobile-phase21d")) {
  throw new Error("package.json must define verify:aibeopchin-client-mobile-phase21d");
}

execSync(
  "npm run test -- src/features/client-portal/client-portal-push-notification.policy.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-client-mobile-phase21d PASS (Product Phase 21-D Push-ready Notification Surface)",
);
