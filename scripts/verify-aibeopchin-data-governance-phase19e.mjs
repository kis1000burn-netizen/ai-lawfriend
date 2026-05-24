import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/data-governance/data-governance-rc-lock.ts",
  "src/features/data-governance/data-governance-visibility.schema.ts",
  "src/features/data-governance/data-governance-visibility.service.ts",
  "src/features/data-governance/data-governance-visibility.service.test.ts",
  "src/components/admin/operations/data-governance-console.tsx",
  "src/app/(protected)/admin/operations/data-governance/page.tsx",
  "src/app/api/admin/operations/data-governance-snapshot/route.ts",
  "docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19E-ADMIN-VISIBILITY";

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
    throw new Error(`Missing required Phase 19-E file: ${file}`);
  }
}

assertIncludes("src/features/data-governance/data-governance-rc-lock.ts", [
  "DATA_GOVERNANCE_RC_LOCK_MARKER_PHASE19E",
  "DATA_GOVERNANCE_VISIBILITY_ADMIN_PATH",
  "DATA_GOVERNANCE_PURGE_EXECUTION_UI_LOCKED_PHASE19E",
]);

assertIncludes("src/features/data-governance/data-governance-visibility.service.ts", [
  "DATA_GOVERNANCE_VISIBILITY_SERVICE_MARKER_PHASE19E",
  "getDataGovernanceVisibilitySnapshot",
  "evaluateLitigationUploadedFileLifecycleEligibility",
  "detectLitigationStorageOrphanCandidates",
  "formatBlockedReason",
]);

assertIncludes("src/components/admin/operations/data-governance-console.tsx", [
  "DataGovernanceConsole",
  "disabled",
  "19-F",
  "orphan dry-run",
]);

assertIncludes("src/app/(protected)/admin/operations/data-governance/page.tsx", [
  "requireAdmin",
  "getDataGovernanceVisibilitySnapshot",
]);

assertIncludes("src/app/api/admin/operations/data-governance-snapshot/route.ts", [
  "requireRoleApi",
  "getDataGovernanceVisibilitySnapshot",
]);

assertIncludes("docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md", [
  "data-governance",
  "Purge",
  "19-F",
]);

assertIncludes("src/app/(protected)/layout.tsx", [
  "/admin/operations/data-governance",
]);

assertIncludes("docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md", ["19-E"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-data-governance-phase19e")) {
  throw new Error("package.json must define verify:aibeopchin-data-governance-phase19e");
}

execSync(
  "npm run test -- src/features/data-governance/data-governance-visibility.service.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-data-governance-phase19e PASS (Phase 19-E Admin Data Governance Visibility)",
);
