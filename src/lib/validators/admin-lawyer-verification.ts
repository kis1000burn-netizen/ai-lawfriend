import { LawyerVerificationStatus } from "@prisma/client";
import { z } from "zod";

/** 관리자가 설정할 수 있는 심사 결과(자격 검증 상태) */
export const adminLawyerVerificationSettableStatuses = [
  LawyerVerificationStatus.APPROVED,
  LawyerVerificationStatus.NEEDS_MORE_INFO,
  LawyerVerificationStatus.REJECTED,
  LawyerVerificationStatus.SUSPENDED,
] as const;

export const patchLawyerVerificationSchema = z
  .object({
    verificationStatus: z.enum(adminLawyerVerificationSettableStatuses),
    rejectionReason: z.string().max(4000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const needReason =
      data.verificationStatus === LawyerVerificationStatus.REJECTED ||
      data.verificationStatus === LawyerVerificationStatus.NEEDS_MORE_INFO ||
      data.verificationStatus === LawyerVerificationStatus.SUSPENDED;

    if (needReason && !data.rejectionReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "반려·보완 요청·정지(SUSPENDED) 시 운영자 안내·사유(rejectionReason)를 입력해 주세요.",
        path: ["rejectionReason"],
      });
    }
  });

export type PatchLawyerVerificationInput = z.infer<typeof patchLawyerVerificationSchema>;
