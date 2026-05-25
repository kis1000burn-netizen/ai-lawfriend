import { execSync } from "node:child_process";
import { runNeutralLitigationReviewPackRcBlock } from "./lib/run-neutral-litigation-review-pack-rc-block.mjs";

runNeutralLitigationReviewPackRcBlock(execSync, process.cwd());
console.log(
  "verify:aibeopchin-neutral-litigation-review-pack-rc PASS (Product Phase 46-F Neutral Litigation Review Pack RC — 46-A~E bundled)",
);
