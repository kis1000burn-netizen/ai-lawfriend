import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30C-PARTNER-BRANCH-NETWORK";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/enterprise-scale/partner-branch-network/partner-branch-network.service.ts",
  "docs/operations/AIBEOPCHIN_PARTNER_BRANCH_NETWORK_OPERATIONS_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/enterprise-scale/partner-branch-network/partner-branch-network.service.ts",
  ["buildPartnerBranchNetworkOperations"],
);
assertIncludes(
  "src/features/enterprise-scale/partner-branch-network/partner-branch-network.policy.ts",
  ["branchNetworkOpsReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_PARTNER_BRANCH_NETWORK_OPERATIONS_RUNBOOK.md", ["30-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["30-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-enterprise-scale-phase30c")) {
  throw new Error("missing verify script 30c");
}

execSync(
  "npm run test -- src/features/enterprise-scale/partner-branch-network/partner-branch-network.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-enterprise-scale-phase30c PASS");
