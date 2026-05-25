import fs from "node:fs";
import path from "node:path";

export function createLegalOutcomeAssessmentRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Judgment-Grounded Outcome Assessment RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40A-JUDGMENT-CORPUS",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40B-JUDGMENT-LINKING",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40C-JUDGMENT-MAPPING",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40D-SIMILARITY-DISTINCTION",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40E-LAWYER-REVIEW-WORKSPACE",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-outcome-assessment-phase40a",
  "verify:aibeopchin-legal-outcome-assessment-phase40b",
  "verify:aibeopchin-legal-outcome-assessment-phase40c",
  "verify:aibeopchin-legal-outcome-assessment-phase40d",
  "verify:aibeopchin-legal-outcome-assessment-phase40e",
];

export function runLegalOutcomeAssessmentRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-outcome-assessment-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createLegalOutcomeAssessmentRcFsHelpers(root);

  assertFileExists("src/features/legal-outcome-assessment/legal-outcome-assessment-rc-lock.ts");
  assertFileExists(
    "src/features/legal-outcome-assessment/legal-outcome-assessment-rc-lock.test.ts",
  );
  assertFileExists(
    "docs/platform/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md",
  );
  assertFileExists("docs/operations/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_RUNBOOK.md");
  assertFileExists("src/features/legal-outcome-assessment/shared/judgment-grounded-types.schema.ts");

  assertIncludes("src/features/legal-outcome-assessment/legal-outcome-assessment-rc-lock.ts", [
    "LEGAL_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE40F",
    "verify:aibeopchin-legal-outcome-assessment-rc",
    "LEGAL_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK",
    "phase40a-judgment-corpus-source-registry-gate",
    "phase40-judgment-grounded-outcome-assessment-boundary",
    "NO_JUDGMENTLESS_LEGAL_ASSESSMENT",
    "NO_UNCITED_PRECEDENT_CLAIM",
    "NO_CLIENT_VISIBLE_JUDGMENT_PREDICTION",
    "LAWYER_REVIEW_REQUIRED",
    "OFFICIAL_OR_LICENSED_SOURCE_REQUIRED",
  ]);

  assertIncludes(
    "docs/platform/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md",
    [
      "40-A",
      "40-F",
      "verify:aibeopchin-legal-outcome-assessment-rc",
      "39-F",
      "no judgmentless legal assessment",
      "lawyer review required",
    ],
  );

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md",
    "Product 40-F",
  ]);

  assertIncludes(
    "src/features/legal-outcome-assessment/judgment-corpus/judgment-corpus-source-registry.service.ts",
    ["buildJudgmentCorpusSourceRegistry"],
  );
  assertIncludes(
    "src/features/legal-outcome-assessment/judgment-linking/judgment-reference-linking-engine.service.ts",
    ["buildJudgmentReferenceLinkingEngine"],
  );
  assertIncludes(
    "src/features/legal-outcome-assessment/judgment-mapping/issue-burden-evidence-judgment-mapping.service.ts",
    ["buildIssueBurdenEvidenceJudgmentMapping"],
  );
  assertIncludes(
    "src/features/legal-outcome-assessment/similarity-distinction/similarity-distinction-analysis.service.ts",
    ["buildSimilarityDistinctionAnalysis"],
  );
  assertIncludes(
    "src/features/legal-outcome-assessment/lawyer-review-workspace/lawyer-judgment-review-workspace.service.ts",
    ["buildLawyerJudgmentReviewWorkspace"],
  );

  assertIncludes("src/features/legal-outcome-assessment/shared/judgment-grounded-types.schema.ts", [
    "judgmentReferenceSchema",
    "outcomeAssessmentSectionSchema",
    "noJudgmentFallbackAllowed",
    "criminalSentencingExtension",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md", [
    "Judgment-Grounded",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md", [
    "Sentencing Outcome Assessment",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-outcome-assessment-rc")) {
    throw new Error("package.json must define verify:aibeopchin-legal-outcome-assessment-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["40-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] legal-outcome-assessment-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/legal-outcome-assessment/legal-outcome-assessment-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
