import { execSync } from "node:child_process";
import { runLegalReliabilityActionLoopRcBlock } from "./lib/run-legal-reliability-action-loop-rc-block.mjs";

const root = process.cwd();
runLegalReliabilityActionLoopRcBlock(execSync, root);
console.log("verify:aibeopchin-legal-reliability-action-loop-rc PASS (Product Phase 49-C Legal Reliability Action Loop RC)");
