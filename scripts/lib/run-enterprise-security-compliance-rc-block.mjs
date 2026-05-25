import fs from "node:fs";
import path from "node:path";

export function createEnterpriseSecurityComplianceRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Enterprise Security Compliance RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32A-SECURITY-CONTROL-INVENTORY",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32B-PRIVACY-DATA-PROTECTION",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32C-ACCESS-AUDIT-EVIDENCE",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32D-VENDOR-QUESTIONNAIRE",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32E-CERTIFICATION-GAP-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-enterprise-security-phase32a",
  "verify:aibeopchin-enterprise-security-phase32b",
  "verify:aibeopchin-enterprise-security-phase32c",
  "verify:aibeopchin-enterprise-security-phase32d",
  "verify:aibeopchin-enterprise-security-phase32e",
];

export function runEnterpriseSecurityComplianceRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-enterprise-security-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createEnterpriseSecurityComplianceRcFsHelpers(root);

  assertFileExists(
    "src/features/enterprise-security-compliance/enterprise-security-compliance-rc-lock.ts",
  );
  assertFileExists(
    "src/features/enterprise-security-compliance/enterprise-security-compliance-rc-lock.test.ts",
  );
  assertFileExists("docs/platform/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK.md");

  assertIncludes(
    "src/features/enterprise-security-compliance/enterprise-security-compliance-rc-lock.ts",
    [
      "ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_MARKER_PHASE32F",
      "verify:aibeopchin-enterprise-security-rc",
      "ENTERPRISE_SECURITY_COMPLIANCE_RC_PRODUCT_CROSS_LINK",
      "phase32a-security-control-inventory-gate",
      "phase32-no-certification-claim-boundary",
    ],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md", [
    "32-A",
    "32-F",
    "verify:aibeopchin-enterprise-security-rc",
    "31-F",
    "19-F",
    "no certification claim",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md",
    "Product 32-F",
  ]);

  assertIncludes(
    "src/features/enterprise-security-compliance/security-control-inventory/security-control-inventory.service.ts",
    ["buildSecurityControlInventory"],
  );
  assertIncludes(
    "src/features/enterprise-security-compliance/privacy-data-protection/privacy-data-protection-review.service.ts",
    ["buildPrivacyDataProtectionReviewPack"],
  );
  assertIncludes(
    "src/features/enterprise-security-compliance/access-control-audit/access-control-audit-evidence.service.ts",
    ["buildAccessControlAuditEvidencePack"],
  );
  assertIncludes(
    "src/features/enterprise-security-compliance/vendor-security-questionnaire/vendor-security-questionnaire.service.ts",
    ["buildVendorSecurityQuestionnairePack"],
  );
  assertIncludes(
    "src/features/enterprise-security-compliance/certification-gap-review/certification-gap-review.service.ts",
    ["buildCertificationReadinessGapReview"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md", [
    "Enterprise Security",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-enterprise-security-rc")) {
    throw new Error("package.json must define verify:aibeopchin-enterprise-security-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["32-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] enterprise-security-compliance-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/enterprise-security-compliance/enterprise-security-compliance-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
