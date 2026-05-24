import { execSync } from "node:child_process";
import { runLitigationOpsRcBlock } from "./lib/run-litigation-ops-rc-block.mjs";

const root = process.cwd();

runLitigationOpsRcBlock(execSync, root, "verify:aibeopchin-litigation-ops-rc");

console.log(
  "verify:aibeopchin-litigation-ops-rc PASS (Product Phase 24-F Litigation Operations RC — 24-A~E bundled)",
);
