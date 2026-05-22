import { z } from "zod";
import type { GongbuhoPacketStatus } from "@prisma/client";

const gongbuhoPacketStatuses: [GongbuhoPacketStatus, ...GongbuhoPacketStatus[]] =
  ["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"];

/** 최소 패킷 본문 — 나머지 키는 표준 패킷(SSOT)로 passthrough 허용 */
export const gongbuhoPacketJsonMinSchema = z
  .object({
    code: z.string().min(1),
    version: z.string().min(1),
    name: z.string().min(1),
    domain: z.string().min(1),
    caseType: z.union([z.string().min(1), z.null()]).optional(),
  })
  .passthrough();

export const adminCreateGongbuhoPacketBodySchema = z.object({
  packetJson: z.unknown(),
});

export const adminListGongbuhoPacketsQuerySchema = z.object({
  status: z.enum(gongbuhoPacketStatuses).optional(),
  code: z.string().optional(),
  caseType: z.string().optional(),
});

export const caseApplyGongbuhoBodySchema = z
  .object({
    code: z.string().min(1).optional(),
    version: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    const hasC = !!val.code;
    const hasV = !!val.version;
    if (hasC !== hasV) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "code와 version은 함께 제공하거나 함께 생략해야 합니다.",
      });
    }
  });

export type GongbuhoPacketJsonMin = z.infer<typeof gongbuhoPacketJsonMinSchema>;
