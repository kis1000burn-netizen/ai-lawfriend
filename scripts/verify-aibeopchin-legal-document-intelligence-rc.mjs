import { execSync } from "node:child_process";
import { runLegalDocumentIntelligenceRcBlock } from "./lib/run-legal-document-intelligence-rc-block.mjs";

const root = process.cwd();

runLegalDocumentIntelligenceRcBlock(
  execSync,
  root,
  "verify:aibeopchin-legal-document-intelligence-rc",
);

console.log(
  "verify:aibeopchin-legal-document-intelligence-rc PASS (Phase 13-I Legal Document Intelligence RC / Predeploy Closure; 13-A〜13-H pipeline sealed)",
);
