import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30D-ENTERPRISE-SECURITY-REVIEW";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/enterprise-scale/enterprise-security/enterprise-security-review-pack.service.ts",
  "docs/operations/AIBEOPCHIN_ENTERPRISE_SECURITY_REVIEW_PACK_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/enterprise-scale/enterprise-security/enterprise-security-review-pack.service.ts",
  ["buildEnterpriseSecurityReviewPack"],
);
assertIncludes(
  "src/features/enterprise-scale/enterprise-security/enterprise-security-review-pack.policy.ts",
  ["securityReviewPackReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_ENTERPRISE_SECURITY_REVIEW_PACK_RUNBOOK.md", ["30-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["30-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-enterprise-scale-phase30d")) {
  throw new Error("missing verify script 30d");
}

execSync(
  "npm run test -- src/features/enterprise-scale/enterprise-security/enterprise-security-review-pack.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-enterprise-scale-phase30d PASS");
