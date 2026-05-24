import fs from "node:fs";
import path from "node:path";

export function createProductionLaunchRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Production Launch RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25A-LAUNCH-CHECKLIST",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25B-TENANT-ONBOARDING-RUNBOOK",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25C-OPERATOR-TRAINING-ADMIN-PLAYBOOK",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25D-LIVE-PROVIDER-SMOKE-PLAN",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25E-COMMERCIAL-OPS-READINESS-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-production-launch-phase25a",
  "verify:aibeopchin-production-launch-phase25b",
  "verify:aibeopchin-production-launch-phase25c",
  "verify:aibeopchin-production-launch-phase25d",
  "verify:aibeopchin-production-launch-phase25e",
];

export function runProductionLaunchRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-production-launch-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createProductionLaunchRcFsHelpers(root);

  assertFileExists("src/features/production-launch/production-launch-rc-lock.ts");
  assertFileExists("src/features/production-launch/production-launch-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_RUNBOOK.md");

  assertIncludes("src/features/production-launch/production-launch-rc-lock.ts", [
    "PRODUCTION_LAUNCH_RC_LOCK_MARKER_PHASE25F",
    "verify:aibeopchin-production-launch-rc",
    "PRODUCTION_LAUNCH_RC_PRODUCT_CROSS_LINK",
    "phase25a-go-no-go-gate",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md", [
    "25-A",
    "25-F",
    "verify:aibeopchin-production-launch-rc",
    "24-F",
    "16-D",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md",
    "Product 25-F",
  ]);

  assertIncludes("src/features/production-launch/production-launch-checklist.service.ts", [
    "buildProductionLaunchChecklist",
  ]);
  assertIncludes("src/features/production-launch/tenant-onboarding-runbook.service.ts", [
    "buildTenantOnboardingRunbookForSlug",
  ]);
  assertIncludes("src/features/production-launch/operator-training-admin-playbook.service.ts", [
    "buildOperatorTrainingAdminPlaybook",
  ]);
  assertIncludes("src/features/production-launch/live-provider-smoke-plan.service.ts", [
    "buildLiveProviderSmokePlan",
  ]);
  assertIncludes("src/features/production-launch/commercial-ops-readiness-review.service.ts", [
    "buildCommercialOpsReadinessReview",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md", [
    "Production Launch",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-production-launch-rc")) {
    throw new Error("package.json must define verify:aibeopchin-production-launch-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["25-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] production-launch-rc-lock Vitest …`);
  execSync("npm run test -- src/features/production-launch/production-launch-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
