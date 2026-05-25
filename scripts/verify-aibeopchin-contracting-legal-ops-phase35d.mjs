import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35D-DPA-SECURITY-ADDENDUM";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/contracting-legal-ops/dpa-security/dpa-security-addendum.service.ts",
  "docs/operations/AIBEOPCHIN_DPA_SECURITY_ADDENDUM_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/contracting-legal-ops/dpa-security/dpa-security-addendum.service.ts",
  ["buildDpaSecurityAddendumPack"],
);
assertIncludes(
  "src/features/contracting-legal-ops/dpa-security/dpa-security-addendum.policy.ts",
  ["dpaSecurityAddendumReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_DPA_SECURITY_ADDENDUM_RUNBOOK.md", ["35-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["35-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-contracting-legal-ops-phase35d")) {
  throw new Error("missing verify script 35d");
}

execSync(
  "npm run test -- src/features/contracting-legal-ops/dpa-security/dpa-security-addendum.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-contracting-legal-ops-phase35d PASS");
