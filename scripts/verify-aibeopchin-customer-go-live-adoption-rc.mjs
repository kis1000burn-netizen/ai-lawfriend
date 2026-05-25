import { execSync } from "node:child_process";
import { runCustomerGoLiveAdoptionRcBlock } from "./lib/run-customer-go-live-adoption-rc-block.mjs";

runCustomerGoLiveAdoptionRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-customer-go-live-adoption-rc PASS (Product Phase 37-F Customer Go-Live / Adoption RC — 37-A~E bundled)",
);
