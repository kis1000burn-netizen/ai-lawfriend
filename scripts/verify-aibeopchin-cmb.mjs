import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

/** @param {string} relativePath */
function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required CMB file: ${relativePath}`);
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

const requiredFiles = [
  "docs/cmb/README.md",
  "docs/cmb/AIBEOPCHIN_CMB_ARCHITECTURE.md",
  "docs/cmb/AIBEOPCHIN_CMB_SCHEMA.md",
  "docs/cmb/AIBEOPCHIN_CMB_ADMIN_POLICY.md",
  "docs/cmb/AIBEOPCHIN_CMB_VERIFY_POLICY.md",
  "src/cmb/core/cmb-schema.ts",
  "src/cmb/core/cmb-registry.ts",
  "src/cmb/core/cmb-validator.ts",
  "src/cmb/core/cmb-runtime.ts",
  "src/cmb/admin/cmb-admin-adapter.ts",
  "src/cmb/case-types/wage-backpay.cmb.ts",
  "src/cmb/case-types/criminal-complaint.cmb.ts",
  "src/cmb/case-types/land-dispute.cmb.ts",
  "src/cmb/case-types/contents-certified-demand.cmb.ts",
  "src/cmb/case-types/fraud.cmb.ts",
  "src/cmb/blocks/interview-blocks.ts",
  "src/cmb/blocks/document-blocks.ts",
  "src/cmb/blocks/voice-blocks.ts",
  "src/cmb/blocks/gongbuho-blocks.ts",
  "src/cmb/blocks/approval-blocks.ts",
  "src/cmb/policies/gate-policy.ts",
  "src/cmb/policies/role-policy.ts",
  "src/cmb/policies/evidence-policy.ts",
  "src/app/(protected)/admin/cmb/page.tsx",
  "src/app/(protected)/admin/cmb/case-types/[caseType]/page.tsx",
  "src/components/admin/cmb/cmb-config-preview-panel.tsx",
  "src/cmb/publish/cmb-publish-lock-gates.ts",
  "src/cmb/publish/cmb-publish-lock.service.ts",
  "src/cmb/publish/cmb-publish-lock-marker.ts",
  "src/cmb/publish/cmb-rc-lock.ts",
  "src/app/api/admin/cmb/sync-baseline/route.ts",
  "src/app/api/admin/cmb/revisions/[revisionId]/transition/route.ts",
  "src/components/admin/cmb/cmb-publish-lock-panel.tsx",
  "docs/cmb/AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md",
  "src/cmb/ops/cmb-operations-studio-policy.ts",
  "src/cmb/ops/cmb-operations-studio.service.ts",
  "src/app/api/admin/cmb/operations-studio/route.ts",
  "src/app/(protected)/admin/cmb/operations-studio/page.tsx",
  "src/components/admin/cmb/cmb-operations-studio-dashboard.tsx",
  "tests/e2e/aibeopchin-cmb-operations-studio-smoke.spec.ts",
];

const gongbuhoSamples = [
  "docs/gongbuho/samples/LAW_FRAUD_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_WAGE_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_LAND_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_CONTENT_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_COMPLAINT_001_GONGBUHO.json",
];

function main() {
  for (const file of requiredFiles) {
    assertFileExists(file);
  }

  for (const file of gongbuhoSamples) {
    assertFileExists(file);
  }

  const tag = "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6-FOUNDATION";
  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  assertIncludes("docs/cmb/AIBEOPCHIN_CMB_ARCHITECTURE.md", [
    "AIBEOPCHIN_CMB_LAYER",
    tag,
    "CORE는 고정",
    "verify:aibeopchin-cmb",
  ]);

  assertIncludes("docs/cmb/AIBEOPCHIN_CMB_SCHEMA.md", [
    "AibeopchinCmbCaseConfig",
    "WAGE_BACKPAY",
    "LAW-WAGE-001",
  ]);

  assertIncludes("docs/cmb/AIBEOPCHIN_CMB_VERIFY_POLICY.md", [
    "verify:aibeopchin-cmb",
    "requireApprovedPacketsOnly",
  ]);

  assertIncludes("src/cmb/core/cmb-schema.ts", [
    "AibeopchinCmbCaseConfig",
    "VERIFY_PASS",
    "REQUIRE_LAWYER_APPROVAL_BEFORE_DELIVERY",
  ]);

  assertIncludes("src/cmb/policies/gate-policy.ts", ["assertCmbGatePolicyImmutable"]);

  assertIncludes("src/cmb/case-types/wage-backpay.cmb.ts", ["WAGE_BACKPAY_CMB", "WAGE_BACKPAY"]);

  assertIncludes("src/app/(protected)/admin/cmb/page.tsx", [
    "requireStaffOrPlatformAdminPage",
    "buildCmbAdminGlobalVerifySummary",
    "CmbConfigList",
  ]);

  assertIncludes("src/app/(protected)/admin/cmb/case-types/[caseType]/page.tsx", [
    "CmbConfigPreviewPanel",
    "buildCmbAdminCasePreview",
  ]);

  assertIncludes("src/components/admin/cmb/cmb-config-preview-panel.tsx", [
    "cmb-role-blocks-preview",
    "cmb-lock-notice",
    "LOCKED",
  ]);

  assertIncludes("src/cmb/publish/cmb-publish-lock-gates.ts", [
    "CMB_PUBLISH_TRANSITIONS",
    "assertNoCmbGateWeakening",
  ]);

  assertIncludes("src/cmb/publish/cmb-publish-lock.service.ts", [
    "transitionCmbRevisionStatus",
    "syncBaselineCmbRevisionsFromRegistry",
    "getPublishedCmbCaseConfig",
  ]);

  assertIncludes("src/app/api/admin/cmb/revisions/[revisionId]/transition/route.ts", [
    "transitionCmbRevisionStatus",
    "cmbRevisionTransitionBodySchema",
  ]);

  assertIncludes("src/components/admin/cmb/cmb-publish-lock-panel.tsx", [
    "cmb-publish-lock-panel",
    "VERIFY_PASS",
    "PUBLISHED",
  ]);

  const tag6f = "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6F-PUBLISH-LOCK";
  if (!impl.includes(tag6f)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag6f}`);
  }

  const migrationSql = path.join(
    root,
    "prisma",
    "migrations",
    "20260524200000_aibeopchin_cmb_publish_lock",
    "migration.sql",
  );
  if (!fs.existsSync(migrationSql)) {
    throw new Error("Missing Phase 6-F migration: 20260524200000_aibeopchin_cmb_publish_lock");
  }

  const tag6e = "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6E-ADMIN-PREVIEW-UI";
  if (!impl.includes(tag6e)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag6e}`);
  }

  const readme = readFile("docs/cmb/README.md");
  if (!readme.includes("**6-H**")) {
    throw new Error("docs/cmb/README.md must reference Phase **6-H**");
  }
  if (!readme.includes("AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md")) {
    throw new Error("docs/cmb/README.md must link AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md");
  }

  const spec6h = readFile("docs/cmb/AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md");
  const spec6hTerms = [
    "Phase 6-H",
    "Operations Studio",
    "configJson",
    "AibeopchinCmbPublishEvent",
    "[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6H-OPERATIONS-STUDIO]",
  ];
  for (const term of spec6hTerms) {
    if (!spec6h.includes(term)) {
      throw new Error(`Missing term "${term}" in AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md`);
    }
  }

  assertIncludes("src/cmb/ops/cmb-operations-studio.service.ts", [
    "CMB_PHASE6H_OPERATIONS_STUDIO_SERVICE_MARKER",
    "getCmbOperationsStudioDashboard",
    "assertCmbOperationsStudioDashboardMetaOnly",
  ]);

  assertIncludes("src/app/api/admin/cmb/operations-studio/route.ts", [
    "getCmbOperationsStudioDashboard",
    "requireStaffOrPlatformAdminApi",
  ]);

  const e2eCmb = readFile("tests/e2e/aibeopchin-cmb-operations-studio-smoke.spec.ts");
  if (!e2eCmb.includes("/api/admin/cmb/operations-studio")) {
    throw new Error("aibeopchin-cmb-operations-studio-smoke.spec.ts must gate operations-studio API");
  }

  const tag6h = "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6H-OPERATIONS-STUDIO";
  if (!impl.includes(tag6h)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag6h}`);
  }

  console.log("verify:aibeopchin-cmb static gates PASS");

  execSync("npx vitest run src/cmb/", { stdio: "inherit", cwd: root });

  console.log(
    "verify:aibeopchin-cmb PASS (Phase 6-A〜H CMB Layer; static + Vitest + Admin + Publish/Lock + Operations Studio)",
  );
}

main();
