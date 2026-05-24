import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "prisma/schema.prisma",
  "prisma/migrations/20260525190000_tenant_organization_phase22a/migration.sql",
  "prisma/seed-tenant-organization.ts",
  "src/features/platform/tenant-organization/tenant-organization.schema.ts",
  "src/features/platform/tenant-organization/tenant-organization.policy.ts",
  "src/features/platform/tenant-organization/tenant-organization.policy.test.ts",
  "src/features/platform/tenant-organization/tenant-organization.repository.ts",
  "docs/operations/AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22A-ORGANIZATION-BASELINE";

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
    throw new Error(`Missing required Phase 22-A file: ${file}`);
  }
}

assertIncludes("prisma/schema.prisma", [
  "model Tenant",
  "model TenantMembership",
  "enum TenantStatus",
  "enum TenantMembershipRole",
  "tenantId",
]);

assertIncludes(
  "prisma/migrations/20260525190000_tenant_organization_phase22a/migration.sql",
  ["TenantStatus", "TenantMembershipRole", "CREATE TABLE \"Tenant\""],
);

assertIncludes("src/features/platform/tenant-organization/tenant-organization.policy.ts", [
  "TENANT_ORGANIZATION_POLICY_MARKER_PHASE22A",
  "TENANT_ORGANIZATION_DEFAULT_SLUG",
  "resolveTenantScopedCaseTenantId",
  "canManageTenantMembership",
]);

assertIncludes("src/features/platform/tenant-organization/tenant-organization.repository.ts", [
  "TENANT_ORGANIZATION_REPOSITORY_MARKER_PHASE22A",
  "createTenantWithOwner",
  "findPrimaryMembershipForUser",
  "attachTenantToCase",
]);

assertIncludes("prisma/seed-tenant-organization.ts", [
  "seedTenantOrganizationDemo",
  "TENANT_ORGANIZATION_DEFAULT_SLUG",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md",
  ["22-A", "Tenant", "Membership", "aibeopchin-demo"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "22-A",
  "Tenant / Organization Model",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-tenant-phase22a")) {
  throw new Error("package.json must define verify:aibeopchin-tenant-phase22a");
}

execSync(
  "npm run test -- src/features/platform/tenant-organization/tenant-organization.policy.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-tenant-phase22a PASS (Product Phase 22-A Tenant / Organization Baseline)",
);
