import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33C-WEBSITE-LANDING-MESSAGE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/public-trust-marketing/website-landing/website-landing-message.service.ts",
  "docs/operations/AIBEOPCHIN_WEBSITE_LANDING_MESSAGE_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/public-trust-marketing/website-landing/website-landing-message.service.ts",
  ["buildWebsiteLandingMessageRefresh"],
);
assertIncludes(
  "src/features/public-trust-marketing/website-landing/website-landing-message.policy.ts",
  ["landingMessageRefreshReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_WEBSITE_LANDING_MESSAGE_RUNBOOK.md", ["33-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["33-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-public-trust-marketing-phase33c")) {
  throw new Error("missing verify script 33c");
}

execSync(
  "npm run test -- src/features/public-trust-marketing/website-landing/website-landing-message.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-public-trust-marketing-phase33c PASS");
