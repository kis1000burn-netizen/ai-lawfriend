import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const CODE_PREFIX = "AIF";

function randomCodePart(length = 4): string {
  return randomBytes(length)
    .toString("base64url")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(0, length);
}

export function normalizePublicCode(value: string): string {
  return value.trim().toUpperCase();
}

export function buildPublicCode(date = new Date()): string {
  const year = date.getFullYear();
  return `${CODE_PREFIX}-${year}-${randomCodePart(4)}-${randomCodePart(4)}`;
}

export async function generateUniquePublicCode(): Promise<string> {
  for (let index = 0; index < 10; index += 1) {
    const publicCode = buildPublicCode();
    const exists = await prisma.casePackageShare.findUnique({
      where: { publicCode },
      select: { id: true },
    });

    if (!exists) {
      return publicCode;
    }
  }

  throw new Error("사건 고유번호 생성에 실패했습니다.");
}