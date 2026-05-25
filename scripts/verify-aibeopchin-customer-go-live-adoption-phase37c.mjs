import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37C-ADMIN-LAWYER-ACTIVATION";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/customer-go-live-adoption/activation-review/admin-lawyer-activation-review.service.ts",
  "docs/operations/AIBEOPCHIN_ADMIN_LAWYER_ACTIVATION_REVIEW_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/customer-go-live-adoption/activation-review/admin-lawyer-activation-review.service.ts",
  ["buildAdminLawyerActivationReview"],
);
assertIncludes(
  "src/features/customer-go-live-adoption/activation-review/admin-lawyer-activation-review.policy.ts",
  ["adminLawyerActivationReviewReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_ADMIN_LAWYER_ACTIVATION_REVIEW_RUNBOOK.md", ["37-C"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["37-C"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-customer-go-live-adoption-phase37c")) {
  throw new Error("missing verify script 37c");
}

execSync(
  "npm run test -- src/features/customer-go-live-adoption/activation-review/admin-lawyer-activation-review.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-customer-go-live-adoption-phase37c PASS");
