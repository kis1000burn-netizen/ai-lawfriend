import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "prisma/migrations/20260526100000_ai_lawyer_review_feedback_phase23b/migration.sql",
  "src/features/ai-quality/lawyer-review-feedback-loop.schema.ts",
  "src/features/ai-quality/lawyer-review-feedback-loop.policy.ts",
  "src/features/ai-quality/lawyer-review-feedback-loop.repository.ts",
  "src/features/ai-quality/lawyer-review-feedback-loop.service.ts",
  "src/features/ai-quality/lawyer-review-feedback-loop.test.ts",
  "docs/operations/AIBEOPCHIN_LAWYER_REVIEW_FEEDBACK_LOOP_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23B-LAWYER-REVIEW-FEEDBACK-LOOP";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required Phase 23-B file: ${file}`);
  }
}

assertIncludes("prisma/schema.prisma", [
  "model AiLawyerReviewFeedback",
  "enum AiLawyerReviewFeedbackRating",
]);

assertIncludes("src/features/ai-quality/lawyer-review-feedback-loop.service.ts", [
  "recordLawyerReviewFeedback",
  "getLawyerReviewFeedbackForCase",
  "AI_LAWYER_REVIEW_FEEDBACK_RECORDED",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_LAWYER_REVIEW_FEEDBACK_LOOP_RUNBOOK.md",
  ["23-B", "Lawyer Review Feedback Loop"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "23-B",
  "Lawyer Review Feedback Loop",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-ai-quality-phase23b")) {
  throw new Error("package.json must define verify:aibeopchin-ai-quality-phase23b");
}

execSync("npm run test -- src/features/ai-quality/lawyer-review-feedback-loop.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-ai-quality-phase23b PASS (Product Phase 23-B Lawyer Review Feedback Loop)",
);
