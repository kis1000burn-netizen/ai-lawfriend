import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29C-RENEWAL-CHURN-RISK-MONITOR";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/revenue-ops/renewal-churn-risk/renewal-churn-risk.service.ts",
  "docs/operations/AIBEOPCHIN_RENEWAL_CHURN_RISK_MONITOR_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/revenue-ops/renewal-churn-risk/renewal-churn-risk.service.ts", [
  "buildRenewalChurnRiskMonitor",
]);
assertIncludes("src/features/revenue-ops/renewal-churn-risk/renewal-churn-risk.policy.ts", [
  "churnMonitorReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_RENEWAL_CHURN_RISK_MONITOR_RUNBOOK.md", ["29-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["29-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-revenue-ops-phase29c")) {
  throw new Error("missing verify script 29c");
}

execSync("npm run test -- src/features/revenue-ops/renewal-churn-risk/renewal-churn-risk.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-revenue-ops-phase29c PASS");
