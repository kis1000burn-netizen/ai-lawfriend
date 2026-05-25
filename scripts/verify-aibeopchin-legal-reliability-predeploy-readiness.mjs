import { execSync } from "node:child_process";
import { runLegalReliabilityPredeployReadinessBlock } from "./lib/run-legal-reliability-predeploy-readiness-block.mjs";

const root = process.cwd();
runLegalReliabilityPredeployReadinessBlock(execSync, root);
console.log(
  "verify:aibeopchin-legal-reliability-predeploy-readiness PASS (Product Phase 51-C Predeploy Gate Integration)",
);
