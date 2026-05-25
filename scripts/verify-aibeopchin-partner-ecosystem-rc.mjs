import { execSync } from "node:child_process";
import { runPartnerEcosystemRcBlock } from "./lib/run-partner-ecosystem-rc-block.mjs";

runPartnerEcosystemRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-partner-ecosystem-rc PASS (Product Phase 31-F Partner Ecosystem RC — 31-A~E bundled)",
);
