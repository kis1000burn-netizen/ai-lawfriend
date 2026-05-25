import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38D-EXPANSION-UPSELL-PLAYBOOK";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/long-term-customer-success/expansion-upsell/expansion-upsell-playbook.service.ts",
  "docs/operations/AIBEOPCHIN_EXPANSION_UPSELL_PLAYBOOK_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/long-term-customer-success/expansion-upsell/expansion-upsell-playbook.service.ts",
  ["buildExpansionUpsellPlaybook"],
);
assertIncludes(
  "src/features/long-term-customer-success/expansion-upsell/expansion-upsell-playbook.policy.ts",
  ["expansionUpsellPlaybookReady"],
);
assertIncludes("docs/operations/AIBEOPCHIN_EXPANSION_UPSELL_PLAYBOOK_RUNBOOK.md", ["38-D"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["38-D"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-long-term-customer-success-phase38d")) {
  throw new Error("missing verify script 38d");
}

execSync(
  "npm run test -- src/features/long-term-customer-success/expansion-upsell/expansion-upsell-playbook.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-long-term-customer-success-phase38d PASS");
