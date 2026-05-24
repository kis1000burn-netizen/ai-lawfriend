import fs from "node:fs";
import path from "node:path";

/**
 * Shared Tenant / Plan / Metering RC block (Product Phase 22-F).
 * Bundles 22-A~E static gates + Phase 20-F/21-F product cross-link.
 */
export function createTenantRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Tenant RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22A-ORGANIZATION-BASELINE",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22B-PLAN-ENTITLEMENT",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22C-USAGE-METERING",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22D-BILLING-USAGE-LEDGER",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22E-ADMIN-PLAN-CONSOLE",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-tenant-phase22a",
  "verify:aibeopchin-tenant-phase22b",
  "verify:aibeopchin-tenant-phase22c",
  "verify:aibeopchin-tenant-phase22d",
  "verify:aibeopchin-tenant-phase22e",
];

export function runTenantRcBlock(execSync, root, label = "verify:aibeopchin-tenant-rc") {
  const { readFile, assertFileExists, assertIncludes } = createTenantRcFsHelpers(root);

  assertFileExists("src/features/platform/tenant-plan-metering-rc-lock.ts");
  assertFileExists("src/features/platform/tenant-plan-metering-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_TENANT_PLAN_METERING_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_TENANT_PLAN_METERING_RC_RUNBOOK.md");

  assertIncludes("src/features/platform/tenant-plan-metering-rc-lock.ts", [
    "TENANT_PLAN_METERING_RC_LOCK_MARKER_PHASE22F",
    "verify:aibeopchin-tenant-rc",
    "TENANT_PLAN_METERING_RC_PRODUCT_CROSS_LINK",
    "TENANT_PLAN_METERING_RC_NO_AUTOMATIC_INVOICE_MARKER",
    "/admin/tenants",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_TENANT_PLAN_METERING_RC_LOCK_SUMMARY.md", [
    "22-A",
    "22-E",
    "22-F",
    "verify:aibeopchin-tenant-rc",
    "20-F",
    "21-F",
    "no automatic invoice",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_TENANT_PLAN_METERING_RC_RUNBOOK.md", [
    "verify:aibeopchin-tenant-rc",
    "Operator checklist",
    "22-A",
    "22-E",
    "period close",
    "/admin/tenants",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_TENANT_PLAN_METERING_RC_LOCK_SUMMARY.md",
    "AIBEOPCHIN_TENANT_PLAN_METERING_RC_RUNBOOK.md",
    "Product 22-F",
  ]);

  assertIncludes("src/features/platform/tenant-organization/tenant-organization.policy.ts", [
    "TENANT_ORGANIZATION_DEFAULT_SLUG",
    "resolveTenantScopedCaseTenantId",
  ]);

  assertIncludes("src/features/platform/tenant-entitlement/tenant-entitlement.service.ts", [
    "enforceTenantApiEntitlement",
    "TENANT_ENTITLEMENT_AUDIT_ACTION_DENIED",
  ]);

  assertIncludes("src/features/platform/tenant-metering/tenant-usage.policy.ts", [
    "buildTenantUsageSummary",
    "billingLedgerSeparated",
  ]);

  assertIncludes("src/features/platform/billing-ledger/billing-usage-ledger.service.ts", [
    "BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER",
    "createManualBillingLedgerAdjustment",
  ]);

  assertIncludes("src/features/platform/admin-tenant-plan/admin-tenant-plan-console.service.ts", [
    "getAdminTenantPlanConsoleSnapshot",
    "ADMIN_TENANT_PLAN_AUDIT_ACTIONS",
    "billingMutationsBlocked",
  ]);

  assertIncludes("src/features/platform/external-messaging/external-message-adapter.service.ts", [
    "assertExternalMessagingEntitlement",
    "recordTenantExternalMessageUsage",
  ]);

  assertIncludes("src/app/(protected)/admin/tenants/page.tsx", ["/admin/tenants"]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-tenant-rc")) {
    throw new Error("package.json must define verify:aibeopchin-tenant-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["22-F"]);

  assertIncludes("docs/platform/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md", [
    "Tenant / Plan / Metering",
  ]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] tenant-plan-metering-rc-lock Vitest …`);
  execSync("npm run test -- src/features/platform/tenant-plan-metering-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
