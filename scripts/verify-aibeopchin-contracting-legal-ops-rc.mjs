import { execSync } from "node:child_process";
import { runContractingLegalOpsRcBlock } from "./lib/run-contracting-legal-ops-rc-block.mjs";

runContractingLegalOpsRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-contracting-legal-ops-rc PASS (Product Phase 35-F Contracting / Legal Ops RC — 35-A~E bundled)",
);
