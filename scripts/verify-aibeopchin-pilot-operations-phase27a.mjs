import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27A-USAGE-MONITORING";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/pilot-operations/pilot-usage-monitoring.service.ts",
  "docs/operations/AIBEOPCHIN_PILOT_USAGE_MONITORING_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/pilot-operations/pilot-usage-monitoring.service.ts", [
  "buildPilotUsageMonitoringSnapshot",
]);
assertIncludes("src/features/pilot-operations/pilot-usage-monitoring.policy.ts", [
  "pilotUsageMonitoringReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_PILOT_USAGE_MONITORING_RUNBOOK.md", [
  "27-A",
  "Pilot Usage Monitoring",
]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["27-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-pilot-operations-phase27a")) {
  throw new Error("missing verify script 27a");
}

execSync("npm run test -- src/features/pilot-operations/pilot-usage-monitoring.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-pilot-operations-phase27a PASS");
