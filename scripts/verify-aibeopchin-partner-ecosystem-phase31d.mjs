import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31D-MARKETPLACE-CATALOG";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/partner-ecosystem/marketplace-catalog/marketplace-service-catalog.service.ts",
  "docs/operations/AIBEOPCHIN_MARKETPLACE_SERVICE_CATALOG_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/partner-ecosystem/marketplace-catalog/marketplace-service-catalog.service.ts",
  ["buildMarketplaceListingServiceCatalog"],
);
assertIncludes(
  "src/features/partner-ecosystem/marketplace-catalog/marketplace-service-catalog.policy.ts",
  ["marketplaceCatalogReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_MARKETPLACE_SERVICE_CATALOG_RUNBOOK.md", ["31-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["31-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-partner-ecosystem-phase31d")) {
  throw new Error("missing verify script 31d");
}

execSync(
  "npm run test -- src/features/partner-ecosystem/marketplace-catalog/marketplace-service-catalog.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-partner-ecosystem-phase31d PASS");
