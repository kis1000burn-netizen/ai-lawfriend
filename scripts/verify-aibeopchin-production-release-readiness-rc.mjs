import { execSync } from "node:child_process";
import { runProductionReleaseReadinessRcBlock } from "./lib/run-production-release-readiness-rc-block.mjs";

const root = process.cwd();

runProductionReleaseReadinessRcBlock(
  execSync,
  root,
  "verify:aibeopchin-production-release-readiness-rc",
);

console.log(
  "verify:aibeopchin-production-release-readiness-rc PASS (Phase 16-C Production Release Readiness RC; static gates — live cutover via ops:production-release-cutover-live-check)",
);
