import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36D-GO-LIVE-SUCCESS-CRITERIA";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/implementation-readiness/go-live/go-live-success-criteria.service.ts",
  "docs/operations/AIBEOPCHIN_GO_LIVE_SUCCESS_CRITERIA_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/implementation-readiness/go-live/go-live-success-criteria.service.ts",
  ["buildGoLiveSuccessCriteria"],
);
assertIncludes(
  "src/features/implementation-readiness/go-live/go-live-success-criteria.policy.ts",
  ["goLiveSuccessCriteriaReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_GO_LIVE_SUCCESS_CRITERIA_RUNBOOK.md", ["36-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["36-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-implementation-readiness-phase36d")) {
  throw new Error("missing verify script 36d");
}

execSync(
  "npm run test -- src/features/implementation-readiness/go-live/go-live-success-criteria.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-implementation-readiness-phase36d PASS");
