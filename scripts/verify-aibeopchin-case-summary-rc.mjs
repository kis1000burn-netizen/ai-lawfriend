import { execSync } from "node:child_process";
import { runCaseSummaryRcBlock } from "./lib/run-case-summary-rc-block.mjs";

const root = process.cwd();

runCaseSummaryRcBlock(execSync, root, "verify:aibeopchin-case-summary-rc");

console.log(
  "verify:aibeopchin-case-summary-rc PASS (Phase 9-C Case Summary RC / Predeploy Closure; Tier 2 standalone)",
);
