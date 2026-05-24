import { execSync } from "node:child_process";
import { runClientCollaborationPortalRcBlock } from "./lib/run-client-collaboration-portal-rc-block.mjs";

const root = process.cwd();

runClientCollaborationPortalRcBlock(
  execSync,
  root,
  "verify:aibeopchin-client-collaboration-portal-rc",
);

console.log(
  "verify:aibeopchin-client-collaboration-portal-rc PASS (Phase 15-D Collaboration Portal RC / Predeploy Closure; 15-A〜15-C.3 sealed)",
);
