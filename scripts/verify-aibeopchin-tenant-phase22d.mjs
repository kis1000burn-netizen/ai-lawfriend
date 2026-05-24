import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "prisma/migrations/20260525220000_billing_usage_ledger_phase22d/migration.sql",
  "src/features/platform/billing-ledger/billing-usage-ledger.schema.ts",
  "src/features/platform/billing-ledger/billing-unit-cost.registry.ts",
  "src/features/platform/billing-ledger/billing-usage-ledger.policy.ts",
  "src/features/platform/billing-ledger/billing-usage-ledger.repository.ts",
  "src/features/platform/billing-ledger/billing-usage-ledger.service.ts",
  "src/features/platform/billing-ledger/billing-usage-ledger-bridge.service.ts",
  "src/features/platform/billing-ledger/billing-usage-ledger.test.ts",
  "docs/operations/AIBEOPCHIN_BILLING_USAGE_LEDGER_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22D-BILLING-USAGE-LEDGER";

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
    throw new Error(`Missing required Phase 22-D file: ${file}`);
  }
}

assertIncludes("prisma/schema.prisma", [
  "model BillingUsageLedger",
  "model BillingLedgerPeriodClose",
  "enum BillingLedgerStatus",
  "DRAFT",
  "POSTED",
  "VOIDED",
  "ADJUSTED",
]);

assertIncludes(
  "prisma/migrations/20260525220000_billing_usage_ledger_phase22d/migration.sql",
  ["BillingUsageLedger", "BillingLedgerPeriodClose", "meteringEventId"],
);

assertIncludes("src/features/platform/billing-ledger/billing-usage-ledger.policy.ts", [
  "BILLING_USAGE_LEDGER_POLICY_MARKER_PHASE22D",
  "BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER",
  "DUPLICATE_CHARGE",
  "PERIOD_CLOSED",
  "mapMeteringKindToChargeCategory",
]);

assertIncludes("src/features/platform/billing-ledger/billing-usage-ledger.service.ts", [
  "BILLING_USAGE_LEDGER_SERVICE_MARKER_PHASE22D",
  "promoteMeteringEventToBillingLedger",
  "postBillingLedgerEntry",
  "voidBillingLedgerEntry",
  "createManualBillingLedgerAdjustment",
  "closeTenantBillingPeriod",
  "BILLING_LEDGER_MANUAL_ADJUSTMENT",
]);

assertIncludes("src/features/platform/tenant-metering/tenant-metering.service.ts", [
  "promoteMeteringEventToBillingLedgerDraft",
]);

assertIncludes("docs/operations/AIBEOPCHIN_BILLING_USAGE_LEDGER_RUNBOOK.md", [
  "22-D",
  "BillingUsageLedger",
  "no automatic invoice",
  "meteringEventId",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "22-D",
  "Billing-safe Usage Ledger",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-tenant-phase22d")) {
  throw new Error("package.json must define verify:aibeopchin-tenant-phase22d");
}

execSync(
  "npm run test -- src/features/platform/billing-ledger/billing-usage-ledger.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-tenant-phase22d PASS (Product Phase 22-D Billing-safe Usage Ledger)",
);
