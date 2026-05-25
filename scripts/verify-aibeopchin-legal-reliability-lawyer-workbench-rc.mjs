import { execSync } from "node:child_process";
import { runLegalReliabilityLawyerWorkbenchRcBlock } from "./lib/run-legal-reliability-lawyer-workbench-rc-block.mjs";

const root = process.cwd();
runLegalReliabilityLawyerWorkbenchRcBlock(execSync, root);
console.log("verify:aibeopchin-legal-reliability-lawyer-workbench-rc PASS (Product Phase 48-F Legal Reliability Lawyer Workbench UX RC)");
