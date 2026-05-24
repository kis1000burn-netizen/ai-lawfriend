import { execSync } from "node:child_process";
import { runProductionGoNoGoLaunchRcBlock } from "./lib/run-production-go-no-go-launch-rc-block.mjs";

const root = process.cwd();

runProductionGoNoGoLaunchRcBlock(
  execSync,
  root,
  "verify:aibeopchin-production-go-no-go-launch-rc",
);

console.log(
  "verify:aibeopchin-production-go-no-go-launch-rc PASS (Phase 16-D Go/No-Go & Launch Record RC; fill launch record at deploy approval time)",
);
