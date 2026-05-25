import { execSync } from "node:child_process";
import { runCourtReadyCaseRecordPackRcBlock } from "./lib/run-court-ready-case-record-pack-rc-block.mjs";

runCourtReadyCaseRecordPackRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-court-ready-case-record-pack-rc PASS (Product Phase 44-F Court-Ready Case Record Pack RC — 44-A~E bundled)",
);
