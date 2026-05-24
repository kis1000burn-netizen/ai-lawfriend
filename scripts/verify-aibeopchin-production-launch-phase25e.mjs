import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25E-COMMERCIAL-OPS-READINESS-REVIEW";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/production-launch/commercial-ops-readiness-review.service.ts",
  "docs/operations/AIBEOPCHIN_COMMERCIAL_OPS_READINESS_REVIEW_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/production-launch/commercial-ops-readiness-review.service.ts", [
  "buildCommercialOpsReadinessReview",
]);
assertIncludes("src/features/production-launch/commercial-ops-readiness-review.policy.ts", [
  "commercialReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_COMMERCIAL_OPS_READINESS_REVIEW_RUNBOOK.md", ["25-E"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["25-E"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-production-launch-phase25e")) {
  throw new Error("missing verify script 25e");
}

execSync("npm run test -- src/features/production-launch/commercial-ops-readiness-review.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-production-launch-phase25e PASS");
