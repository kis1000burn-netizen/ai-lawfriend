import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41D-SENTENCING-RISK-MATRIX";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/sentencing-outcome-assessment/sentencing-risk/sentencing-risk-mitigation-matrix.service.ts",
  "docs/operations/AIBEOPCHIN_SENTENCING_RISK_MITIGATION_MATRIX_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/sentencing-outcome-assessment/sentencing-risk/sentencing-risk-mitigation-matrix.service.ts",
  ["buildSentencingRiskMitigationMatrix"],
);
assertIncludes(
  "src/features/sentencing-outcome-assessment/sentencing-risk/sentencing-risk-mitigation-matrix.policy.ts",
  ["sentencingRiskMitigationMatrixReady", "NO_AUTOMATED_SENTENCING_PREDICTION"],
);
assertIncludes("docs/operations/AIBEOPCHIN_SENTENCING_RISK_MITIGATION_MATRIX_RUNBOOK.md", ["41-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["41-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-sentencing-outcome-assessment-phase41d")) {
  throw new Error("missing verify script 41d");
}

execSync(
  "npm run test -- src/features/sentencing-outcome-assessment/sentencing-risk/sentencing-risk-mitigation-matrix.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-sentencing-outcome-assessment-phase41d PASS");
