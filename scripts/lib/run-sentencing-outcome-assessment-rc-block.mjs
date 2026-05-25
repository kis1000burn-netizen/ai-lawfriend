import fs from "node:fs";
import path from "node:path";

export function createSentencingOutcomeAssessmentRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Sentencing Outcome Assessment RC file: ${relativePath}`);
    }
  }
  function assertIncludes(relativePath, terms) {
    const content = readFile(relativePath);
    for (const term of terms) {
      if (!content.includes(term)) {
        throw new Error(`Missing term "${term}" in ${relativePath}`);
      }
    }
  }
  return { readFile, assertFileExists, assertIncludes };
}

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41A-SENTENCING-CORPUS",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41B-SENTENCING-FACTOR",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41C-SENTENCING-COMPARISON",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41D-SENTENCING-RISK-MATRIX",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41E-LAWYER-SENTENCING-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-sentencing-outcome-assessment-phase41a",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41b",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41c",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41d",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41e",
];

export function runSentencingOutcomeAssessmentRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-sentencing-outcome-assessment-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createSentencingOutcomeAssessmentRcFsHelpers(root);

  assertFileExists(
    "src/features/sentencing-outcome-assessment/sentencing-outcome-assessment-rc-lock.ts",
  );
  assertFileExists(
    "src/features/sentencing-outcome-assessment/sentencing-outcome-assessment-rc-lock.test.ts",
  );
  assertFileExists("docs/platform/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK.md");
  assertFileExists("src/features/sentencing-outcome-assessment/shared/sentencing-grounded-types.schema.ts");

  assertIncludes(
    "src/features/sentencing-outcome-assessment/sentencing-outcome-assessment-rc-lock.ts",
    [
      "SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE41F",
      "verify:aibeopchin-sentencing-outcome-assessment-rc",
      "SENTENCING_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK",
      "phase41a-criminal-judgment-sentencing-corpus-registry-gate",
      "phase41-sentencing-outcome-assessment-boundary",
      "NO_AUTOMATED_SENTENCING_PREDICTION",
      "NO_SENTENCE_GUARANTEE",
      "NO_CLIENT_VISIBLE_SENTENCING_PROBABILITY",
      "JUDGMENT_REFERENCES_REQUIRED",
      "SENTENCING_REASON_REQUIRED",
      "LAWYER_REVIEW_REQUIRED",
    ],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md", [
    "41-A",
    "41-F",
    "verify:aibeopchin-sentencing-outcome-assessment-rc",
    "40-F",
    "no automated sentencing prediction",
    "lawyer review required",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md",
    "Product 41-F",
  ]);

  assertIncludes(
    "src/features/sentencing-outcome-assessment/sentencing-corpus/criminal-judgment-sentencing-corpus-registry.service.ts",
    ["buildCriminalJudgmentSentencingCorpusRegistry"],
  );
  assertIncludes(
    "src/features/sentencing-outcome-assessment/sentencing-factor/sentencing-factor-extraction.service.ts",
    ["buildSentencingFactorExtraction"],
  );
  assertIncludes(
    "src/features/sentencing-outcome-assessment/sentencing-comparison/similar-sentencing-outcome-comparison.service.ts",
    ["buildSimilarSentencingOutcomeComparison"],
  );
  assertIncludes(
    "src/features/sentencing-outcome-assessment/sentencing-risk/sentencing-risk-mitigation-matrix.service.ts",
    ["buildSentencingRiskMitigationMatrix"],
  );
  assertIncludes(
    "src/features/sentencing-outcome-assessment/lawyer-sentencing-review/lawyer-sentencing-review-workspace.service.ts",
    ["buildLawyerSentencingReviewWorkspace"],
  );

  assertIncludes(
    "src/features/sentencing-outcome-assessment/shared/sentencing-grounded-types.schema.ts",
    ["sentencingOutcomeReferenceSchema", "sentencingAssessmentSectionSchema", "noOutcomeGuaranteeAllowed"],
  );

  assertIncludes(
    "docs/platform/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md",
    ["Sentencing Outcome Assessment"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md", [
    "Evidence Integrity",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-sentencing-outcome-assessment-rc")) {
    throw new Error("package.json must define verify:aibeopchin-sentencing-outcome-assessment-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["41-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] sentencing-outcome-assessment-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/sentencing-outcome-assessment/sentencing-outcome-assessment-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
