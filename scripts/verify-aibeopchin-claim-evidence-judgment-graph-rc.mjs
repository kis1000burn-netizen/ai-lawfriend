import { execSync } from "node:child_process";
import { runClaimEvidenceJudgmentGraphRcBlock } from "./lib/run-claim-evidence-judgment-graph-rc-block.mjs";

runClaimEvidenceJudgmentGraphRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-claim-evidence-judgment-graph-rc PASS (Product Phase 43-F Claim-Evidence-Judgment Graph RC — 43-A~E bundled)",
);
