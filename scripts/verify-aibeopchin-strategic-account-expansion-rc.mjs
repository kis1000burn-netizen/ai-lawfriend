import { execSync } from "node:child_process";
import { runStrategicAccountExpansionRcBlock } from "./lib/run-strategic-account-expansion-rc-block.mjs";

runStrategicAccountExpansionRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-strategic-account-expansion-rc PASS (Product Phase 39-F Strategic Account Expansion RC — 39-A~E bundled)",
);
