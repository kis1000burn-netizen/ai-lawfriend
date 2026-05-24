import fs from "node:fs";
import path from "node:path";

export function createPaidConversionScaleRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Paid Conversion Scale RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28A-PAID-CONVERSION-CONTRACT-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28B-PRODUCTION-TENANT-MIGRATION-CHECKLIST",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28C-SLA-SUPPORT-TIER-POLICY",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28D-SALES-ONBOARDING-HANDOFF-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28E-SCALE-RISK-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-paid-conversion-scale-phase28a",
  "verify:aibeopchin-paid-conversion-scale-phase28b",
  "verify:aibeopchin-paid-conversion-scale-phase28c",
  "verify:aibeopchin-paid-conversion-scale-phase28d",
  "verify:aibeopchin-paid-conversion-scale-phase28e",
];

export function runPaidConversionScaleRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-paid-conversion-scale-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createPaidConversionScaleRcFsHelpers(root);

  assertFileExists("src/features/paid-conversion-scale/paid-conversion-scale-rc-lock.ts");
  assertFileExists("src/features/paid-conversion-scale/paid-conversion-scale-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_RUNBOOK.md");

  assertIncludes("src/features/paid-conversion-scale/paid-conversion-scale-rc-lock.ts", [
    "PAID_CONVERSION_SCALE_RC_LOCK_MARKER_PHASE28F",
    "verify:aibeopchin-paid-conversion-scale-rc",
    "PAID_CONVERSION_SCALE_RC_PRODUCT_CROSS_LINK",
    "phase28a-paid-conversion-contract-gate",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md", [
    "28-A",
    "28-F",
    "verify:aibeopchin-paid-conversion-scale-rc",
    "27-F",
    "26-F",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md",
    "Product 28-F",
  ]);

  assertIncludes("src/features/paid-conversion-scale/paid-conversion-contract-pack.service.ts", [
    "buildPaidConversionContractPack",
  ]);
  assertIncludes(
    "src/features/paid-conversion-scale/production-tenant-migration-checklist.service.ts",
    ["buildProductionTenantMigrationChecklist"],
  );
  assertIncludes("src/features/paid-conversion-scale/sla-support-tier-policy.service.ts", [
    "buildSlaSupportTierPolicy",
  ]);
  assertIncludes("src/features/paid-conversion-scale/sales-onboarding-handoff-pack.service.ts", [
    "buildSalesOnboardingHandoffPack",
  ]);
  assertIncludes("src/features/paid-conversion-scale/scale-risk-review.service.ts", [
    "buildScaleRiskReview",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md", [
    "Paid Conversion",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-paid-conversion-scale-rc")) {
    throw new Error("package.json must define verify:aibeopchin-paid-conversion-scale-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["28-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] paid-conversion-scale-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/paid-conversion-scale/paid-conversion-scale-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
