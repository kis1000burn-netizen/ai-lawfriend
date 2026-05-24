import fs from "node:fs";
import path from "node:path";

export function createEnterpriseScaleRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Enterprise Scale RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30A-ENTERPRISE-DEPLOYMENT-MODEL",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30B-MULTI-TENANT-GOVERNANCE",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30C-PARTNER-BRANCH-NETWORK",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30D-ENTERPRISE-SECURITY-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30E-SCALE-MONITORING-CAPACITY",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-enterprise-scale-phase30a",
  "verify:aibeopchin-enterprise-scale-phase30b",
  "verify:aibeopchin-enterprise-scale-phase30c",
  "verify:aibeopchin-enterprise-scale-phase30d",
  "verify:aibeopchin-enterprise-scale-phase30e",
];

export function runEnterpriseScaleRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-enterprise-scale-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createEnterpriseScaleRcFsHelpers(root);

  assertFileExists("src/features/enterprise-scale/enterprise-scale-rc-lock.ts");
  assertFileExists("src/features/enterprise-scale/enterprise-scale-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_ENTERPRISE_SCALE_RC_RUNBOOK.md");

  assertIncludes("src/features/enterprise-scale/enterprise-scale-rc-lock.ts", [
    "ENTERPRISE_SCALE_RC_LOCK_MARKER_PHASE30F",
    "verify:aibeopchin-enterprise-scale-rc",
    "ENTERPRISE_SCALE_RC_PRODUCT_CROSS_LINK",
    "phase30a-enterprise-deployment-gate",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md", [
    "30-A",
    "30-F",
    "verify:aibeopchin-enterprise-scale-rc",
    "29-F",
    "22-F",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md",
    "Product 30-F",
  ]);

  assertIncludes(
    "src/features/enterprise-scale/enterprise-deployment/enterprise-deployment-model.service.ts",
    ["buildEnterpriseDeploymentModel"],
  );
  assertIncludes(
    "src/features/enterprise-scale/multi-tenant-governance/multi-tenant-governance.service.ts",
    ["buildMultiTenantGovernanceRoleDelegation"],
  );
  assertIncludes(
    "src/features/enterprise-scale/partner-branch-network/partner-branch-network.service.ts",
    ["buildPartnerBranchNetworkOperations"],
  );
  assertIncludes(
    "src/features/enterprise-scale/enterprise-security/enterprise-security-review-pack.service.ts",
    ["buildEnterpriseSecurityReviewPack"],
  );
  assertIncludes(
    "src/features/enterprise-scale/scale-monitoring/scale-monitoring-capacity-forecast.service.ts",
    ["buildScaleMonitoringCapacityForecast"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md", [
    "Enterprise Scale",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-enterprise-scale-rc")) {
    throw new Error("package.json must define verify:aibeopchin-enterprise-scale-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["30-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] enterprise-scale-rc-lock Vitest …`);
  execSync("npm run test -- src/features/enterprise-scale/enterprise-scale-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
