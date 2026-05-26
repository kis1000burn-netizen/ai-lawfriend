import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-POST-DEPLOY-PROMO-WINDOW";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

for (const file of [
  "src/lib/commercial/post-deploy-promo-window.policy.ts",
  "src/lib/commercial/post-deploy-promo-window.test.ts",
]) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing ${file}`);
  }
}

for (const term of [
  "applyPostDeployPromoEntitlementOverride",
  "resolveLawyerVerificationApprovedForAuth",
  "isAccountStatusLoginAllowed",
]) {
  if (!read("src/lib/commercial/post-deploy-promo-window.policy.ts").includes(term)) {
    throw new Error(`Missing ${term} in promo policy`);
  }
}

if (!read("src/features/platform/tenant-entitlement/tenant-entitlement.service.ts").includes("applyPostDeployPromoEntitlementOverride")) {
  throw new Error("tenant entitlement service must apply promo override");
}

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}

if (!read("package.json").includes("verify:aibeopchin-post-deploy-promo-window")) {
  throw new Error("missing verify script");
}

execSync(
  "npm run test -- src/lib/commercial/post-deploy-promo-window.test.ts src/lib/lawyer/lawyer-verification-access.test.ts src/lib/auth/post-auth-redirect.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("verify:aibeopchin-post-deploy-promo-window PASS");
