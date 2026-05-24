import fs from "node:fs";
import path from "node:path";

export function createRevenueOpsRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Revenue Ops RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29A-ACCOUNT-HEALTH-SCORE",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29B-CUSTOMER-SUCCESS-ACTIVITY-LOG",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29C-RENEWAL-CHURN-RISK-MONITOR",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29D-EXPANSION-OPPORTUNITY-TRACKER",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29E-EXECUTIVE-PARTNER-SUCCESS-REPORT",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-revenue-ops-phase29a",
  "verify:aibeopchin-revenue-ops-phase29b",
  "verify:aibeopchin-revenue-ops-phase29c",
  "verify:aibeopchin-revenue-ops-phase29d",
  "verify:aibeopchin-revenue-ops-phase29e",
];

export function runRevenueOpsRcBlock(execSync, root, label = "verify:aibeopchin-revenue-ops-rc") {
  const { readFile, assertFileExists, assertIncludes } = createRevenueOpsRcFsHelpers(root);

  assertFileExists("src/features/revenue-ops/revenue-ops-rc-lock.ts");
  assertFileExists("src/features/revenue-ops/revenue-ops-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_REVENUE_OPS_RC_RUNBOOK.md");

  assertIncludes("src/features/revenue-ops/revenue-ops-rc-lock.ts", [
    "REVENUE_OPS_RC_LOCK_MARKER_PHASE29F",
    "verify:aibeopchin-revenue-ops-rc",
    "REVENUE_OPS_RC_PRODUCT_CROSS_LINK",
    "phase29a-account-health-gate",
    "phase29f-no-invoice-payment-mutation",
    "BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md", [
    "29-A",
    "29-F",
    "verify:aibeopchin-revenue-ops-rc",
    "28-F",
    "22-F",
    "no automatic invoice",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md",
    "Product 29-F",
  ]);

  assertIncludes("src/features/revenue-ops/account-health/account-health-score.service.ts", [
    "buildRevenueAccountHealthScore",
  ]);
  assertIncludes("src/features/revenue-ops/customer-success/customer-success-activity.service.ts", [
    "recordCustomerSuccessActivity",
  ]);
  assertIncludes("src/features/revenue-ops/renewal-churn-risk/renewal-churn-risk.service.ts", [
    "buildRenewalChurnRiskMonitor",
  ]);
  assertIncludes("src/features/revenue-ops/expansion-opportunity/expansion-opportunity.service.ts", [
    "buildExpansionOpportunityTracker",
  ]);
  assertIncludes("src/features/revenue-ops/executive-report/executive-partner-report.service.ts", [
    "buildExecutivePartnerSuccessReport",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md", [
    "Revenue Operations",
  ]);

  assertIncludes("prisma/schema.prisma", ["model CustomerSuccessActivity"]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-revenue-ops-rc")) {
    throw new Error("package.json must define verify:aibeopchin-revenue-ops-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["29-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] revenue-ops-rc-lock Vitest …`);
  execSync("npm run test -- src/features/revenue-ops/revenue-ops-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
