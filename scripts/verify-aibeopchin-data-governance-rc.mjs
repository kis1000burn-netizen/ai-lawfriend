import { execSync } from "node:child_process";
import { runDataGovernanceRcBlock } from "./lib/run-data-governance-rc-block.mjs";

const root = process.cwd();

runDataGovernanceRcBlock(execSync, root, "verify:aibeopchin-data-governance-rc");

console.log(
  "verify:aibeopchin-data-governance-rc PASS (Phase 19-F Data Governance RC — 19-A~E bundled; purge dry-run default; limited execution gated)",
);
