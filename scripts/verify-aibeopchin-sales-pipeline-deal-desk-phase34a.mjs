import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34A-SALES-PIPELINE-MODEL";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/sales-pipeline-deal-desk/sales-pipeline/sales-pipeline-model.service.ts",
  "docs/operations/AIBEOPCHIN_SALES_PIPELINE_MODEL_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/sales-pipeline-deal-desk/sales-pipeline/sales-pipeline-model.service.ts",
  ["buildSalesPipelineModel"],
);
assertIncludes(
  "src/features/sales-pipeline-deal-desk/sales-pipeline/sales-pipeline-model.policy.ts",
  ["salesPipelineReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_SALES_PIPELINE_MODEL_RUNBOOK.md", ["34-A"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["34-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-sales-pipeline-deal-desk-phase34a")) {
  throw new Error("missing verify script 34a");
}

execSync(
  "npm run test -- src/features/sales-pipeline-deal-desk/sales-pipeline/sales-pipeline-model.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-sales-pipeline-deal-desk-phase34a PASS");
