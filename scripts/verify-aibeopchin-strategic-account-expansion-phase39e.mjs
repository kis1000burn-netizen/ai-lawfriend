import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39E-EXPANSION-RISK-GOVERNANCE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/strategic-account-expansion/expansion-governance/expansion-risk-governance-review.service.ts",
  "docs/operations/AIBEOPCHIN_EXPANSION_RISK_GOVERNANCE_REVIEW_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/strategic-account-expansion/expansion-governance/expansion-risk-governance-review.service.ts",
  ["buildExpansionRiskGovernanceReview"],
);
assertIncludes(
  "src/features/strategic-account-expansion/expansion-governance/expansion-risk-governance-review.policy.ts",
  ["expansionRiskGovernanceReviewReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_EXPANSION_RISK_GOVERNANCE_REVIEW_RUNBOOK.md", ["39-E"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["39-E"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-strategic-account-expansion-phase39e")) {
  throw new Error("missing verify script 39e");
}

execSync(
  "npm run test -- src/features/strategic-account-expansion/expansion-governance/expansion-risk-governance-review.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-strategic-account-expansion-phase39e PASS");
