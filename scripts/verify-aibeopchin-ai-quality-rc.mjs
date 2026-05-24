import { execSync } from "node:child_process";
import { runAiQualityRcBlock } from "./lib/run-ai-quality-rc-block.mjs";

const root = process.cwd();

runAiQualityRcBlock(execSync, root, "verify:aibeopchin-ai-quality-rc");

console.log(
  "verify:aibeopchin-ai-quality-rc PASS (Product Phase 23-F AI Quality / Case Pack RC — 23-A~E bundled)",
);
