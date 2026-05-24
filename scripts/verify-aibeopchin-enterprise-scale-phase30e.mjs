import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30E-SCALE-MONITORING-CAPACITY";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/enterprise-scale/scale-monitoring/scale-monitoring-capacity-forecast.service.ts",
  "docs/operations/AIBEOPCHIN_SCALE_MONITORING_CAPACITY_FORECAST_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/enterprise-scale/scale-monitoring/scale-monitoring-capacity-forecast.service.ts",
  ["buildScaleMonitoringCapacityForecast"],
);
assertIncludes(
  "src/features/enterprise-scale/scale-monitoring/scale-monitoring-capacity-forecast.policy.ts",
  ["capacityForecastReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_SCALE_MONITORING_CAPACITY_FORECAST_RUNBOOK.md", [
  "30-E",
]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["30-E"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-enterprise-scale-phase30e")) {
  throw new Error("missing verify script 30e");
}

execSync(
  "npm run test -- src/features/enterprise-scale/scale-monitoring/scale-monitoring-capacity-forecast.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-enterprise-scale-phase30e PASS");
