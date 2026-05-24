import { execSync } from "node:child_process";
import { runFullLegalOpsPlatformRcBlock } from "./lib/run-full-legal-ops-platform-rc-block.mjs";

const root = process.cwd();

runFullLegalOpsPlatformRcBlock(
  execSync,
  root,
  "verify:aibeopchin-full-legal-ops-platform-rc",
);

console.log(
  "verify:aibeopchin-full-legal-ops-platform-rc PASS (Phase 16-A Full Legal Ops Platform Predeploy RC; domain RC + platform gates + tsc/lint/test)",
);
