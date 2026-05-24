/**
 * Phase 17-F — Live Ops Smoke Expansion (monitoring snapshot · ADMIN auth · dashboard render).
 */
import { runOperationsMonitoringLiveSmoke } from "./lib/ops-monitoring-live-smoke.mjs";

async function main() {
  const { failures } = await runOperationsMonitoringLiveSmoke({
    label: "ops:operations-monitoring-live-smoke",
    requireAdmin: true,
  });

  if (failures.length > 0) {
    console.error(
      `\nops:operations-monitoring-live-smoke FAIL (${failures.length} check(s): ${failures.join(", ")})`,
    );
    process.exit(1);
  }

  console.log(
    "\nops:operations-monitoring-live-smoke PASS (Phase 17-F — health · ADMIN auth regression · snapshot shape · dashboard render)",
  );
  console.log(
    "Fixtures (static triage samples): data/operations/fixtures/operations-monitoring-*.fixture.json",
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
