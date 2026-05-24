import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/client-portal/client-portal-pwa.policy.ts",
  "src/features/client-portal/client-portal-pwa.policy.test.ts",
  "public/manifest.webmanifest",
  "public/client/sw.js",
  "public/pwa/client-portal-icon.svg",
  "src/components/client-portal/client-portal-pwa-shell.tsx",
  "src/components/client-portal/client-portal-pwa-restore-redirect.tsx",
  "src/components/client-portal/client-portal-offline-retry-button.tsx",
  "src/app/(protected)/client/offline/page.tsx",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21C-PWA-INSTALL";

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
    throw new Error(`Missing required Phase 21-C file: ${file}`);
  }
}

assertIncludes("src/features/client-portal/client-portal-pwa.policy.ts", [
  "CLIENT_PORTAL_PWA_CACHE_DENYLIST",
  "CLIENT_PORTAL_PWA_START_URL",
  "saveClientPortalLastVisit",
  "buildClientPortalRestorePath",
  "phase21c-client-portal-pwa-install",
]);

assertIncludes("public/manifest.webmanifest", [
  "AI법친 의뢰인 포털",
  "/client/cases?source=pwa",
  "/client/",
  "/pwa/client-portal-icon.svg",
  "#312e81",
]);

assertIncludes("public/client/sw.js", [
  "CACHE_DENYLIST",
  "/api/",
  "/client/cases/",
  "shared-documents",
  "attachment",
  "/client/offline",
]);

assertIncludes("src/app/(protected)/client/layout.tsx", [
  "ClientPortalPwaInstallBanner",
  "ClientPortalPwaServiceWorkerRegister",
  "manifest",
  "appleWebApp",
  "phase21c-client-portal-pwa-layout",
]);

assertIncludes("src/components/client-portal/client-portal-pwa-shell.tsx", [
  "beforeinstallprompt",
  "client-portal-pwa-install-banner",
  "serviceWorker.register",
  "CLIENT_PORTAL_PWA_SERVICE_WORKER_PATH",
]);

assertIncludes("src/components/client-portal/client-portal-client.tsx", [
  "saveClientPortalLastVisit",
  "phase21c-client-portal-pwa-restore-shell",
]);

assertIncludes("src/app/(protected)/client/cases/page.tsx", [
  "ClientPortalPwaRestoreRedirect",
]);

assertIncludes("src/app/(protected)/client/offline/page.tsx", [
  "client-portal-offline-page",
  "ClientPortalOfflineRetryButton",
  "사건 본문·첨부",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md",
  ["21-C", "manifest", "service worker", "cache denylist", "last visit"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["21-C"]);

const policy = read("src/features/client-portal/client-portal-pwa.policy.ts");
const sw = read("public/client/sw.js");
for (const term of [
  "/api/",
  "/login",
  "/client/cases/",
  "files/upload",
  "shared-documents",
  "supplement-requests",
  "submissions",
  "messages",
  "deadlines",
  "document",
  "attachment",
]) {
  if (!policy.includes(`"${term}"`)) {
    throw new Error(`Policy denylist missing term: ${term}`);
  }
  if (!sw.includes(`"${term}"`)) {
    throw new Error(`Service worker denylist missing term: ${term}`);
  }
}

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-client-mobile-phase21c")) {
  throw new Error("package.json must define verify:aibeopchin-client-mobile-phase21c");
}

execSync(
  "npm run test -- src/features/client-portal/client-portal-pwa.policy.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-client-mobile-phase21c PASS (Product Phase 21-C PWA Install / Home Screen)",
);
