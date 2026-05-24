import { execSync } from "node:child_process";
import { runClientCollaborationPortalFullRcBlock } from "./lib/run-client-collaboration-portal-full-rc-block.mjs";

const root = process.cwd();

runClientCollaborationPortalFullRcBlock(
  execSync,
  root,
  "verify:aibeopchin-client-collaboration-portal-full-rc",
);

console.log(
  "verify:aibeopchin-client-collaboration-portal-full-rc PASS (Phase 15-G Collaboration Portal Full RC / Predeploy Closure; 15-A〜15-F sealed)",
);
