import { execSync } from "node:child_process";
import { runSentencingOutcomeAssessmentRcBlock } from "./lib/run-sentencing-outcome-assessment-rc-block.mjs";

runSentencingOutcomeAssessmentRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-sentencing-outcome-assessment-rc PASS (Product Phase 41-F Sentencing Outcome Assessment RC — 41-A~E bundled)",
);
