-- Phase 3-D: Gongbuho 활성 QuestionSet만 사건 인터뷰에 바인딩 (Case.questionSetId)
ALTER TABLE "Case" ADD COLUMN "questionSetId" TEXT;

CREATE INDEX "Case_questionSetId_idx" ON "Case"("questionSetId");

ALTER TABLE "Case" ADD CONSTRAINT "Case_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
