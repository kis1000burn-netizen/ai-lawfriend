import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32B-PRIVACY-DATA-PROTECTION";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/enterprise-security-compliance/privacy-data-protection/privacy-data-protection-review.service.ts",
  "docs/operations/AIBEOPCHIN_PRIVACY_DATA_PROTECTION_REVIEW_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/enterprise-security-compliance/privacy-data-protection/privacy-data-protection-review.service.ts",
  ["buildPrivacyDataProtectionReviewPack"],
);
assertIncludes(
  "src/features/enterprise-security-compliance/privacy-data-protection/privacy-data-protection-review.policy.ts",
  ["privacyReviewPackReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_PRIVACY_DATA_PROTECTION_REVIEW_RUNBOOK.md", ["32-B"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["32-B"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-enterprise-security-phase32b")) {
  throw new Error("missing verify script 32b");
}

execSync(
  "npm run test -- src/features/enterprise-security-compliance/privacy-data-protection/privacy-data-protection-review.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-enterprise-security-phase32b PASS");
