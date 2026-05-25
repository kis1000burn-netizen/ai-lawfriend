import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34B-LEAD-OPPORTUNITY-INTAKE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/sales-pipeline-deal-desk/lead-opportunity/lead-opportunity-intake.service.ts",
  "docs/operations/AIBEOPCHIN_LEAD_OPPORTUNITY_INTAKE_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/sales-pipeline-deal-desk/lead-opportunity/lead-opportunity-intake.service.ts",
  ["buildLeadOpportunityIntake"],
);
assertIncludes(
  "src/features/sales-pipeline-deal-desk/lead-opportunity/lead-opportunity-intake.policy.ts",
  ["leadOpportunityIntakeReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_LEAD_OPPORTUNITY_INTAKE_RUNBOOK.md", ["34-B"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["34-B"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-sales-pipeline-deal-desk-phase34b")) {
  throw new Error("missing verify script 34b");
}

execSync(
  "npm run test -- src/features/sales-pipeline-deal-desk/lead-opportunity/lead-opportunity-intake.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-sales-pipeline-deal-desk-phase34b PASS");
