import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26A-STAGING-E2E-COMMERCIAL-SMOKE";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) throw new Error(`Missing term "${term}" in ${relativePath}`);
  }
}

for (const file of [
  "src/features/pilot-launch/staging-e2e-commercial-smoke.service.ts",
  "docs/operations/AIBEOPCHIN_STAGING_E2E_COMMERCIAL_SMOKE_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required Phase 26-A file: ${file}`);
}

assertIncludes("src/features/pilot-launch/staging-e2e-commercial-smoke.service.ts", [
  "buildStagingE2eCommercialSmoke",
]);
assertIncludes("src/features/pilot-launch/staging-e2e-commercial-smoke.policy.ts", [
  "stagingCommercialReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_STAGING_E2E_COMMERCIAL_SMOKE_RUNBOOK.md", [
  "26-A",
  "Staging End-to-End Commercial Smoke",
]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["26-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-pilot-launch-phase26a")) {
  throw new Error("package.json must define verify:aibeopchin-pilot-launch-phase26a");
}

execSync("npm run test -- src/features/pilot-launch/staging-e2e-commercial-smoke.test.ts", {
  stdio: "inherit",
  cwd: root,
});
console.log("verify:aibeopchin-pilot-launch-phase26a PASS (Product Phase 26-A)");
