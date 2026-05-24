import fs from "node:fs";
import path from "node:path";

export function createPilotLaunchRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Pilot Launch RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26A-STAGING-E2E-COMMERCIAL-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26B-REAL-TENANT-PILOT-SETUP",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26C-LEGAL-TERMS-PRIVACY-FINAL-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26D-SUPPORT-CS-INCIDENT-DESK-SETUP",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26E-PRODUCTION-LAUNCH-DAY-RUNBOOK",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-pilot-launch-phase26a",
  "verify:aibeopchin-pilot-launch-phase26b",
  "verify:aibeopchin-pilot-launch-phase26c",
  "verify:aibeopchin-pilot-launch-phase26d",
  "verify:aibeopchin-pilot-launch-phase26e",
];

export function runPilotLaunchRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-pilot-launch-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createPilotLaunchRcFsHelpers(root);

  assertFileExists("src/features/pilot-launch/pilot-launch-rc-lock.ts");
  assertFileExists("src/features/pilot-launch/pilot-launch-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PILOT_LAUNCH_RC_RUNBOOK.md");

  assertIncludes("src/features/pilot-launch/pilot-launch-rc-lock.ts", [
    "PILOT_LAUNCH_RC_LOCK_MARKER_PHASE26F",
    "verify:aibeopchin-pilot-launch-rc",
    "PILOT_LAUNCH_RC_PRODUCT_CROSS_LINK",
    "phase26a-staging-e2e-commercial-smoke-gate",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md", [
    "26-A",
    "26-F",
    "verify:aibeopchin-pilot-launch-rc",
    "25-F",
    "16-D",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md",
    "Product 26-F",
  ]);

  assertIncludes("src/features/pilot-launch/staging-e2e-commercial-smoke.service.ts", [
    "buildStagingE2eCommercialSmoke",
  ]);
  assertIncludes("src/features/pilot-launch/real-tenant-pilot-setup.service.ts", [
    "buildRealTenantPilotSetupForSlug",
  ]);
  assertIncludes("src/features/pilot-launch/legal-terms-privacy-final-review.service.ts", [
    "buildLegalTermsPrivacyFinalReview",
  ]);
  assertIncludes("src/features/pilot-launch/support-cs-incident-desk-setup.service.ts", [
    "buildSupportCsIncidentDeskSetup",
  ]);
  assertIncludes("src/features/pilot-launch/production-launch-day-runbook.service.ts", [
    "buildProductionLaunchDayRunbook",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md", [
    "Pilot Launch",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-pilot-launch-rc")) {
    throw new Error("package.json must define verify:aibeopchin-pilot-launch-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["26-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] pilot-launch-rc-lock Vitest …`);
  execSync("npm run test -- src/features/pilot-launch/pilot-launch-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
