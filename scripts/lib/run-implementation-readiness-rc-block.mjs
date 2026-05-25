import fs from "node:fs";
import path from "node:path";

export function createImplementationReadinessRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Implementation Readiness RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36A-IMPLEMENTATION-PROJECT-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36B-TENANT-PROVISIONING-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36C-ADMIN-LAWYER-TRAINING",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36D-GO-LIVE-SUCCESS-CRITERIA",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36E-POST-CONTRACT-RISK-CHANGE",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-implementation-readiness-phase36a",
  "verify:aibeopchin-implementation-readiness-phase36b",
  "verify:aibeopchin-implementation-readiness-phase36c",
  "verify:aibeopchin-implementation-readiness-phase36d",
  "verify:aibeopchin-implementation-readiness-phase36e",
];

export function runImplementationReadinessRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-implementation-readiness-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createImplementationReadinessRcFsHelpers(root);

  assertFileExists("src/features/implementation-readiness/implementation-readiness-rc-lock.ts");
  assertFileExists("src/features/implementation-readiness/implementation-readiness-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_RUNBOOK.md");

  assertIncludes("src/features/implementation-readiness/implementation-readiness-rc-lock.ts", [
    "IMPLEMENTATION_READINESS_RC_LOCK_MARKER_PHASE36F",
    "verify:aibeopchin-implementation-readiness-rc",
    "IMPLEMENTATION_READINESS_RC_PRODUCT_CROSS_LINK",
    "phase36a-implementation-project-plan-gate",
    "phase36-implementation-readiness-policy-only-boundary",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md", [
    "36-A",
    "36-F",
    "verify:aibeopchin-implementation-readiness-rc",
    "35-F",
    "no automatic go-live",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md",
    "Product 36-F",
  ]);

  assertIncludes(
    "src/features/implementation-readiness/project-plan/implementation-project-plan.service.ts",
    ["buildImplementationProjectPlan"],
  );
  assertIncludes(
    "src/features/implementation-readiness/tenant-provisioning/tenant-provisioning-plan.service.ts",
    ["buildCustomerDataTenantProvisioningPlan"],
  );
  assertIncludes(
    "src/features/implementation-readiness/training-schedule/admin-lawyer-training-schedule.service.ts",
    ["buildAdminLawyerTrainingSchedule"],
  );
  assertIncludes(
    "src/features/implementation-readiness/go-live/go-live-success-criteria.service.ts",
    ["buildGoLiveSuccessCriteria"],
  );
  assertIncludes(
    "src/features/implementation-readiness/risk-change/post-contract-risk-change-control.service.ts",
    ["buildPostContractRiskChangeControl"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md", [
    "Implementation Readiness",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-implementation-readiness-rc")) {
    throw new Error("package.json must define verify:aibeopchin-implementation-readiness-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["36-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] implementation-readiness-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/implementation-readiness/implementation-readiness-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
