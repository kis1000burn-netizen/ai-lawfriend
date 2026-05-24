import { execSync } from "node:child_process";
import { runRealMessagingRcBlock } from "./lib/run-real-messaging-rc-block.mjs";

const root = process.cwd();

runRealMessagingRcBlock(execSync, root, "verify:aibeopchin-real-messaging-rc");

console.log(
  "verify:aibeopchin-real-messaging-rc PASS (Product Phase 20-F Real Messaging RC — 20-A~E bundled; live send DRY_RUN default)",
);
