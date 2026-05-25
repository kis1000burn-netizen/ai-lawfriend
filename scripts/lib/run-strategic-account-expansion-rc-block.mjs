import fs from "node:fs";
import path from "node:path";

export function createStrategicAccountExpansionRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Strategic Account Expansion RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39A-STRATEGIC-ACCOUNT-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39B-ENTERPRISE-EXPANSION-MAP",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39C-MULTI-BRANCH-ROLLOUT",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39D-EXECUTIVE-SPONSOR-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39E-EXPANSION-RISK-GOVERNANCE",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-strategic-account-expansion-phase39a",
  "verify:aibeopchin-strategic-account-expansion-phase39b",
  "verify:aibeopchin-strategic-account-expansion-phase39c",
  "verify:aibeopchin-strategic-account-expansion-phase39d",
  "verify:aibeopchin-strategic-account-expansion-phase39e",
];

export function runStrategicAccountExpansionRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-strategic-account-expansion-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createStrategicAccountExpansionRcFsHelpers(root);

  assertFileExists("src/features/strategic-account-expansion/strategic-account-expansion-rc-lock.ts");
  assertFileExists(
    "src/features/strategic-account-expansion/strategic-account-expansion-rc-lock.test.ts",
  );
  assertFileExists("docs/platform/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK.md");

  assertIncludes("src/features/strategic-account-expansion/strategic-account-expansion-rc-lock.ts", [
    "STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_MARKER_PHASE39F",
    "verify:aibeopchin-strategic-account-expansion-rc",
    "STRATEGIC_ACCOUNT_EXPANSION_RC_PRODUCT_CROSS_LINK",
    "phase39a-strategic-account-plan-gate",
    "phase39-strategic-account-expansion-policy-only-boundary",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md", [
    "39-A",
    "39-F",
    "verify:aibeopchin-strategic-account-expansion-rc",
    "38-F",
    "no automatic expansion execution",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md",
    "Product 39-F",
  ]);

  assertIncludes(
    "src/features/strategic-account-expansion/account-plan/strategic-account-plan.service.ts",
    ["buildStrategicAccountPlan"],
  );
  assertIncludes(
    "src/features/strategic-account-expansion/expansion-map/enterprise-expansion-map.service.ts",
    ["buildEnterpriseExpansionMap"],
  );
  assertIncludes(
    "src/features/strategic-account-expansion/multi-branch-rollout/multi-branch-rollout-playbook.service.ts",
    ["buildMultiBranchRolloutPlaybook"],
  );
  assertIncludes(
    "src/features/strategic-account-expansion/executive-sponsor/executive-sponsor-review.service.ts",
    ["buildExecutiveSponsorReview"],
  );
  assertIncludes(
    "src/features/strategic-account-expansion/expansion-governance/expansion-risk-governance-review.service.ts",
    ["buildExpansionRiskGovernanceReview"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md", [
    "Strategic Account Expansion",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-strategic-account-expansion-rc")) {
    throw new Error("package.json must define verify:aibeopchin-strategic-account-expansion-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["39-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] strategic-account-expansion-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/strategic-account-expansion/strategic-account-expansion-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
