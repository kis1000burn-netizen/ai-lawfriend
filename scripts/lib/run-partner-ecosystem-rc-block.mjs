import fs from "node:fs";
import path from "node:path";

export function createPartnerEcosystemRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Partner Ecosystem RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31A-PARTNER-PROGRAM-MODEL",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31B-REFERRAL-REVENUE-SHARE",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31C-EXPERT-NETWORK-ROUTING",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31D-MARKETPLACE-CATALOG",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31E-PARTNER-QUALITY-COMPLIANCE",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-partner-ecosystem-phase31a",
  "verify:aibeopchin-partner-ecosystem-phase31b",
  "verify:aibeopchin-partner-ecosystem-phase31c",
  "verify:aibeopchin-partner-ecosystem-phase31d",
  "verify:aibeopchin-partner-ecosystem-phase31e",
];

export function runPartnerEcosystemRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-partner-ecosystem-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createPartnerEcosystemRcFsHelpers(root);

  assertFileExists("src/features/partner-ecosystem/partner-ecosystem-rc-lock.ts");
  assertFileExists("src/features/partner-ecosystem/partner-ecosystem-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_RUNBOOK.md");

  assertIncludes("src/features/partner-ecosystem/partner-ecosystem-rc-lock.ts", [
    "PARTNER_ECOSYSTEM_RC_LOCK_MARKER_PHASE31F",
    "verify:aibeopchin-partner-ecosystem-rc",
    "PARTNER_ECOSYSTEM_RC_PRODUCT_CROSS_LINK",
    "phase31a-partner-program-gate",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md", [
    "31-A",
    "31-F",
    "verify:aibeopchin-partner-ecosystem-rc",
    "30-F",
    "22-F",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md",
    "Product 31-F",
  ]);

  assertIncludes(
    "src/features/partner-ecosystem/partner-program/partner-program-model.service.ts",
    ["buildPartnerProgramModel"],
  );
  assertIncludes(
    "src/features/partner-ecosystem/partner-referral-revenue/partner-referral-revenue-share.service.ts",
    ["buildPartnerReferralRevenueSharePolicy"],
  );
  assertIncludes(
    "src/features/partner-ecosystem/expert-network-routing/expert-network-case-routing.service.ts",
    ["buildExpertNetworkCaseRouting"],
  );
  assertIncludes(
    "src/features/partner-ecosystem/marketplace-catalog/marketplace-service-catalog.service.ts",
    ["buildMarketplaceListingServiceCatalog"],
  );
  assertIncludes(
    "src/features/partner-ecosystem/partner-quality-compliance/partner-quality-compliance.service.ts",
    ["buildPartnerQualityComplianceReview"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md", [
    "Partner Ecosystem",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-partner-ecosystem-rc")) {
    throw new Error("package.json must define verify:aibeopchin-partner-ecosystem-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["31-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] partner-ecosystem-rc-lock Vitest …`);
  execSync("npm run test -- src/features/partner-ecosystem/partner-ecosystem-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
