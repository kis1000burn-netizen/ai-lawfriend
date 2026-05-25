import fs from "node:fs";
import path from "node:path";

export function createLongTermCustomerSuccessRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Long-term Customer Success RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38A-90-DAY-SUCCESS-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38B-QUARTERLY-BUSINESS-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38C-RENEWAL-READINESS-TIMELINE",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38D-EXPANSION-UPSELL-PLAYBOOK",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38E-CHURN-PREVENTION-LOOP",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-long-term-customer-success-phase38a",
  "verify:aibeopchin-long-term-customer-success-phase38b",
  "verify:aibeopchin-long-term-customer-success-phase38c",
  "verify:aibeopchin-long-term-customer-success-phase38d",
  "verify:aibeopchin-long-term-customer-success-phase38e",
];

export function runLongTermCustomerSuccessRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-long-term-customer-success-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createLongTermCustomerSuccessRcFsHelpers(root);

  assertFileExists("src/features/long-term-customer-success/long-term-customer-success-rc-lock.ts");
  assertFileExists(
    "src/features/long-term-customer-success/long-term-customer-success-rc-lock.test.ts",
  );
  assertFileExists("docs/platform/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK.md");

  assertIncludes("src/features/long-term-customer-success/long-term-customer-success-rc-lock.ts", [
    "LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_MARKER_PHASE38F",
    "verify:aibeopchin-long-term-customer-success-rc",
    "LONG_TERM_CUSTOMER_SUCCESS_RC_PRODUCT_CROSS_LINK",
    "phase38a-90-day-success-plan-gate",
    "phase38-long-term-customer-success-policy-only-boundary",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md", [
    "38-A",
    "38-F",
    "verify:aibeopchin-long-term-customer-success-rc",
    "37-F",
    "no automatic renewal",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md",
    "Product 38-F",
  ]);

  assertIncludes(
    "src/features/long-term-customer-success/ninety-day-plan/ninety-day-success-plan.service.ts",
    ["build90DaySuccessPlan"],
  );
  assertIncludes(
    "src/features/long-term-customer-success/quarterly-review/quarterly-business-review-pack.service.ts",
    ["buildQuarterlyBusinessReviewPack"],
  );
  assertIncludes(
    "src/features/long-term-customer-success/renewal-readiness/renewal-readiness-timeline.service.ts",
    ["buildRenewalReadinessTimeline"],
  );
  assertIncludes(
    "src/features/long-term-customer-success/expansion-upsell/expansion-upsell-playbook.service.ts",
    ["buildExpansionUpsellPlaybook"],
  );
  assertIncludes(
    "src/features/long-term-customer-success/churn-prevention/long-term-churn-prevention-loop.service.ts",
    ["buildLongTermChurnPreventionLoop"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md", [
    "Long-term Customer Success",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-long-term-customer-success-rc")) {
    throw new Error("package.json must define verify:aibeopchin-long-term-customer-success-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["38-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] long-term-customer-success-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/long-term-customer-success/long-term-customer-success-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
