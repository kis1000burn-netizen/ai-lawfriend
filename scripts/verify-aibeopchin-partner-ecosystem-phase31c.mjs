import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31C-EXPERT-NETWORK-ROUTING";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/partner-ecosystem/expert-network-routing/expert-network-case-routing.service.ts",
  "docs/operations/AIBEOPCHIN_EXPERT_NETWORK_CASE_ROUTING_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/partner-ecosystem/expert-network-routing/expert-network-case-routing.service.ts",
  ["buildExpertNetworkCaseRouting"],
);
assertIncludes(
  "src/features/partner-ecosystem/expert-network-routing/expert-network-case-routing.policy.ts",
  ["caseRoutingReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_EXPERT_NETWORK_CASE_ROUTING_RUNBOOK.md", ["31-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["31-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-partner-ecosystem-phase31c")) {
  throw new Error("missing verify script 31c");
}

execSync(
  "npm run test -- src/features/partner-ecosystem/expert-network-routing/expert-network-case-routing.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-partner-ecosystem-phase31c PASS");
