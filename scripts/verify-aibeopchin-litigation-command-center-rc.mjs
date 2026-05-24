import { execSync } from "node:child_process";
import { runLitigationCommandCenterRcBlock } from "./lib/run-litigation-command-center-rc-block.mjs";

const root = process.cwd();

runLitigationCommandCenterRcBlock(
  execSync,
  root,
  "verify:aibeopchin-litigation-command-center-rc",
);

console.log(
  "verify:aibeopchin-litigation-command-center-rc PASS (Phase 14-E Litigation Command Center RC / Predeploy Closure; 14-A〜14-D sealed)",
);
