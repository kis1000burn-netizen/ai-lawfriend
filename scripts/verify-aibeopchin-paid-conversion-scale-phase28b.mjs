import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28B-PRODUCTION-TENANT-MIGRATION-CHECKLIST";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/paid-conversion-scale/production-tenant-migration-checklist.service.ts",
  "docs/operations/AIBEOPCHIN_PRODUCTION_TENANT_MIGRATION_CHECKLIST_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/paid-conversion-scale/production-tenant-migration-checklist.service.ts",
  ["buildProductionTenantMigrationChecklist"],
);
assertIncludes(
  "src/features/paid-conversion-scale/production-tenant-migration-checklist.policy.ts",
  ["migrationChecklistReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_PRODUCTION_TENANT_MIGRATION_CHECKLIST_RUNBOOK.md", [
  "28-B",
]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["28-B"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-paid-conversion-scale-phase28b")) {
  throw new Error("missing verify script 28b");
}

execSync(
  "npm run test -- src/features/paid-conversion-scale/production-tenant-migration-checklist.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-paid-conversion-scale-phase28b PASS");
