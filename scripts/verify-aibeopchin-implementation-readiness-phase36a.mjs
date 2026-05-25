import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36A-IMPLEMENTATION-PROJECT-PLAN";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/implementation-readiness/project-plan/implementation-project-plan.service.ts",
  "docs/operations/AIBEOPCHIN_IMPLEMENTATION_PROJECT_PLAN_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/implementation-readiness/project-plan/implementation-project-plan.service.ts",
  ["buildImplementationProjectPlan"],
);
assertIncludes(
  "src/features/implementation-readiness/project-plan/implementation-project-plan.policy.ts",
  ["implementationProjectPlanReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_IMPLEMENTATION_PROJECT_PLAN_RUNBOOK.md", ["36-A"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["36-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-implementation-readiness-phase36a")) {
  throw new Error("missing verify script 36a");
}

execSync(
  "npm run test -- src/features/implementation-readiness/project-plan/implementation-project-plan.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-implementation-readiness-phase36a PASS");
