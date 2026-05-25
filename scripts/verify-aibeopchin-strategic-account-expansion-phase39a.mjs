import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39A-STRATEGIC-ACCOUNT-PLAN";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/strategic-account-expansion/account-plan/strategic-account-plan.service.ts",
  "docs/operations/AIBEOPCHIN_STRATEGIC_ACCOUNT_PLAN_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/strategic-account-expansion/account-plan/strategic-account-plan.service.ts",
  ["buildStrategicAccountPlan"],
);
assertIncludes(
  "src/features/strategic-account-expansion/account-plan/strategic-account-plan.policy.ts",
  ["strategicAccountPlanReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_STRATEGIC_ACCOUNT_PLAN_RUNBOOK.md", ["39-A"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["39-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-strategic-account-expansion-phase39a")) {
  throw new Error("missing verify script 39a");
}

execSync(
  "npm run test -- src/features/strategic-account-expansion/account-plan/strategic-account-plan.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-strategic-account-expansion-phase39a PASS");
