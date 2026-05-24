import { execSync } from "node:child_process";
import { runPilotLaunchRcBlock } from "./lib/run-pilot-launch-rc-block.mjs";

runPilotLaunchRcBlock(execSync, process.cwd());
console.log("verify:aibeopchin-pilot-launch-rc PASS (Product Phase 26-F Pilot Launch RC — 26-A~E bundled)");
