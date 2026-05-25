import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31E-PARTNER-QUALITY-COMPLIANCE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/partner-ecosystem/partner-quality-compliance/partner-quality-compliance.service.ts",
  "docs/operations/AIBEOPCHIN_PARTNER_QUALITY_COMPLIANCE_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/partner-ecosystem/partner-quality-compliance/partner-quality-compliance.service.ts",
  ["buildPartnerQualityComplianceReview"],
);
assertIncludes(
  "src/features/partner-ecosystem/partner-quality-compliance/partner-quality-compliance.policy.ts",
  ["partnerComplianceReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_PARTNER_QUALITY_COMPLIANCE_RUNBOOK.md", ["31-E"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["31-E"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-partner-ecosystem-phase31e")) {
  throw new Error("missing verify script 31e");
}

execSync(
  "npm run test -- src/features/partner-ecosystem/partner-quality-compliance/partner-quality-compliance.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-partner-ecosystem-phase31e PASS");
