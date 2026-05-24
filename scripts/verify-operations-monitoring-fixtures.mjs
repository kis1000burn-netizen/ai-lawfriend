import { validateAllOperationsMonitoringFixtures } from "./lib/operations-monitoring-fixture-policy.mjs";

const { passed, errors } = validateAllOperationsMonitoringFixtures();

if (!passed) {
  for (const err of errors) console.error(`FAIL — ${err}`);
  process.exit(1);
}

console.log("verify:operations-monitoring-fixtures PASS (Phase 17-F triage fixtures)");
