/**
 * Phase 17 — Post-deploy monitoring live check (delegates to 17-F expanded smoke).
 */
import { runOperationsMonitoringLiveSmoke } from "./lib/ops-monitoring-live-smoke.mjs";

async function main() {
  const { failures, skippedAdmin } = await runOperationsMonitoringLiveSmoke({
    label: "ops:post-deploy-monitoring-live-check",
    requireAdmin: false,
  });

  if (failures.length > 0) {
    console.error(
      `\nops:post-deploy-monitoring-live-check FAIL (${failures.length} check(s))`,
    );
    process.exit(1);
  }

  console.log(
    `\nops:post-deploy-monitoring-live-check PASS (Phase 17 post-deploy${skippedAdmin ? " — health + ADMIN auth regression" : " — full live signals"})`,
  );
  console.log(
    "Next: triage via /admin/operations/monitoring — docs/operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md",
  );
  console.log(
    "Full 17-F smoke: npm run ops:operations-monitoring-live-smoke (requires OPS_SMOKE_ADMIN_*)",
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
