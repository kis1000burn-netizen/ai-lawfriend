import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41A-SENTENCING-CORPUS";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [
  "src/features/sentencing-outcome-assessment/sentencing-corpus/criminal-judgment-sentencing-corpus-registry.service.ts",
  "docs/operations/AIBEOPCHIN_CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_RUNBOOK.md",
]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(
  "src/features/sentencing-outcome-assessment/sentencing-corpus/criminal-judgment-sentencing-corpus-registry.service.ts",
  ["buildCriminalJudgmentSentencingCorpusRegistry"],
);
assertIncludes(
  "src/features/sentencing-outcome-assessment/sentencing-corpus/criminal-judgment-sentencing-corpus-registry.policy.ts",
  ["criminalJudgmentSentencingCorpusRegistryReady", "JUDGMENT_REFERENCES_REQUIRED"],
);
assertIncludes("docs/operations/AIBEOPCHIN_CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_RUNBOOK.md", [
  "41-A",
]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["41-A"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-sentencing-outcome-assessment-phase41a")) {
  throw new Error("missing verify script 41a");
}

execSync(
  "npm run test -- src/features/sentencing-outcome-assessment/sentencing-corpus/criminal-judgment-sentencing-corpus-registry.test.ts",
  { stdio: "inherit", cwd: root },
);
console.log("verify:aibeopchin-sentencing-outcome-assessment-phase41a PASS");
