import { execSync } from "node:child_process";
import { runSalesPipelineDealDeskRcBlock } from "./lib/run-sales-pipeline-deal-desk-rc-block.mjs";

runSalesPipelineDealDeskRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-sales-pipeline-deal-desk-rc PASS (Product Phase 34-F Sales Pipeline / Deal Desk RC — 34-A~E bundled)",
);
