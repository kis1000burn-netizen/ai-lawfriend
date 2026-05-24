import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "prisma/migrations/20260525200000_tenant_plan_entitlement_phase22b/migration.sql",
  "prisma/seed-tenant-plan.ts",
  "src/features/platform/tenant-entitlement/tenant-plan.schema.ts",
  "src/features/platform/tenant-entitlement/tenant-plan.registry.ts",
  "src/features/platform/tenant-entitlement/tenant-entitlement.policy.ts",
  "src/features/platform/tenant-entitlement/tenant-entitlement.service.ts",
  "src/features/platform/tenant-entitlement/tenant-entitlement.repository.ts",
  "src/features/platform/tenant-entitlement/tenant-entitlement.test.ts",
  "docs/operations/AIBEOPCHIN_TENANT_PLAN_ENTITLEMENT_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22B-PLAN-ENTITLEMENT";

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
    throw new Error(`Missing required Phase 22-B file: ${file}`);
  }
}

assertIncludes("prisma/schema.prisma", [
  "model TenantPlan",
  "enum TenantPlanTier",
  "FREE",
  "STARTER",
  "PRO",
  "ENTERPRISE",
]);

assertIncludes(
  "prisma/migrations/20260525200000_tenant_plan_entitlement_phase22b/migration.sql",
  ["TenantPlanTier", "CREATE TABLE \"TenantPlan\""],
);

assertIncludes("src/features/platform/tenant-entitlement/tenant-plan.registry.ts", [
  "TENANT_PLAN_REGISTRY_MARKER_PHASE22B",
  "TENANT_PLAN_TIER_REGISTRY",
  "FREE",
  "ENTERPRISE",
]);

assertIncludes("src/features/platform/tenant-entitlement/tenant-entitlement.policy.ts", [
  "TENANT_ENTITLEMENT_POLICY_MARKER_PHASE22B",
  "evaluateTenantSeatLimit",
  "evaluateTenantCaseLimit",
  "resolveTenantUiEntitlementVisibility",
  "mapExternalMessageChannelToEntitlementFeature",
]);

assertIncludes("src/features/platform/tenant-entitlement/tenant-entitlement.service.ts", [
  "TENANT_ENTITLEMENT_SERVICE_MARKER_PHASE22B",
  "enforceTenantApiEntitlement",
  "resolveTenantUiEntitlements",
  "persistTenantEntitlementDenialAudit",
  "TENANT_ENTITLEMENT_AUDIT_ACTION_DENIED",
]);

assertIncludes("src/features/platform/external-messaging/external-message-adapter.service.ts", [
  "assertExternalMessagingEntitlement",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_TENANT_PLAN_ENTITLEMENT_RUNBOOK.md",
  ["22-B", "FREE", "STARTER", "PRO", "ENTERPRISE", "enforceTenantApiEntitlement"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "22-B",
  "Plan / Feature Entitlement",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-tenant-phase22b")) {
  throw new Error("package.json must define verify:aibeopchin-tenant-phase22b");
}

execSync(
  "npm run test -- src/features/platform/tenant-entitlement/tenant-entitlement.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-tenant-phase22b PASS (Product Phase 22-B Plan / Feature Entitlement)",
);
