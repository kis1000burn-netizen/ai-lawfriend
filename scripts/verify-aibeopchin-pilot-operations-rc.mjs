import { execSync } from "node:child_process";
import { runPilotOperationsRcBlock } from "./lib/run-pilot-operations-rc-block.mjs";

runPilotOperationsRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-pilot-operations-rc PASS (Product Phase 27-F Pilot Operations RC — 27-A~E bundled)",
);
