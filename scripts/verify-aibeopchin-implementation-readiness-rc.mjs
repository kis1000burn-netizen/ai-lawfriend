import { execSync } from "node:child_process";
import { runImplementationReadinessRcBlock } from "./lib/run-implementation-readiness-rc-block.mjs";

runImplementationReadinessRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-implementation-readiness-rc PASS (Product Phase 36-F Implementation Readiness RC — 36-A~E bundled)",
);
