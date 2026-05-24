import { execSync } from "node:child_process";
import { runEnterpriseScaleRcBlock } from "./lib/run-enterprise-scale-rc-block.mjs";

runEnterpriseScaleRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-enterprise-scale-rc PASS (Product Phase 30-F Enterprise Scale RC — 30-A~E bundled)",
);
