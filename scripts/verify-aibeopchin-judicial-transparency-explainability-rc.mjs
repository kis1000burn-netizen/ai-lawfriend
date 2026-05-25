import { execSync } from "node:child_process";
import { runJudicialTransparencyExplainabilityRcBlock } from "./lib/run-judicial-transparency-explainability-rc-block.mjs";

runJudicialTransparencyExplainabilityRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-judicial-transparency-explainability-rc PASS (Product Phase 45-F Judicial Transparency / Explainability RC — 45-A~E bundled)",
);
