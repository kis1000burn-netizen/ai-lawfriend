import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27D-ISSUE-TRIAGE-HOTFIX-LOOP";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/pilot-operations/pilot-issue-triage-hotfix-loop.service.ts",
  "docs/operations/AIBEOPCHIN_PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/pilot-operations/pilot-issue-triage-hotfix-loop.service.ts", [
  "buildPilotIssueTriageHotfixLoop",
]);
assertIncludes("src/features/pilot-operations/pilot-issue-triage-hotfix-loop.policy.ts", [
  "hotfixLoopReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_RUNBOOK.md", ["27-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["27-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-pilot-operations-phase27d")) {
  throw new Error("missing verify script 27d");
}

execSync("npm run test -- src/features/pilot-operations/pilot-issue-triage-hotfix-loop.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-pilot-operations-phase27d PASS");
