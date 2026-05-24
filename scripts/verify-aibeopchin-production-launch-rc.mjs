import { execSync } from "node:child_process";
import { runProductionLaunchRcBlock } from "./lib/run-production-launch-rc-block.mjs";

runProductionLaunchRcBlock(execSync, process.cwd());

console.log(
  "verify:aibeopchin-production-launch-rc PASS (Product Phase 25-F Production Launch RC — 25-A~E bundled)",
);
