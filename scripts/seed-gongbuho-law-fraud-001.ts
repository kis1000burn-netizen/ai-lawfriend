/**
 * Gongbuho LAW-FRAUD-001 샘플 패킷을 DB에 삽입(멱등).
 * 검증·삽입 규약은 `seed-gongbuho-samples` 와 동일(caseType 필수 등).
 *
 * 선행 조건:
 * - `DATABASE_URL` 설정 후 마이그레이션 적용 완료(`npx prisma migrate deploy` 또는 `npm run db:migrate`)
 * - 선택: `GONGBUHO_SEED_CREATED_BY_USER_ID` — 없으면 ADMIN → SUPER_ADMIN 순으로 첫 사용자 ID 사용
 *
 * 실행(레포 루트에서):
 *   npm run seed:gongbuho-law-fraud-001
 *
 * 전체 샘플: `npm run seed:gongbuho-samples`
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { insertGongbuhoDraftPacketIfAbsent } from "./lib/gongbuho-draft-packet-insert";
import { resolveGongbuhoSeedCreatedByUserId } from "./lib/gongbuho-seed-resolve-user";
import { projectGongbuhoQuestionFlowToQuestions } from "../src/features/gongbuho/project-gongbuho-question-flow";
import { gongbuhoSampleLibraryPacketSchema } from "../src/lib/validators/gongbuho-sample-library";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const samplePath = resolve(
    process.cwd(),
    "docs/gongbuho/samples/LAW_FRAUD_001_GONGBUHO.json",
  );

  let parsedBody;
  try {
    const raw = JSON.parse(readFileSync(samplePath, "utf8")) as unknown;
    parsedBody = gongbuhoSampleLibraryPacketSchema.parse(raw);
    projectGongbuhoQuestionFlowToQuestions(parsedBody);
  } catch (e: unknown) {
    console.error(
      `[seed:gongbuho-law-fraud-001] 샘플 검증 실패 (${samplePath}):`,
      e,
    );
    process.exit(1);
    return;
  }

  const code = parsedBody.code.trim();
  const version = parsedBody.version.trim();

  const createdByUserId = await resolveGongbuhoSeedCreatedByUserId(prisma);
  if (!createdByUserId) {
    console.warn(
      "[seed:gongbuho-law-fraud-001] WARN — 작성자 사용자 ID 없이 등록합니다(createdByUserId=null). ADMIN/SUPER_ADMIN 시드 또는 GONGBUHO_SEED_CREATED_BY_USER_ID 권장.",
    );
  }

  const inserted = await insertGongbuhoDraftPacketIfAbsent({
    prisma,
    parsed: parsedBody,
    createdByUserId: createdByUserId ?? null,
  });

  if (inserted === "skipped") {
    const existing = await prisma.gongbuhoPacket.findFirst({
      where: { code, version },
      select: { id: true, status: true },
    });
    console.log(
      `[seed:gongbuho-law-fraud-001] SKIP — 이미 등록됨 id=${existing?.id} code=${code} version=${version} status=${existing?.status}`,
    );
    return;
  }

  const row = await prisma.gongbuhoPacket.findFirstOrThrow({
    where: { code, version },
    select: { id: true },
  });

  console.log(
    `[seed:gongbuho-law-fraud-001] OK — GongbuhoPacket 생성 id=${row.id} code=${code} version=${version} status=DRAFT`,
  );
}

void main()
  .catch((err) => {
    if (String(err?.code) === "P2002") {
      console.error(
        "[seed:gongbuho-law-fraud-001] FAIL — UNIQUE(code,version) 충돌. 이미 동일 패킷이 있을 수 있습니다.",
      );
    } else if (process.env.DEBUG_GONGBUHO_SEED) {
      console.error(err);
    } else {
      console.error(
        "[seed:gongbuho-law-fraud-001] FAIL:",
        err instanceof Error ? err.message : err,
      );
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
