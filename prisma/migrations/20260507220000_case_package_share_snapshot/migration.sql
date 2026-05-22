-- 사건 패키지 공유: 공유 시점 스냅샷 무결성(외부 재설명 대신 패키지 단일 원본 고정)

ALTER TABLE "CasePackageShare" ADD COLUMN "snapshotJson" JSONB;
ALTER TABLE "CasePackageShare" ADD COLUMN "snapshotSha256" TEXT;
