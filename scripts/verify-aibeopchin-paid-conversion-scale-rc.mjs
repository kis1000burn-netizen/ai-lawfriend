import { execSync } from "node:child_process";
import { runPaidConversionScaleRcBlock } from "./lib/run-paid-conversion-scale-rc-block.mjs";

runPaidConversionScaleRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-paid-conversion-scale-rc PASS (Product Phase 28-F Paid Conversion / Scale RC — 28-A~E bundled)",
);
