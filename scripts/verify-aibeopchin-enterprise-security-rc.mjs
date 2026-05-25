import { execSync } from "node:child_process";
import { runEnterpriseSecurityComplianceRcBlock } from "./lib/run-enterprise-security-compliance-rc-block.mjs";

runEnterpriseSecurityComplianceRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-enterprise-security-rc PASS (Product Phase 32-F Enterprise Security / Compliance RC — 32-A~E bundled)",
);
