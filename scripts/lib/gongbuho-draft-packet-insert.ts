import type { GongbuhoPacketJsonMin } from "../../src/lib/validators/gongbuho";
import type { Prisma, PrismaClient } from "@prisma/client";

/** code+version 존재 시 SKIP, 없으면 DRAFT 생성 */
export async function insertGongbuhoDraftPacketIfAbsent(opts: Readonly<{
  prisma: PrismaClient;
  parsed: GongbuhoPacketJsonMin;
  createdByUserId?: string | null;
}>): Promise<"created" | "skipped"> {
  const code = opts.parsed.code.trim();
  const version = opts.parsed.version.trim();

  const existing = await opts.prisma.gongbuhoPacket.findFirst({
    where: { code, version },
    select: { id: true, status: true },
  });

  if (existing) return "skipped";

  const packetJson = opts.parsed as unknown as Prisma.InputJsonValue;

  await opts.prisma.gongbuhoPacket.create({
    data: {
      code,
      version,
      name: opts.parsed.name.trim(),
      domain: opts.parsed.domain.trim(),
      caseType:
        typeof opts.parsed.caseType === "string" &&
        opts.parsed.caseType.trim() !== ""
          ? opts.parsed.caseType.trim()
          : null,
      status: "DRAFT",
      packetJson,
      createdByUserId: opts.createdByUserId ?? null,
    },
  });

  return "created";
}
