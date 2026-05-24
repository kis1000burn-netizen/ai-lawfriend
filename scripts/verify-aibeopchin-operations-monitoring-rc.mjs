import { execSync } from "node:child_process";
import { runOperationsMonitoringRcBlock } from "./lib/run-operations-monitoring-rc-block.mjs";

const root = process.cwd();

runOperationsMonitoringRcBlock(execSync, root, "verify:aibeopchin-operations-monitoring-rc");

console.log(
  "verify:aibeopchin-operations-monitoring-rc PASS (Phase 17 Operations Monitoring RC; live via ops:post-deploy-monitoring-live-check)",
);
