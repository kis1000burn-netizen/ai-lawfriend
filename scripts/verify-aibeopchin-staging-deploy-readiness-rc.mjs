import { execSync } from "node:child_process";
import { runStagingDeployReadinessRcBlock } from "./lib/run-staging-deploy-readiness-rc-block.mjs";

const root = process.cwd();

runStagingDeployReadinessRcBlock(
  execSync,
  root,
  "verify:aibeopchin-staging-deploy-readiness-rc",
);

console.log(
  "verify:aibeopchin-staging-deploy-readiness-rc PASS (Phase 16-B Staging Deploy Readiness RC; static gates — live smoke via ops:staging-deploy-readiness-live-check)",
);
