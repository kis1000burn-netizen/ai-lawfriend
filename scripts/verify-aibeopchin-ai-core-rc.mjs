import { execSync } from "node:child_process";
import { runAiGovernanceRcBlock } from "./lib/run-ai-governance-rc-block.mjs";
import { runCaseSummaryRcBlock } from "./lib/run-case-summary-rc-block.mjs";
import { runClientDisclosureRcBlock } from "./lib/run-client-disclosure-rc-block.mjs";
import { runDocumentAiCoreRcBlock } from "./lib/run-document-ai-core-rc-block.mjs";
import { runFullAiCoreRcBlock } from "./lib/run-full-ai-core-rc-block.mjs";

const root = process.cwd();

runDocumentAiCoreRcBlock(execSync, root);
runCaseSummaryRcBlock(execSync, root);
runAiGovernanceRcBlock(execSync, root, "verify:aibeopchin-ai-core-rc");
runClientDisclosureRcBlock(execSync, root, "verify:aibeopchin-ai-core-rc");
runFullAiCoreRcBlock(execSync, root, "verify:aibeopchin-ai-core-rc");

console.log(
  "verify:aibeopchin-ai-core-rc PASS (Tier1 Document 8-E + Tier2 Case Summary 9-C + Tier3 Governance 10-D + Tier4 Client Disclosure 11-D + Master Full 12-A; no script circular calls)",
);
