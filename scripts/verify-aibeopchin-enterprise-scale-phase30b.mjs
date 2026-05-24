import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30B-MULTI-TENANT-GOVERNANCE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/enterprise-scale/multi-tenant-governance/multi-tenant-governance.service.ts",
  "docs/operations/AIBEOPCHIN_MULTI_TENANT_GOVERNANCE_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/enterprise-scale/multi-tenant-governance/multi-tenant-governance.service.ts",
  ["buildMultiTenantGovernanceRoleDelegation"],
);
assertIncludes(
  "src/features/enterprise-scale/multi-tenant-governance/multi-tenant-governance.policy.ts",
  ["governanceDelegationReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_MULTI_TENANT_GOVERNANCE_RUNBOOK.md", ["30-B"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["30-B"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-enterprise-scale-phase30b")) {
  throw new Error("missing verify script 30b");
}

execSync(
  "npm run test -- src/features/enterprise-scale/multi-tenant-governance/multi-tenant-governance.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-enterprise-scale-phase30b PASS");
