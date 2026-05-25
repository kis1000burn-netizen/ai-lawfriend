import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37A-GO-LIVE-EXECUTION-CHECKLIST";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/customer-go-live-adoption/go-live-execution/go-live-execution-checklist.service.ts",
  "docs/operations/AIBEOPCHIN_GO_LIVE_EXECUTION_CHECKLIST_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/customer-go-live-adoption/go-live-execution/go-live-execution-checklist.service.ts",
  ["buildGoLiveExecutionChecklist"],
);
assertIncludes(
  "src/features/customer-go-live-adoption/go-live-execution/go-live-execution-checklist.policy.ts",
  ["goLiveExecutionChecklistReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_GO_LIVE_EXECUTION_CHECKLIST_RUNBOOK.md", ["37-A"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["37-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-customer-go-live-adoption-phase37a")) {
  throw new Error("missing verify script 37a");
}

execSync(
  "npm run test -- src/features/customer-go-live-adoption/go-live-execution/go-live-execution-checklist.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-customer-go-live-adoption-phase37a PASS");
