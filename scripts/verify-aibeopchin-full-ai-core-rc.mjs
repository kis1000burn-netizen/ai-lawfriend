import { execSync } from "node:child_process";

const root = process.cwd();

console.log("[verify:aibeopchin-full-ai-core-rc] running npm run verify:aibeopchin-ai-core-rc …");
execSync("npm run verify:aibeopchin-ai-core-rc", { stdio: "inherit", cwd: root });

console.log(
  "verify:aibeopchin-full-ai-core-rc PASS (Phase 12-A Full AI Core RC / Predeploy Master Closure; Tier 1〜4 + master block via ai-core-rc)",
);
