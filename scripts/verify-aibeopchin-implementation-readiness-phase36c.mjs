import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36C-ADMIN-LAWYER-TRAINING";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/implementation-readiness/training-schedule/admin-lawyer-training-schedule.service.ts",
  "docs/operations/AIBEOPCHIN_ADMIN_LAWYER_TRAINING_SCHEDULE_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/implementation-readiness/training-schedule/admin-lawyer-training-schedule.service.ts",
  ["buildAdminLawyerTrainingSchedule"],
);
assertIncludes(
  "src/features/implementation-readiness/training-schedule/admin-lawyer-training-schedule.policy.ts",
  ["adminLawyerTrainingReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_ADMIN_LAWYER_TRAINING_SCHEDULE_RUNBOOK.md", ["36-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["36-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-implementation-readiness-phase36c")) {
  throw new Error("missing verify script 36c");
}

execSync(
  "npm run test -- src/features/implementation-readiness/training-schedule/admin-lawyer-training-schedule.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-implementation-readiness-phase36c PASS");
