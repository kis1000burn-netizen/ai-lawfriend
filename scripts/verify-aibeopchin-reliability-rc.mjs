import { execSync } from "node:child_process";
import { runReliabilityRcBlock } from "./lib/run-reliability-rc-block.mjs";

const root = process.cwd();

runReliabilityRcBlock(execSync, root, "verify:aibeopchin-reliability-rc");

console.log(
  "verify:aibeopchin-reliability-rc PASS (Phase 18-E Reliability RC — 18-A~D bundled; live triage via Phase 17 ops:post-deploy-monitoring-live-check)",
);
