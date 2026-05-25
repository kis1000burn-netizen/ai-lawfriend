import fs from "node:fs";
import path from "node:path";

export function createPublicTrustMarketingRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Public Trust Marketing RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33A-TRUST-CENTER-CONTENT",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33B-SALES-DEMO-PITCH-DECK",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33C-WEBSITE-LANDING-MESSAGE",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33D-CASE-STUDY-TEMPLATE",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33E-PROPOSAL-KIT",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-public-trust-marketing-phase33a",
  "verify:aibeopchin-public-trust-marketing-phase33b",
  "verify:aibeopchin-public-trust-marketing-phase33c",
  "verify:aibeopchin-public-trust-marketing-phase33d",
  "verify:aibeopchin-public-trust-marketing-phase33e",
];

export function runPublicTrustMarketingRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-public-trust-marketing-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createPublicTrustMarketingRcFsHelpers(root);

  assertFileExists("src/features/public-trust-marketing/public-trust-marketing-rc-lock.ts");
  assertFileExists("src/features/public-trust-marketing/public-trust-marketing-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_RUNBOOK.md");

  assertIncludes("src/features/public-trust-marketing/public-trust-marketing-rc-lock.ts", [
    "PUBLIC_TRUST_MARKETING_RC_LOCK_MARKER_PHASE33F",
    "verify:aibeopchin-public-trust-marketing-rc",
    "PUBLIC_TRUST_MARKETING_RC_PRODUCT_CROSS_LINK",
    "phase33a-trust-center-content-gate",
    "phase33-no-unverified-marketing-claim-boundary",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md", [
    "33-A",
    "33-F",
    "verify:aibeopchin-public-trust-marketing-rc",
    "32-F",
    "no unverified marketing claim",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md",
    "Product 33-F",
  ]);

  assertIncludes(
    "src/features/public-trust-marketing/trust-center/trust-center-content.service.ts",
    ["buildTrustCenterContentPack"],
  );
  assertIncludes(
    "src/features/public-trust-marketing/sales-demo/sales-demo-pitch-deck.service.ts",
    ["buildSalesDemoPitchDeckPack"],
  );
  assertIncludes(
    "src/features/public-trust-marketing/website-landing/website-landing-message.service.ts",
    ["buildWebsiteLandingMessageRefresh"],
  );
  assertIncludes(
    "src/features/public-trust-marketing/case-study/case-study-template.service.ts",
    ["buildCustomerProofCaseStudyTemplate"],
  );
  assertIncludes("src/features/public-trust-marketing/proposal-kit/proposal-kit.service.ts", [
    "buildPartnerEnterpriseProposalKit",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md", [
    "Public Trust",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-public-trust-marketing-rc")) {
    throw new Error("package.json must define verify:aibeopchin-public-trust-marketing-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["33-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] public-trust-marketing-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/public-trust-marketing/public-trust-marketing-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
