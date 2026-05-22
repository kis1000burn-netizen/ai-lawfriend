/**
 * P4/P5: `fileUrl` 만 있고 `storageKey` 없는 변호사 증빙을 private storage 로 옮긴다.
 * `fileUrl` 컬럼은 삭제하지 않는다(후속 정책 P4-3).
 *
 * 사용:
 *   기본 = dry-run(읽기·검증만)
 *   npx tsx scripts/migrate-lawyer-verification-documents-to-private-storage.ts
 *   npx tsx scripts/migrate-lawyer-verification-documents-to-private-storage.ts --apply
 *   npx tsx scripts/migrate-lawyer-verification-documents-to-private-storage.ts --apply --failures-out=./p4-migrate-failures.json
 *   npx tsx scripts/migrate-lawyer-verification-documents-to-private-storage.ts --summary-out=./p4-migrate-summary.json
 *
 * 필수 env: DATABASE_URL, ILLEGAL_LENDING_* 스토리지(대상 환경과 동일).
 */
import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { migrateLawyerVerificationDocumentRow } from "@/lib/lawyer/lawyer-verification-fileurl-migration";

type MigrationFailureRecord = { documentId: string; reason: string; stage: string };

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply");
  let failuresOut: string | null = null;
  let summaryOut: string | null = null;
  for (const a of argv) {
    if (a.startsWith("--failures-out=")) {
      failuresOut = a.slice("--failures-out=".length).trim();
    }
    if (a.startsWith("--summary-out=")) {
      summaryOut = a.slice("--summary-out=".length).trim();
    }
  }
  return { apply, failuresOut, summaryOut };
}

async function main() {
  const startedAt = new Date().toISOString();
  const { apply, failuresOut, summaryOut } = parseArgs(process.argv.slice(2));
  const dryRun = !apply;

  console.log(
    dryRun
      ? "[P4] DRY-RUN: 업로드·DB 갱신 없음. 적용하려면 --apply"
      : "[P4] APPLY: 스토리지 업로드 및 DB 갱신 수행",
  );

  const rows = await prisma.lawyerVerificationDocument.findMany({
    where: {
      storageKey: null,
      NOT: { fileUrl: null },
    },
    select: {
      id: true,
      lawyerProfileId: true,
      fileName: true,
      fileUrl: true,
      type: true,
      storageKey: true,
    },
    orderBy: { uploadedAt: "asc" },
  });

  const scanned = rows.length;
  console.log(`[P4] 후보 행: ${scanned}`);

  const failures: MigrationFailureRecord[] = [];
  let skipped = 0;
  let failed = 0;
  let migrated = 0;

  for (const row of rows) {
    const result = await migrateLawyerVerificationDocumentRow(prisma, row, dryRun);
    if (result.ok) {
      if (!dryRun) migrated += 1;
      const p = result.wouldMigrate ?? result.migrated;
      if (p) {
        console.log(
          dryRun
            ? `[P4] dry-run OK doc=${p.documentId} bytes=${p.sizeBytes}`
            : `[P4] migrated doc=${p.documentId} bytes=${p.sizeBytes}`,
        );
      }
    } else {
      const f = {
        documentId: result.failure.documentId,
        reason: result.failure.error,
        stage: result.failure.stage,
      };
      failures.push(f);
      if (result.failure.error === "SKIP_NOT_ELIGIBLE") {
        skipped += 1;
      } else {
        failed += 1;
      }
      console.warn(`[P4] FAIL doc=${f.documentId} stage=${f.stage} err=${f.reason}`);
    }
  }

  const finishedAt = new Date().toISOString();
  console.log(
    `[P4] 완료: scanned=${scanned} skipped=${skipped} migrated=${migrated} failed=${failed} dryRun=${dryRun}`,
  );

  if (failuresOut && failures.length > 0) {
    writeFileSync(failuresOut, JSON.stringify({ dryRun, failures }, null, 2), "utf-8");
    console.log(`[P4] 실패 목록 저장: ${failuresOut}`);
  }

  if (summaryOut) {
    writeFileSync(
      summaryOut,
      JSON.stringify(
        {
          scanned,
          skipped,
          migrated,
          failed,
          dryRun,
          startedAt,
          finishedAt,
          failures,
        },
        null,
        2,
      ),
      "utf-8",
    );
    console.log(`[P4] 실행 요약 저장: ${summaryOut}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
