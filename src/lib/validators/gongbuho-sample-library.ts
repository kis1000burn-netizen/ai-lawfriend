import { z } from "zod";
import { gongbuhoPacketJsonMinSchema } from "./gongbuho";

/**
 * docs/gongbuho/samples 패킷 — 시드·검증용.
 * 최소 패킷 Zod에는 `caseType` 이 선택이지만 라이브러리 샘플은 사건 적용 매칭·운영 검색을 위해 필수.
 */
export const gongbuhoSampleLibraryPacketSchema =
  gongbuhoPacketJsonMinSchema.superRefine((data, ctx) => {
    const ct = data.caseType;
    if (ct === undefined || ct === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "샘플 라이브러리 패킷은 caseType 필수 문자열입니다.",
        path: ["caseType"],
      });
      return;
    }
    if (typeof ct !== "string" || !ct.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "caseType 이 비었습니다.",
        path: ["caseType"],
      });
    }
  });

export type GongbuhoSampleLibraryPacket = z.infer<
  typeof gongbuhoSampleLibraryPacketSchema
>;
