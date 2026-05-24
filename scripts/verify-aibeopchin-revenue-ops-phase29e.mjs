import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29E-EXECUTIVE-PARTNER-SUCCESS-REPORT";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/revenue-ops/executive-report/executive-partner-report.service.ts",
  "docs/operations/AIBEOPCHIN_EXECUTIVE_PARTNER_SUCCESS_REPORT_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes("src/features/revenue-ops/executive-report/executive-partner-report.service.ts", [
  "buildExecutivePartnerSuccessReport",
]);
assertIncludes("src/features/revenue-ops/executive-report/executive-partner-report.policy.ts", [
  "executiveReportReady",
]);
assertIncludes("docs/operations/AIBEOPCHIN_EXECUTIVE_PARTNER_SUCCESS_REPORT_RUNBOOK.md", ["29-E"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["29-E"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-revenue-ops-phase29e")) {
  throw new Error("missing verify script 29e");
}

execSync(
  "npm run test -- src/features/revenue-ops/executive-report/executive-partner-report.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-revenue-ops-phase29e PASS");
