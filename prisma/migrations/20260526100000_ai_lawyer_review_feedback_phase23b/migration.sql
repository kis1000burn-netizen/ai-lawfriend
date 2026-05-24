-- Product Phase 23-B — Lawyer Review Feedback Loop

CREATE TYPE "AiLawyerReviewFeedbackRating" AS ENUM (
  'ACCEPT',
  'MINOR_EDIT',
  'MAJOR_EDIT',
  'REJECT'
);

CREATE TABLE "AiLawyerReviewFeedback" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "lawyerUserId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "evaluationCode" TEXT,
    "aiOutputHash" TEXT NOT NULL,
    "rating" "AiLawyerReviewFeedbackRating" NOT NULL,
    "feedbackNotes" TEXT,
    "correctionHints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLawyerReviewFeedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiLawyerReviewFeedback_caseId_feature_createdAt_idx" ON "AiLawyerReviewFeedback"("caseId", "feature", "createdAt");
CREATE INDEX "AiLawyerReviewFeedback_lawyerUserId_createdAt_idx" ON "AiLawyerReviewFeedback"("lawyerUserId", "createdAt");
CREATE INDEX "AiLawyerReviewFeedback_evaluationCode_idx" ON "AiLawyerReviewFeedback"("evaluationCode");

ALTER TABLE "AiLawyerReviewFeedback" ADD CONSTRAINT "AiLawyerReviewFeedback_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiLawyerReviewFeedback" ADD CONSTRAINT "AiLawyerReviewFeedback_lawyerUserId_fkey" FOREIGN KEY ("lawyerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
