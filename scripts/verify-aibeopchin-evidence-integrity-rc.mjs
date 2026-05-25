import { execSync } from "node:child_process";
import { runEvidenceIntegrityRcBlock } from "./lib/run-evidence-integrity-rc-block.mjs";

runEvidenceIntegrityRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-evidence-integrity-rc PASS (Product Phase 42-F Evidence Integrity RC — 42-A~E bundled)",
);
