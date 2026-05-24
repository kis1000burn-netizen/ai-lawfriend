import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25D-LIVE-PROVIDER-SMOKE-PLAN";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/production-launch/live-provider-smoke-plan.service.ts",
  "docs/operations/AIBEOPCHIN_LIVE_PROVIDER_SMOKE_PLAN_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/production-launch/live-provider-smoke-plan.service.ts", [
  "buildLiveProviderSmokePlan",
]);
assertIncludes("src/features/production-launch/live-provider-smoke-plan.policy.ts", [
  "liveProviderReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_LIVE_PROVIDER_SMOKE_PLAN_RUNBOOK.md", ["25-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["25-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-production-launch-phase25d")) {
  throw new Error("missing verify script 25d");
}

execSync("npm run test -- src/features/production-launch/live-provider-smoke-plan.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-production-launch-phase25d PASS");
