import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40C-JUDGMENT-MAPPING";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/legal-outcome-assessment/judgment-mapping/issue-burden-evidence-judgment-mapping.service.ts",
  "docs/operations/AIBEOPCHIN_ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/legal-outcome-assessment/judgment-mapping/issue-burden-evidence-judgment-mapping.service.ts",
  ["buildIssueBurdenEvidenceJudgmentMapping"],
);
assertIncludes(
  "src/features/legal-outcome-assessment/judgment-mapping/issue-burden-evidence-judgment-mapping.policy.ts",
  ["issueBurdenEvidenceJudgmentMappingReady", "NO_JUDGMENTLESS_LEGAL_ASSESSMENT"],
);
assertIncludes(
  "src/features/legal-outcome-assessment/shared/judgment-grounded-types.schema.ts",
  ["noJudgmentFallbackAllowed"],
);
assertIncludes(
  "docs/operations/AIBEOPCHIN_ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_RUNBOOK.md",
  ["40-C"],
);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["40-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-legal-outcome-assessment-phase40c")) {
  throw new Error("missing verify script 40c");
}

execSync(
  "npm run test -- src/features/legal-outcome-assessment/judgment-mapping/issue-burden-evidence-judgment-mapping.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-legal-outcome-assessment-phase40c PASS");
