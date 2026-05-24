import type { CasePackageAccessAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AccessLogInput = {
  shareId: string;
  caseId: string;
  actorUserId?: string | null;
  action: CasePackageAccessAction;
  targetType: string;
  targetId?: string | null;
  resultMessage?: string | null;
  request?: Request;
};

export async function createCasePackageAccessLog(input: AccessLogInput) {
  const ip =
    input.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    input.request?.headers.get("x-real-ip") ??
    null;

  const userAgent = input.request?.headers.get("user-agent") ?? null;

  return prisma.casePackageAccessLog.create({
    data: {
      shareId: input.shareId,
      caseId: input.caseId,
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      resultMessage: input.resultMessage ?? null,
      ip,
      userAgent,
    },
  });
}