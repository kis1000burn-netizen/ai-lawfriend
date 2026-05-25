import fs from "node:fs";
import path from "node:path";

export function createSalesPipelineDealDeskRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Sales Pipeline Deal Desk RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34A-SALES-PIPELINE-MODEL",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34B-LEAD-OPPORTUNITY-INTAKE",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34C-PROPOSAL-QUOTE-DESK",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34D-DEAL-RISK-LEGAL-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34E-SALES-ONBOARDING-HANDOFF",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34a",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34b",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34c",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34d",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34e",
];

export function runSalesPipelineDealDeskRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-sales-pipeline-deal-desk-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createSalesPipelineDealDeskRcFsHelpers(root);

  assertFileExists("src/features/sales-pipeline-deal-desk/sales-pipeline-deal-desk-rc-lock.ts");
  assertFileExists("src/features/sales-pipeline-deal-desk/sales-pipeline-deal-desk-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK.md");

  assertIncludes("src/features/sales-pipeline-deal-desk/sales-pipeline-deal-desk-rc-lock.ts", [
    "SALES_PIPELINE_DEAL_DESK_RC_LOCK_MARKER_PHASE34F",
    "verify:aibeopchin-sales-pipeline-deal-desk-rc",
    "SALES_PIPELINE_DEAL_DESK_RC_PRODUCT_CROSS_LINK",
    "phase34a-sales-pipeline-gate",
    "phase34-deal-desk-policy-only-boundary",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md", [
    "34-A",
    "34-F",
    "verify:aibeopchin-sales-pipeline-deal-desk-rc",
    "33-F",
    "no automatic contract",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md",
    "Product 34-F",
  ]);

  assertIncludes(
    "src/features/sales-pipeline-deal-desk/sales-pipeline/sales-pipeline-model.service.ts",
    ["buildSalesPipelineModel"],
  );
  assertIncludes(
    "src/features/sales-pipeline-deal-desk/lead-opportunity/lead-opportunity-intake.service.ts",
    ["buildLeadOpportunityIntake"],
  );
  assertIncludes(
    "src/features/sales-pipeline-deal-desk/quote-desk/proposal-quote-desk.service.ts",
    ["buildProposalQuoteDeskPolicy"],
  );
  assertIncludes(
    "src/features/sales-pipeline-deal-desk/deal-review/deal-risk-legal-review.service.ts",
    ["buildDealRiskLegalReviewGate"],
  );
  assertIncludes(
    "src/features/sales-pipeline-deal-desk/onboarding-handoff/sales-onboarding-handoff.service.ts",
    ["buildSalesToOnboardingHandoff"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md", [
    "Sales Pipeline",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-sales-pipeline-deal-desk-rc")) {
    throw new Error("package.json must define verify:aibeopchin-sales-pipeline-deal-desk-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["34-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] sales-pipeline-deal-desk-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/sales-pipeline-deal-desk/sales-pipeline-deal-desk-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
