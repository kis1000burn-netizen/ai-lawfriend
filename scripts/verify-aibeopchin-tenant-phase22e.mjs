import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/app/(protected)/admin/tenants/page.tsx",
  "src/app/(protected)/admin/tenants/[tenantId]/plan/page.tsx",
  "src/app/api/admin/tenants/route.ts",
  "src/app/api/admin/tenants/[tenantId]/plan/route.ts",
  "src/app/api/admin/tenants/[tenantId]/feature-overrides/route.ts",
  "src/app/api/admin/tenants/[tenantId]/billing-ledger/adjustment/route.ts",
  "src/components/admin/tenants/admin-tenant-list-table.tsx",
  "src/components/admin/tenants/admin-tenant-plan-console.tsx",
  "src/features/platform/admin-tenant-plan/admin-tenant-plan-console.service.ts",
  "src/features/platform/admin-tenant-plan/admin-tenant-plan-console.policy.ts",
  "src/features/platform/admin-tenant-plan/admin-tenant-plan-console.test.ts",
  "docs/operations/AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22E-ADMIN-PLAN-CONSOLE";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required Phase 22-E file: ${file}`);
  }
}

assertIncludes("src/features/platform/admin-tenant-plan/admin-tenant-plan-console.policy.ts", [
  "ADMIN_TENANT_PLAN_CONSOLE_POLICY_MARKER_PHASE22E",
  "/admin/tenants",
  "TENANT_PLAN_UPDATED",
  "TENANT_FEATURE_OVERRIDE_UPDATED",
  "BILLING_LEDGER_ADJUSTED",
]);

assertIncludes("src/features/platform/admin-tenant-plan/admin-tenant-plan-console.service.ts", [
  "ADMIN_TENANT_PLAN_CONSOLE_SERVICE_MARKER_PHASE22E",
  "getAdminTenantPlanConsoleSnapshot",
  "updateAdminTenantPlan",
  "updateAdminTenantFeatureOverrides",
  "createAdminBillingLedgerAdjustment",
]);

assertIncludes("src/components/admin/tenants/admin-tenant-plan-console.tsx", [
  "billingMutationsBlocked",
  "PERIOD CLOSED",
  "Manual adjustment",
]);

assertIncludes("src/app/(protected)/layout.tsx", ["/admin/tenants", "Tenant / Plan"]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md",
  ["22-E", "no automatic invoice", "period close"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "22-E",
  "Admin Plan Console",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-tenant-phase22e")) {
  throw new Error("package.json must define verify:aibeopchin-tenant-phase22e");
}

execSync(
  "npm run test -- src/features/platform/admin-tenant-plan/admin-tenant-plan-console.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-tenant-phase22e PASS (Product Phase 22-E Admin Plan Console)",
);
