import { execSync } from "node:child_process";
import { runLegalReliabilityRcBlock } from "./lib/run-legal-reliability-rc-block.mjs";

runLegalReliabilityRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-legal-reliability-rc PASS (Product Phase 47 Legal Reliability RC — 40~46 bundled seal)",
);
