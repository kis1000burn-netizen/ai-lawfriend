import { execSync } from "node:child_process";
import { runTenantRcBlock } from "./lib/run-tenant-rc-block.mjs";

const root = process.cwd();

runTenantRcBlock(execSync, root, "verify:aibeopchin-tenant-rc");

console.log(
  "verify:aibeopchin-tenant-rc PASS (Product Phase 22-F Tenant / Plan / Metering RC — 22-A~E bundled; no automatic invoice)",
);
