import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37D-CLIENT-PORTAL-ADOPTION";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/customer-go-live-adoption/portal-adoption/client-portal-adoption-review.service.ts",
  "docs/operations/AIBEOPCHIN_CLIENT_PORTAL_ADOPTION_REVIEW_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/customer-go-live-adoption/portal-adoption/client-portal-adoption-review.service.ts",
  ["buildClientPortalAdoptionReview"],
);
assertIncludes(
  "src/features/customer-go-live-adoption/portal-adoption/client-portal-adoption-review.policy.ts",
  ["clientPortalAdoptionReviewReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_CLIENT_PORTAL_ADOPTION_REVIEW_RUNBOOK.md", ["37-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["37-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-customer-go-live-adoption-phase37d")) {
  throw new Error("missing verify script 37d");
}

execSync(
  "npm run test -- src/features/customer-go-live-adoption/portal-adoption/client-portal-adoption-review.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-customer-go-live-adoption-phase37d PASS");
