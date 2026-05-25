import { execSync } from "node:child_process";
import { runLegalReliabilityStagingEvidenceLockBlock } from "./lib/run-legal-reliability-staging-evidence-lock-block.mjs";

const root = process.cwd();
runLegalReliabilityStagingEvidenceLockBlock(execSync, root);
console.log(
  "verify:aibeopchin-legal-reliability-staging-evidence-lock PASS (Product Phase 52 staging go-live evidence lock)",
);
