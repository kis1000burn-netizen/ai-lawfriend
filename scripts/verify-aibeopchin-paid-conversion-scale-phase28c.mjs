import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28C-SLA-SUPPORT-TIER-POLICY";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/paid-conversion-scale/sla-support-tier-policy.service.ts",
  "docs/operations/AIBEOPCHIN_SLA_SUPPORT_TIER_POLICY_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/paid-conversion-scale/sla-support-tier-policy.service.ts", [
  "buildSlaSupportTierPolicy",
]);
assertIncludes("src/features/paid-conversion-scale/sla-support-tier-policy.policy.ts", [
  "slaPolicyReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_SLA_SUPPORT_TIER_POLICY_RUNBOOK.md", ["28-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["28-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-paid-conversion-scale-phase28c")) {
  throw new Error("missing verify script 28c");
}

execSync("npm run test -- src/features/paid-conversion-scale/sla-support-tier-policy.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-paid-conversion-scale-phase28c PASS");
