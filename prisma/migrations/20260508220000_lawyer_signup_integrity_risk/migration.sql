-- 변호사 가입 시 무결 서약·접속 패턴(역추적 어려운 지문) 저장 — 심사 참고용
ALTER TABLE "LawyerProfile" ADD COLUMN "integrityAttestationAcceptedAt" TIMESTAMP(3),
ADD COLUMN "integrityAttestationVersion" TEXT,
ADD COLUMN "signupRiskIpFingerprint" TEXT,
ADD COLUMN "signupRiskUserAgent" TEXT;

CREATE INDEX "LawyerProfile_signupRiskIpFingerprint_idx" ON "LawyerProfile"("signupRiskIpFingerprint");
