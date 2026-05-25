import { execSync } from "node:child_process";
import { runLegalReliabilityStagingLiveValidationRcBlock } from "./lib/run-legal-reliability-staging-live-validation-rc-block.mjs";

const root = process.cwd();
runLegalReliabilityStagingLiveValidationRcBlock(execSync, root);
console.log(
  "verify:aibeopchin-legal-reliability-staging-live-validation-rc PASS (Product Phase 52-F Legal Reliability Staging Live Validation RC)",
);
