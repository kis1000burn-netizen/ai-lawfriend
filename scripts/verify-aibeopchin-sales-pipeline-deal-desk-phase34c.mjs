import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34C-PROPOSAL-QUOTE-DESK";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/sales-pipeline-deal-desk/quote-desk/proposal-quote-desk.service.ts",
  "docs/operations/AIBEOPCHIN_PROPOSAL_QUOTE_DESK_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/sales-pipeline-deal-desk/quote-desk/proposal-quote-desk.service.ts",
  ["buildProposalQuoteDeskPolicy"],
);
assertIncludes(
  "src/features/sales-pipeline-deal-desk/quote-desk/proposal-quote-desk.policy.ts",
  ["quoteDeskPolicyReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_PROPOSAL_QUOTE_DESK_RUNBOOK.md", ["34-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["34-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-sales-pipeline-deal-desk-phase34c")) {
  throw new Error("missing verify script 34c");
}

execSync(
  "npm run test -- src/features/sales-pipeline-deal-desk/quote-desk/proposal-quote-desk.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-sales-pipeline-deal-desk-phase34c PASS");
