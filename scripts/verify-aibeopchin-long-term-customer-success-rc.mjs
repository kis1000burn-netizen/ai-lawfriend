import { execSync } from "node:child_process";
import { runLongTermCustomerSuccessRcBlock } from "./lib/run-long-term-customer-success-rc-block.mjs";

runLongTermCustomerSuccessRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-long-term-customer-success-rc PASS (Product Phase 38-F Long-term Customer Success RC — 38-A~E bundled)",
);
