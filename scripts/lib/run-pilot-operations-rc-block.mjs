import fs from "node:fs";
import path from "node:path";

export function createPilotOperationsRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Pilot Operations RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27A-USAGE-MONITORING",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27B-FEEDBACK-INTAKE",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27C-SATISFACTION-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27D-ISSUE-TRIAGE-HOTFIX-LOOP",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27E-CONVERSION-READINESS-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-pilot-operations-phase27a",
  "verify:aibeopchin-pilot-operations-phase27b",
  "verify:aibeopchin-pilot-operations-phase27c",
  "verify:aibeopchin-pilot-operations-phase27d",
  "verify:aibeopchin-pilot-operations-phase27e",
];

export function runPilotOperationsRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-pilot-operations-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createPilotOperationsRcFsHelpers(root);

  assertFileExists("src/features/pilot-operations/pilot-operations-rc-lock.ts");
  assertFileExists("src/features/pilot-operations/pilot-operations-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PILOT_OPERATIONS_RC_RUNBOOK.md");

  assertIncludes("src/features/pilot-operations/pilot-operations-rc-lock.ts", [
    "PILOT_OPERATIONS_RC_LOCK_MARKER_PHASE27F",
    "verify:aibeopchin-pilot-operations-rc",
    "PILOT_OPERATIONS_RC_PRODUCT_CROSS_LINK",
    "phase27a-pilot-usage-monitoring-gate",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md", [
    "27-A",
    "27-F",
    "verify:aibeopchin-pilot-operations-rc",
    "26-F",
    "25-F",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md",
    "Product 27-F",
  ]);

  assertIncludes("src/features/pilot-operations/pilot-usage-monitoring.service.ts", [
    "buildPilotUsageMonitoringSnapshot",
  ]);
  assertIncludes("src/features/pilot-operations/pilot-feedback-intake.service.ts", [
    "buildPilotFeedbackIntakeSummary",
  ]);
  assertIncludes("src/features/pilot-operations/lawyer-client-satisfaction-review.service.ts", [
    "buildLawyerClientSatisfactionReview",
  ]);
  assertIncludes("src/features/pilot-operations/pilot-issue-triage-hotfix-loop.service.ts", [
    "buildPilotIssueTriageHotfixLoop",
  ]);
  assertIncludes("src/features/pilot-operations/conversion-readiness-review.service.ts", [
    "buildConversionReadinessReview",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md", [
    "Pilot Operations",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-pilot-operations-rc")) {
    throw new Error("package.json must define verify:aibeopchin-pilot-operations-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["27-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] pilot-operations-rc-lock Vitest …`);
  execSync("npm run test -- src/features/pilot-operations/pilot-operations-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
