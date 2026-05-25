import { execSync } from "node:child_process";
import { runLegalOutcomeAssessmentRcBlock } from "./lib/run-legal-outcome-assessment-rc-block.mjs";

runLegalOutcomeAssessmentRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-legal-outcome-assessment-rc PASS (Product Phase 40-F Judgment-Grounded Outcome Assessment RC — 40-A~E bundled)",
);
