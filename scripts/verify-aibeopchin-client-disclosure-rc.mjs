import { execSync } from "node:child_process";
import { runClientDisclosureRcBlock } from "./lib/run-client-disclosure-rc-block.mjs";

const root = process.cwd();

runClientDisclosureRcBlock(execSync, root, "verify:aibeopchin-client-disclosure-rc");

console.log(
  "verify:aibeopchin-client-disclosure-rc PASS (Phase 11-D Client Disclosure RC / Predeploy Closure; Tier 4 standalone)",
);
