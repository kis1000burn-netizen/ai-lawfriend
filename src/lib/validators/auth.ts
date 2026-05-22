import { z } from "zod";
import {
  hasAllRequiredLawyerVerificationDocumentTypes,
  LAWYER_VERIFICATION_DOCUMENT_TYPE,
} from "@/lib/lawyer/lawyer-verification-document-types";
import {
  LAWYER_VERIFICATION_SIGNUP_STAGING_PREFIX,
  assertLawyerVerificationStorageKeyShape,
} from "@/lib/lawyer/lawyer-verification-storage";

/** [FILE-006·007] 공개 auth body — [§5·Batch C] `transition`/인터뷰 API와 동일한 `.strict()` 취지(확장 필드 거부) */
export const signUpSchema = z
  .object({
    email: z.string().trim().email("올바른 이메일 형식이 아닙니다."),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .max(100, "비밀번호가 너무 깁니다."),
    name: z
      .string()
      .trim()
      .min(2, "이름은 2자 이상이어야 합니다.")
      .max(50, "이름이 너무 깁니다."),
    phone: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .min(9, "전화번호 형식이 올바르지 않습니다.")
          .max(20, "전화번호 형식이 올바르지 않습니다."),
      ])
      .optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().min(1, "이메일을 입력해 주세요."),
    password: z.string().min(1, "비밀번호를 입력해 주세요."),
    /** 로그인 후 이동 경로. 서버에서 정규화·역할별 보정. */
    redirect: z.string().trim().max(2000).optional(),
  })
  .strict();

const lawyerVerificationDocumentTypeSchema = z.enum([
  LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE,
  LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID,
  LAWYER_VERIFICATION_DOCUMENT_TYPE.MEMBERSHIP_PROOF,
  LAWYER_VERIFICATION_DOCUMENT_TYPE.OFFICE_REGISTRY,
  LAWYER_VERIFICATION_DOCUMENT_TYPE.ADDITIONAL_PROOF,
]);

/** 변호사 가입 시 증빙 — 스테이징 스토리지 키만 허용(가입 처리 시 프로필 키로 이관). */
const lawyerSignupVerificationDocumentSchema = z
  .object({
    type: lawyerVerificationDocumentTypeSchema,
    fileName: z.string().trim().min(1).max(500),
    storageKey: z.string().trim().min(1).max(2000),
    bucket: z.union([z.string().trim().max(500), z.null()]).optional(),
    mimeType: z.string().trim().min(1).max(200),
    sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
    checksum: z.string().trim().regex(/^[a-f0-9]{64}$/i),
  })
  .strict()
  .superRefine((d, ctx) => {
    const k = d.storageKey.trim();
    try {
      assertLawyerVerificationStorageKeyShape(k);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "storageKey 형식이 올바르지 않습니다.",
        path: ["storageKey"],
      });
      return;
    }
    if (!k.startsWith(LAWYER_VERIFICATION_SIGNUP_STAGING_PREFIX)) {
      ctx.addIssue({
        code: "custom",
        message: "증빙은 가입용 임시 업로드 후 제출해야 합니다.",
        path: ["storageKey"],
      });
    }
  });

/** 변호사 전용 가입 — 증빙·유형 검증은 일반적인 자격 확인 기준과 맞춘다. */
export const signUpLawyerSchema = z
  .object({
    email: z.string().trim().email("올바른 이메일 형식이 아닙니다."),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .max(100, "비밀번호가 너무 깁니다."),
    name: z
      .string()
      .trim()
      .min(2, "이름은 2자 이상이어야 합니다.")
      .max(50, "이름이 너무 깁니다."),
    phone: z
      .string()
      .trim()
      .min(9, "휴대폰 번호를 입력해 주세요.")
      .max(20, "휴대폰 번호 형식이 올바르지 않습니다."),
    emailConfirm: z.string().trim().email("확인 이메일 형식이 올바르지 않습니다."),
    phoneConfirm: z
      .string()
      .trim()
      .min(9, "휴대폰 확인 번호를 입력해 주세요.")
      .max(20, "휴대폰 확인 번호 형식이 올바르지 않습니다."),
    /** 가입 신청 시 디지털 무결 서약(체크 필수). */
    acceptanceIntegrityAttestation: z
      .boolean()
      .refine((v) => v === true, { message: "무결 서약에 동의해야 가입할 수 있습니다." }),
    registrationNumber: z
      .string()
      .trim()
      .min(4, "변호사 등록번호를 입력해 주세요.")
      .max(64),
    barAssociation: z
      .string()
      .trim()
      .min(2, "소속 지방변호사회를 입력해 주세요.")
      .max(200),
    officeName: z.string().trim().max(200).optional(),
    officeAddress: z.string().trim().max(500).optional(),
    officePhone: z
      .union([
        z.literal(""),
        z.string().trim().min(9).max(20),
      ])
      .optional(),
    websiteUrl: z.union([z.literal(""), z.string().trim().url().max(2000)]).optional(),
    specialtiesNote: z.string().trim().max(2000).optional(),
    documents: z.array(lawyerSignupVerificationDocumentSchema).min(2).max(20),
  })
  .strict()
  .superRefine((body, ctx) => {
    const em = body.email.trim().toLowerCase();
    const emc = body.emailConfirm.trim().toLowerCase();
    if (em !== emc) {
      ctx.addIssue({
        code: "custom",
        message: "이메일 주소가 일치하지 않습니다.",
        path: ["emailConfirm"],
      });
    }
    if (body.phone.trim() !== body.phoneConfirm.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "휴대폰 번호가 일치하지 않습니다.",
        path: ["phoneConfirm"],
      });
    }
  })
  .superRefine((body, ctx) => {
    if (
      !hasAllRequiredLawyerVerificationDocumentTypes(
        body.documents.map((row) => row.type),
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "변호사 등록(또는 등록 상태) 증명과 본인 확인용 신분증을 각각 제출해야 관리자 심사를 진행할 수 있습니다.",
        path: ["documents"],
      });
    }
  });
