import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "prisma/migrations/20260525210000_tenant_usage_metering_phase22c/migration.sql",
  "src/features/platform/tenant-metering/tenant-usage.schema.ts",
  "src/features/platform/tenant-metering/tenant-usage.policy.ts",
  "src/features/platform/tenant-metering/tenant-metering.repository.ts",
  "src/features/platform/tenant-metering/tenant-metering.service.ts",
  "src/features/platform/tenant-metering/tenant-metering-bridge.service.ts",
  "src/features/platform/tenant-metering/tenant-metering.test.ts",
  "docs/operations/AIBEOPCHIN_TENANT_USAGE_METERING_RUNBOOK.md",
];

const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22C-USAGE-METERING";

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
    throw new Error(`Missing required Phase 22-C file: ${file}`);
  }
}

assertIncludes("prisma/schema.prisma", [
  "model TenantUsageEvent",
  "enum TenantUsageEventKind",
  "AI_TOKEN_USAGE",
  "CLIENT_PORTAL_ACTIVE",
]);

assertIncludes(
  "prisma/migrations/20260525210000_tenant_usage_metering_phase22c/migration.sql",
  ["TenantUsageEventKind", "CREATE TABLE \"TenantUsageEvent\""],
);

assertIncludes("src/features/platform/tenant-metering/tenant-usage.policy.ts", [
  "TENANT_USAGE_POLICY_MARKER_PHASE22C",
  "resolveTenantUsagePeriodKey",
  "compareTenantUsageAgainstPlanLimits",
  "TENANT_METERING_NOT_BILLING_LEDGER_MARKER",
]);

assertIncludes("src/features/platform/tenant-metering/tenant-metering.service.ts", [
  "TENANT_METERING_SERVICE_MARKER_PHASE22C",
  "recordTenantAiTokenUsage",
  "recordTenantExternalMessageUsage",
  "getTenantUsageSummary",
  "getTenantUsageOverLimitWarnings",
]);

assertIncludes("src/features/platform/tenant-metering/tenant-metering.repository.ts", [
  "aggregateTenantUsageTotals",
  "aggregateTenantCaseLlmUsage",
]);

assertIncludes("src/features/platform/external-messaging/external-message-adapter.service.ts", [
  "recordTenantExternalMessageUsage",
]);

assertIncludes("src/features/ai-core/ai-governance-audit.service.ts", [
  "recordTenantAiUsageFromGovernanceInvoke",
]);

assertIncludes("docs/operations/AIBEOPCHIN_TENANT_USAGE_METERING_RUNBOOK.md", [
  "22-C",
  "TenantUsageEvent",
  "billing ledger",
  "getTenantUsageSummary",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "22-C",
  "Usage Metering",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-tenant-phase22c")) {
  throw new Error("package.json must define verify:aibeopchin-tenant-phase22c");
}

execSync(
  "npm run test -- src/features/platform/tenant-metering/tenant-metering.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-tenant-phase22c PASS (Product Phase 22-C Usage Metering)",
);
