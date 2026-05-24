import { execSync } from "node:child_process";
import { runRevenueOpsRcBlock } from "./lib/run-revenue-ops-rc-block.mjs";

runRevenueOpsRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-revenue-ops-rc PASS (Product Phase 29-F Revenue Ops / Customer Success RC — 29-A~E bundled)",
);
