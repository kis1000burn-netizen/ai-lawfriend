import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/client-portal/client-portal-mobile-a11y.policy.ts",
  "src/features/client-portal/client-portal-mobile-a11y.policy.test.ts",
  "src/components/client-portal/client-mobile-bottom-nav.test.tsx",
  "src/components/client-portal/client-mobile-upload-panel.test.tsx",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21E-ACCESSIBILITY-SMOKE";

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
    throw new Error(`Missing required Phase 21-E file: ${file}`);
  }
}

assertIncludes("src/features/client-portal/client-portal-mobile-a11y.policy.ts", [
  "CLIENT_PORTAL_MOBILE_MIN_TOUCH_TARGET_PX",
  "CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_MESSAGE",
  "CLIENT_PORTAL_MOBILE_LOW_END_SMOKE_TEST_ID",
  "assertClientPortalSensitiveCacheDenylistRegression",
  "phase21e-client-mobile-a11y-smoke",
]);

assertIncludes("src/app/(protected)/client/layout.tsx", [
  "viewport",
  "viewportFit",
  "themeColor",
  "safe-area-inset-bottom",
  "CLIENT_PORTAL_MOBILE_LOW_END_SMOKE_TEST_ID",
  "phase21e-client-portal-a11y-layout",
]);

assertIncludes("src/components/client-portal/client-mobile-bottom-nav.tsx", [
  "aria-current",
  "aria-label",
  "CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS",
  "motion-reduce:backdrop-blur-none",
]);

assertIncludes("src/components/client-portal/client-mobile-upload-panel.tsx", [
  "aria-live",
  "slow-network-hint",
  "progressbar",
  "motion-reduce:transition-none",
]);

assertIncludes("src/app/(protected)/client/offline/page.tsx", [
  "<main",
  "aria-labelledby",
  "client-portal-offline-title",
]);

assertIncludes("src/components/client-portal/client-portal-push-notification-panel.tsx", [
  "aria-labelledby",
  "client-portal-push-panel-title",
  "CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS",
]);

assertIncludes("public/client/sw.js", [
  "CACHE_DENYLIST",
  "/client/cases/",
  "shared-documents",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md",
  ["21-E", "viewport", "touch", "focus", "slow network", "cache denylist"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["21-E"]);

const policy = read("src/features/client-portal/client-portal-pwa.policy.ts");
const sw = read("public/client/sw.js");
for (const term of [
  "/api/",
  "/client/cases/",
  "shared-documents",
  "messages",
  "attachment",
  "push-subscriptions",
  "notifications",
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
if (!pkg.includes("verify:aibeopchin-client-mobile-phase21e")) {
  throw new Error("package.json must define verify:aibeopchin-client-mobile-phase21e");
}

execSync(
  "npm run test -- src/features/client-portal/client-portal-mobile-a11y.policy.test.ts src/components/client-portal/client-mobile-bottom-nav.test.tsx src/components/client-portal/client-mobile-upload-panel.test.tsx",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-client-mobile-phase21e PASS (Product Phase 21-E Mobile Accessibility / Low-end Device Smoke)",
);
