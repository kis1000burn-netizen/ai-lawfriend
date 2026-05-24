import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29A-ACCOUNT-HEALTH-SCORE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/revenue-ops/account-health/account-health-score.service.ts",
  "docs/operations/AIBEOPCHIN_REVENUE_ACCOUNT_HEALTH_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/revenue-ops/account-health/account-health-score.service.ts", [
  "buildRevenueAccountHealthScore",
]);
assertIncludes("src/features/revenue-ops/account-health/account-health.policy.ts", [
  "accountHealthScore",
]);
assertIncludes("docs/operations/AIBEOPCHIN_REVENUE_ACCOUNT_HEALTH_RUNBOOK.md", [
  "29-A",
  "Revenue Account Health Score",
]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["29-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-revenue-ops-phase29a")) {
  throw new Error("missing verify script 29a");
}

execSync("npm run test -- src/features/revenue-ops/account-health/account-health.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-revenue-ops-phase29a PASS");
