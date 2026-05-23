import { execSync } from "node:child_process";
import { runAiGovernanceRcBlock } from "./lib/run-ai-governance-rc-block.mjs";

const root = process.cwd();

runAiGovernanceRcBlock(execSync, root, "verify:aibeopchin-ai-governance-rc");

console.log(
  "verify:aibeopchin-ai-governance-rc PASS (Phase 10-D AI Governance RC / Predeploy Closure; Tier 3 standalone)",
);
