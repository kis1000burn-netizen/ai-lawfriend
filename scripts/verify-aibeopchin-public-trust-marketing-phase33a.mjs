import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33A-TRUST-CENTER-CONTENT";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/public-trust-marketing/trust-center/trust-center-content.service.ts",
  "docs/operations/AIBEOPCHIN_TRUST_CENTER_CONTENT_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/public-trust-marketing/trust-center/trust-center-content.service.ts",
  ["buildTrustCenterContentPack"],
);
assertIncludes(
  "src/features/public-trust-marketing/trust-center/trust-center-content.policy.ts",
  ["trustCenterContentReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_TRUST_CENTER_CONTENT_RUNBOOK.md", ["33-A"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["33-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-public-trust-marketing-phase33a")) {
  throw new Error("missing verify script 33a");
}

execSync(
  "npm run test -- src/features/public-trust-marketing/trust-center/trust-center-content.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-public-trust-marketing-phase33a PASS");
