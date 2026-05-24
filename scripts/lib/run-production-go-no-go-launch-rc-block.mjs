import fs from "node:fs";
import path from "node:path";

/**
 * Shared Production Go/No-Go Launch RC block (Phase 16-D).
 * Static governance gates only — no live deploy; fill launch record at cutover time.
 */
export function createProductionGoNoGoLaunchRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Production Go/No-Go Launch RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER",
  "EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC",
];

export function runProductionGoNoGoLaunchRcBlock(
  execSync,
  root,
  label = "verify:production-go-no-go-launch-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createProductionGoNoGoLaunchRcFsHelpers(root);

  assertFileExists("docs/platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_DECISION_CHECKLIST.md");
  assertFileExists("docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PRODUCTION_GO_NO_GO_RUNBOOK.md");
  assertFileExists("src/features/platform/production-go-no-go-launch-rc-lock.ts");
  assertFileExists("src/features/platform/production-go-no-go-launch-rc-lock.test.ts");

  assertIncludes("src/features/platform/production-go-no-go-launch-rc-lock.ts", [
    "PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_MARKER_PHASE16D",
    "verify:aibeopchin-production-go-no-go-launch-rc",
    "goNoGoDecision",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_DECISION_CHECKLIST.md", [
    "16-A",
    "16-B",
    "16-C",
    "deployApprover",
    "deployTargetCommit",
    "rollbackTargetCommit",
    "live mode",
    "known limitation",
    "launch note",
    "go / no-go",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md", [
    "deployApprover",
    "deployApprovedAt",
    "deployTargetCommit",
    "rollbackTargetCommit",
    "PRODUCTION_KAKAO_ALIMTALK_MODE",
    "PRODUCTION_EMAIL_DELIVERY_MODE",
    "knownLimitations",
    "launchNote",
    "goNoGoDecision",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_PRODUCTION_GO_NO_GO_RUNBOOK.md", [
    "verify:aibeopchin-production-go-no-go-launch-rc",
    "AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE",
    "go / no-go",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-production-go-no-go-launch-rc")) {
    throw new Error("package.json must define verify:aibeopchin-production-go-no-go-launch-rc");
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RC_LOCK_SUMMARY.md", [
    "16-D",
    "Go/No-Go",
  ]);

  console.log(`[${label}] running production-go-no-go-launch-rc-lock Vitest …`);
  execSync("npm run test -- src/features/platform/production-go-no-go-launch-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
