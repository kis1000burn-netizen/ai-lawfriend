import { execSync } from "node:child_process";
import { runClientMobileRcBlock } from "./lib/run-client-mobile-rc-block.mjs";

const root = process.cwd();

runClientMobileRcBlock(execSync, root, "verify:aibeopchin-client-mobile-rc");

console.log(
  "verify:aibeopchin-client-mobile-rc PASS (Product Phase 21-F Client Mobile / PWA RC — 21-A~E bundled; push live send OFF default)",
);
