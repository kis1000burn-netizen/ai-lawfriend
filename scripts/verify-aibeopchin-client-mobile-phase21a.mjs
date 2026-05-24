import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/client-portal/client-portal-mobile.policy.ts",
  "src/features/client-portal/client-portal-mobile.policy.test.ts",
  "src/app/(protected)/client/layout.tsx",
  "src/app/(protected)/client/cases/page.tsx",
  "src/components/client-portal/client-mobile-bottom-nav.tsx",
  "src/components/client-portal/client-portal-cases-list-client.tsx",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21A-PORTAL-BASELINE";

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
    throw new Error(`Missing required Phase 21-A file: ${file}`);
  }
}

assertIncludes("src/features/client-portal/client-portal-mobile.policy.ts", [
  "CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES",
  "resolveClientPortalMobileDeepLink",
  "CLIENT_PORTAL_SURFACE_TO_TAB",
  "supplement",
  "deadlines",
]);

assertIncludes("src/app/(protected)/client/layout.tsx", [
  "viewport",
  "themeColor",
  "safe-area-inset-bottom",
]);

assertIncludes("src/components/client-portal/client-portal-client.tsx", [
  "ClientMobileBottomNav",
  "initialTab",
  "initialShareId",
  "client-portal-deadlines",
  "phase21a-client-portal-mobile-shell",
]);

assertIncludes("src/app/(protected)/client/cases/[caseId]/page.tsx", [
  "resolveClientPortalMobileDeepLink",
  "searchParams",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md",
  ["21-A", "20-E", "deep link", "bottom nav"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["21-A"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-client-mobile-phase21a")) {
  throw new Error("package.json must define verify:aibeopchin-client-mobile-phase21a");
}

execSync(
  "npm run test -- src/features/client-portal/client-portal-mobile.policy.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-client-mobile-phase21a PASS (Product Phase 21-A Mobile Client Portal Baseline)",
);
