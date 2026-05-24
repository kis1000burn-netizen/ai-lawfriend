import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26C-LEGAL-TERMS-PRIVACY-FINAL-REVIEW";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/pilot-launch/legal-terms-privacy-final-review.service.ts",
  "docs/operations/AIBEOPCHIN_LEGAL_TERMS_PRIVACY_FINAL_REVIEW_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/pilot-launch/legal-terms-privacy-final-review.service.ts", [
  "buildLegalTermsPrivacyFinalReview",
]);
assertIncludes("src/features/pilot-launch/legal-terms-privacy-final-review.policy.ts", [
  "legalReviewComplete",
]);
assertIncludes("docs/operations/AIBEOPCHIN_LEGAL_TERMS_PRIVACY_FINAL_REVIEW_RUNBOOK.md", ["26-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["26-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-pilot-launch-phase26c")) {
  throw new Error("missing verify script 26c");
}

execSync("npm run test -- src/features/pilot-launch/legal-terms-privacy-final-review.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-pilot-launch-phase26c PASS");
