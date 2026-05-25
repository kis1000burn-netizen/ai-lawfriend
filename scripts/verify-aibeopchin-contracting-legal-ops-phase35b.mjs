import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35B-LEGAL-REVIEW-WORKFLOW";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/contracting-legal-ops/legal-review/legal-review-workflow.service.ts",
  "docs/operations/AIBEOPCHIN_LEGAL_REVIEW_WORKFLOW_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/contracting-legal-ops/legal-review/legal-review-workflow.service.ts",
  ["buildLegalReviewWorkflow"],
);
assertIncludes(
  "src/features/contracting-legal-ops/legal-review/legal-review-workflow.policy.ts",
  ["legalReviewWorkflowReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_LEGAL_REVIEW_WORKFLOW_RUNBOOK.md", ["35-B"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["35-B"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-contracting-legal-ops-phase35b")) {
  throw new Error("missing verify script 35b");
}

execSync(
  "npm run test -- src/features/contracting-legal-ops/legal-review/legal-review-workflow.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-contracting-legal-ops-phase35b PASS");
