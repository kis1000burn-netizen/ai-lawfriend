import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33D-CASE-STUDY-TEMPLATE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/public-trust-marketing/case-study/case-study-template.service.ts",
  "docs/operations/AIBEOPCHIN_CUSTOMER_PROOF_CASE_STUDY_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/public-trust-marketing/case-study/case-study-template.service.ts",
  ["buildCustomerProofCaseStudyTemplate"],
);
assertIncludes(
  "src/features/public-trust-marketing/case-study/case-study-template.policy.ts",
  ["caseStudyTemplateReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_CUSTOMER_PROOF_CASE_STUDY_RUNBOOK.md", ["33-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["33-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-public-trust-marketing-phase33d")) {
  throw new Error("missing verify script 33d");
}

execSync(
  "npm run test -- src/features/public-trust-marketing/case-study/case-study-template.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-public-trust-marketing-phase33d PASS");
