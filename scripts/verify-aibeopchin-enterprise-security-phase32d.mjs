import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32D-VENDOR-QUESTIONNAIRE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/enterprise-security-compliance/vendor-security-questionnaire/vendor-security-questionnaire.service.ts",
  "docs/operations/AIBEOPCHIN_VENDOR_SECURITY_QUESTIONNAIRE_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/enterprise-security-compliance/vendor-security-questionnaire/vendor-security-questionnaire.service.ts",
  ["buildVendorSecurityQuestionnairePack"],
);
assertIncludes(
  "src/features/enterprise-security-compliance/vendor-security-questionnaire/vendor-security-questionnaire.policy.ts",
  ["vendorQuestionnairePackReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_VENDOR_SECURITY_QUESTIONNAIRE_RUNBOOK.md", ["32-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["32-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-enterprise-security-phase32d")) {
  throw new Error("missing verify script 32d");
}

execSync(
  "npm run test -- src/features/enterprise-security-compliance/vendor-security-questionnaire/vendor-security-questionnaire.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-enterprise-security-phase32d PASS");
