import fs from "node:fs";
import path from "node:path";

export function createContractingLegalOpsRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Contracting Legal Ops RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35A-CONTRACT-TEMPLATE-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35B-LEGAL-REVIEW-WORKFLOW",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35C-ORDER-FORM-SOW-POLICY",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35D-DPA-SECURITY-ADDENDUM",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35E-SIGNATURE-APPROVAL-MATRIX",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-contracting-legal-ops-phase35a",
  "verify:aibeopchin-contracting-legal-ops-phase35b",
  "verify:aibeopchin-contracting-legal-ops-phase35c",
  "verify:aibeopchin-contracting-legal-ops-phase35d",
  "verify:aibeopchin-contracting-legal-ops-phase35e",
];

export function runContractingLegalOpsRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-contracting-legal-ops-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createContractingLegalOpsRcFsHelpers(root);

  assertFileExists("src/features/contracting-legal-ops/contracting-legal-ops-rc-lock.ts");
  assertFileExists("src/features/contracting-legal-ops/contracting-legal-ops-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_RUNBOOK.md");

  assertIncludes("src/features/contracting-legal-ops/contracting-legal-ops-rc-lock.ts", [
    "CONTRACTING_LEGAL_OPS_RC_LOCK_MARKER_PHASE35F",
    "verify:aibeopchin-contracting-legal-ops-rc",
    "CONTRACTING_LEGAL_OPS_RC_PRODUCT_CROSS_LINK",
    "phase35a-contract-template-gate",
    "phase35-contracting-legal-ops-policy-only-boundary",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md", [
    "35-A",
    "35-F",
    "verify:aibeopchin-contracting-legal-ops-rc",
    "34-F",
    "no automatic signature",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md",
    "Product 35-F",
  ]);

  assertIncludes(
    "src/features/contracting-legal-ops/contract-template/contract-template-pack.service.ts",
    ["buildContractTemplatePack"],
  );
  assertIncludes(
    "src/features/contracting-legal-ops/legal-review/legal-review-workflow.service.ts",
    ["buildLegalReviewWorkflow"],
  );
  assertIncludes(
    "src/features/contracting-legal-ops/order-form-sow/order-form-sow-policy.service.ts",
    ["buildOrderFormSowPolicy"],
  );
  assertIncludes(
    "src/features/contracting-legal-ops/dpa-security/dpa-security-addendum.service.ts",
    ["buildDpaSecurityAddendumPack"],
  );
  assertIncludes(
    "src/features/contracting-legal-ops/signature-approval/signature-approval-matrix.service.ts",
    ["buildSignatureReadinessApprovalMatrix"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md", [
    "Contracting / Legal Ops",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-contracting-legal-ops-rc")) {
    throw new Error("package.json must define verify:aibeopchin-contracting-legal-ops-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["35-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] contracting-legal-ops-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/contracting-legal-ops/contracting-legal-ops-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
