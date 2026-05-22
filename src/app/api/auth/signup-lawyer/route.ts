import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/domain-api-response";
import { signUpLawyerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import {
  verifyLawyerVerificationDocumentMetaForSignup,
  claimSignupStagingLawyerVerificationDocument,
} from "@/lib/lawyer/lawyer-verification-storage";
import {
  LAWYER_VERIFICATION_INTEGRITY_ATTESTATION_VERSION,
  signupRiskFingerprintFromHeaders,
} from "@/lib/lawyer/lawyer-signup-risk";
import {
  LawyerVerificationStatus,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpLawyerSchema.safeParse(body);

    if (!parsed.success) {
      return fail("입력값이 올바르지 않습니다.", 422, {
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const passwordHash = await hashPassword(parsed.data.password);

    const docsInput = parsed.data.documents;

    try {
      await verifyLawyerVerificationDocumentMetaForSignup(
        docsInput.map((d) => ({
          storageKey: d.storageKey,
          sizeBytes: d.sizeBytes,
          checksum: d.checksum,
        })),
      );
    } catch (e: unknown) {
      const code =
        e instanceof Error && (e.message === "CHECKSUM_MISMATCH" || e.message === "SIZE_MISMATCH")
          ? "VERIFICATION_DOC_INTEGRITY"
          : "VERIFICATION_DOC_NOT_FOUND";
      return fail(
        "제출한 증빙 파일을 확인할 수 없습니다. 업로드 후 다시 시도해 주세요.",
        422,
        { code },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return fail("이미 가입된 이메일입니다.", 409, { code: "EMAIL_EXISTS" });
    }

    const officePhone =
      parsed.data.officePhone?.trim() && parsed.data.officePhone.trim().length > 0
        ? parsed.data.officePhone.trim()
        : null;
    const websiteUrl =
      parsed.data.websiteUrl?.trim() && parsed.data.websiteUrl.trim().length > 0
        ? parsed.data.websiteUrl.trim()
        : null;

    const signupRisk = signupRiskFingerprintFromHeaders(req.headers);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: parsed.data.name.trim(),
          phone: parsed.data.phone.trim(),
          role: UserRole.LAWYER,
          status: UserStatus.ACTIVE,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      const profile = await tx.lawyerProfile.create({
        data: {
          userId: user.id,
          registrationNumber: parsed.data.registrationNumber.trim(),
          barAssociation: parsed.data.barAssociation.trim(),
          officeName: parsed.data.officeName?.trim() || null,
          officeAddress: parsed.data.officeAddress?.trim() || null,
          officePhone,
          websiteUrl,
          specialtiesNote: parsed.data.specialtiesNote?.trim() || null,
          verificationStatus: LawyerVerificationStatus.PENDING,
          submittedAt: new Date(),
          integrityAttestationAcceptedAt: new Date(),
          integrityAttestationVersion: LAWYER_VERIFICATION_INTEGRITY_ATTESTATION_VERSION,
          signupRiskIpFingerprint: signupRisk.ipFingerprint,
          signupRiskUserAgent: signupRisk.userAgentPrefix,
        },
        select: {
          id: true,
          verificationStatus: true,
        },
      });

      return { user, profile };
    });
    try {
      for (const d of docsInput) {
        const saved = await claimSignupStagingLawyerVerificationDocument({
          stagingStorageKey: d.storageKey,
          lawyerProfileId: result.profile.id,
        });
        const expected = d.checksum.trim().toLowerCase();
        if (saved.checksum !== expected) {
          throw new Error("CLAIM_CHECKSUM_MISMATCH");
        }
        await prisma.lawyerVerificationDocument.create({
          data: {
            lawyerProfileId: result.profile.id,
            type: d.type.trim(),
            fileName: d.fileName.trim(),
            fileUrl: null,
            storageKey: saved.storageKey,
            bucket: saved.bucket ?? d.bucket?.trim() ?? null,
            mimeType: saved.mimeType,
            sizeBytes: saved.sizeBytes,
            checksum: saved.checksum.toLowerCase(),
          },
        });
      }
    } catch (docErr: unknown) {
      console.error("[SIGNUP_LAWYER_DOC_CLAIM_PARTIAL]", docErr);
      /** 프로필·계정은 남김 — 일부 증빙만 들어간 경우 관리자/재제출 플로로 정리 가능 */
      if (
        docErr instanceof Error &&
        docErr.message === "CLAIM_CHECKSUM_MISMATCH"
      ) {
        return fail("증빙 파일 처리 중 불일치가 발생했습니다. 파일을 새로 업로드한 뒤 다시 시도해 주세요.", 422, {
          code: "VERIFICATION_DOC_CLAIM_FAILED",
        });
      }
      return fail(
        "계정은 생성되었으나 증빙을 저장하지 못했습니다. 로그인 후 증빙 제출 없이 접수 가능한 추가 경로 또는 관리자에게 문의해 주세요.",
        500,
        { code: "VERIFICATION_DOC_PERSIST_FAILED" },
      );
    }

    return ok(
      {
        user: result.user,
        lawyerVerificationStatus: result.profile.verificationStatus,
        message:
          "변호사 회원 정보와 자격·본인 확인 서류가 접수되었습니다. 관리자 검토 후 전문 기능이 열립니다. 로그인은 지금부터 가능하지만 승인 전까지는 업무 기능을 사용할 수 없습니다.",
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "CLAIM_CHECKSUM_MISMATCH"
    ) {
      console.error("[SIGNUP_LAWYER_CLAIM_MISMATCH]", error);
      return fail("증빙 파일 처리 중 불일치가 발생했습니다. 파일을 새로 업로드한 뒤 다시 가입해 주세요.", 422, {
        code: "VERIFICATION_DOC_CLAIM_FAILED",
      });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("이미 가입된 이메일입니다.", 409, { code: "EMAIL_EXISTS" });
    }

    console.error("[SIGNUP_LAWYER_POST_ERROR]", error);
    return fail("변호사 회원가입 처리 중 오류가 발생했습니다.", 500, {
      code: "INTERNAL_ERROR",
    });
  }
}
