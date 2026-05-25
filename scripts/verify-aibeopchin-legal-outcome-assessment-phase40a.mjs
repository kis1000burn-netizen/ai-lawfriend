import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40A-JUDGMENT-CORPUS";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/legal-outcome-assessment/judgment-corpus/judgment-corpus-source-registry.service.ts",
  "docs/operations/AIBEOPCHIN_JUDGMENT_CORPUS_SOURCE_REGISTRY_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/legal-outcome-assessment/judgment-corpus/judgment-corpus-source-registry.service.ts",
  ["buildJudgmentCorpusSourceRegistry"],
);
assertIncludes(
  "src/features/legal-outcome-assessment/judgment-corpus/judgment-corpus-source-registry.policy.ts",
  ["judgmentCorpusSourceRegistryReady", "OFFICIAL_OR_LICENSED_SOURCE_REQUIRED"],
);
assertIncludes("docs/operations/AIBEOPCHIN_JUDGMENT_CORPUS_SOURCE_REGISTRY_RUNBOOK.md", ["40-A"]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["40-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-legal-outcome-assessment-phase40a")) {
  throw new Error("missing verify script 40a");
}

execSync(
  "npm run test -- src/features/legal-outcome-assessment/judgment-corpus/judgment-corpus-source-registry.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-legal-outcome-assessment-phase40a PASS");
