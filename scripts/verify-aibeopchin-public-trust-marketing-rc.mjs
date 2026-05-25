import { execSync } from "node:child_process";
import { runPublicTrustMarketingRcBlock } from "./lib/run-public-trust-marketing-rc-block.mjs";

runPublicTrustMarketingRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-public-trust-marketing-rc PASS (Product Phase 33-F Public Trust / Marketing Launch RC — 33-A~E bundled)",
);
