/**
 * Gongbuho 샘플 라이브러리(`docs/gongbuho/samples/*_GONGBUHO.json`)를 DB에 DRAFT로 멱등 삽입.
 *
 * 각 파일: 샘플 전용 Zod + questionFlow 투영 검증 통과 필요.
 *
 * 실행: DATABASE_URL 필요, 마이그레이션 반영 후
 *   npm run seed:gongbuho-samples
 */
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import type { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaClientCtor } from "@prisma/client";
import { insertGongbuhoDraftPacketIfAbsent } from "./lib/gongbuho-draft-packet-insert";
import { resolveGongbuhoSeedCreatedByUserId } from "./lib/gongbuho-seed-resolve-user";
import { projectGongbuhoQuestionFlowToQuestions } from "../src/features/gongbuho/project-gongbuho-question-flow";
import { gongbuhoSampleLibraryPacketSchema } from "../src/lib/validators/gongbuho-sample-library";

loadEnvConfig(process.cwd());

const DEFAULT_SAMPLE_DIR = resolve(process.cwd(), "docs/gongbuho/samples");

function listSampleFilenamesOrdered(sampleDir: string): string[] {
  return readdirSync(sampleDir)
    .filter((name) => name.endsWith("_GONGBUHO.json"))
    .sort((a, b) => a.localeCompare(b, "en"));
}

export async function seedGongbuhoSampleFilesFromDisk(
  prisma: PrismaClient,
  opts?: Readonly<{ sampleDir?: string }>,
): Promise<{
  created: number;
  skipped: number;
  failed: number;
  lines: string[];
}> {
  const sampleDir = opts?.sampleDir ?? DEFAULT_SAMPLE_DIR;
  const lines: string[] = [];
  let created = 0;
  let skipped = 0;
  let failed = 0;

  const createdByUserId = await resolveGongbuhoSeedCreatedByUserId(prisma);
  if (!createdByUserId) {
    lines.push(
      "[seed:gongbuho-samples] WARN — 작성자 ID 없음(createdByUserId=null). GONGBUHO_SEED_CREATED_BY_USER_ID 또는 ADMIN 시드 권장.",
    );
  }

  const filenames = listSampleFilenamesOrdered(sampleDir);
  if (filenames.length === 0) {
    lines.push(`[seed:gongbuho-samples] WARN — 패턴 매칭 샘플 없음: ${sampleDir}`);
  }

  for (const fname of filenames) {
    const filePath = resolve(sampleDir, fname);

    try {
      const raw = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
      let parsedBody;
      try {
        parsedBody = gongbuhoSampleLibraryPacketSchema.parse(raw);
      } catch (e: unknown) {
        failed += 1;
        lines.push(
          `[seed:gongbuho-samples] FAIL Zod — ${fname}: ${String(e instanceof Error ? e.message : e)}`,
        );
        continue;
      }

      try {
        projectGongbuhoQuestionFlowToQuestions(parsedBody);
      } catch (e: unknown) {
        failed += 1;
        lines.push(
          `[seed:gongbuho-samples] FAIL questionFlow — ${fname}: ${String(e instanceof Error ? e.message : e)}`,
        );
        continue;
      }

      const result = await insertGongbuhoDraftPacketIfAbsent({
        prisma,
        parsed: parsedBody,
        createdByUserId: createdByUserId ?? null,
      });

      const code = parsedBody.code.trim();
      const version = parsedBody.version.trim();

      if (result === "skipped") {
        skipped += 1;
        lines.push(
          `[seed:gongbuho-samples] SKIP — 이미 존재 code=${code} version=${version} (${fname})`,
        );
      } else {
        created += 1;
        lines.push(
          `[seed:gongbuho-samples] OK — 생성 code=${code} version=${version} (${fname})`,
        );
      }
    } catch (e: unknown) {
      failed += 1;
      lines.push(
        `[seed:gongbuho-samples] FAIL 파일 — ${fname}: ${String(e instanceof Error ? e.message : e)}`,
      );
    }
  }

  lines.push(
    `[seed:gongbuho-samples] 요약 created=${created} skipped=${skipped} failed=${failed} files=${filenames.length}`,
  );

  return { created, skipped, failed, lines };
}

async function main(): Promise<void> {
  const prisma = new PrismaClientCtor();

  try {
    const { lines, failed } = await seedGongbuhoSampleFilesFromDisk(prisma);
    for (const ln of lines) {
      console.log(ln);
    }
    if (failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
