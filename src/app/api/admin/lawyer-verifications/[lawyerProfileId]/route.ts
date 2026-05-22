import { LawyerVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { fail, ok } from "@/lib/domain-api-response";
import { writeAuditLog } from "@/lib/audit-log";
import { patchLawyerVerificationSchema } from "@/lib/validators/admin-lawyer-verification";

export const dynamic = "force-dynamic";

function auditActionForStatus(status: LawyerVerificationStatus): string {
  switch (status) {
    case LawyerVerificationStatus.APPROVED:
      return "LAWYER_VERIFICATION_APPROVED";
    case LawyerVerificationStatus.NEEDS_MORE_INFO:
      return "LAWYER_VERIFICATION_NEEDS_MORE_INFO";
    case LawyerVerificationStatus.REJECTED:
      return "LAWYER_VERIFICATION_REJECTED";
    case LawyerVerificationStatus.SUSPENDED:
      return "LAWYER_VERIFICATION_SUSPENDED";
    default:
      return "LAWYER_VERIFICATION_UPDATE";
  }
}

/** GET /api/admin/lawyer-verifications/[lawyerProfileId] */
export async function GET(
  _req: Request,
  context: { params: Promise<{ lawyerProfileId: string }> },
) {
  try {
    await requireStaffOrPlatformAdminApi();
    const { lawyerProfileId } = await context.params;

    const profile = await prisma.lawyerProfile.findFirst({
      where: { id: lawyerProfileId, user: { role: "LAWYER" } },
      select: {
        id: true,
        userId: true,
        registrationNumber: true,
        barAssociation: true,
        officeName: true,
        officeAddress: true,
        officePhone: true,
        websiteUrl: true,
        specialtiesNote: true,
        verificationStatus: true,
        submittedAt: true,
        reviewedAt: true,
        reviewedById: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            status: true,
            role: true,
          },
        },
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
        verificationDocuments: {
          orderBy: { uploadedAt: "asc" },
          select: {
            id: true,
            type: true,
            fileName: true,
            fileUrl: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!profile) {
      return fail("프로필을 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    const safeProfile = {
      ...profile,
      verificationDocuments: profile.verificationDocuments.map(({ fileUrl: _drop, ...d }) => ({
        ...d,
      })),
    };

    return ok({ profile: safeProfile });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return fail(err.message ?? "조회 실패", err.status ?? 500, {
      code: err.status === 401 ? "UNAUTHORIZED" : err.status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR",
    });
  }
}

/** PATCH /api/admin/lawyer-verifications/[lawyerProfileId] */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ lawyerProfileId: string }> },
) {
  try {
    const admin = await requireAdminApi();
    const { lawyerProfileId } = await context.params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail("JSON 본문이 필요합니다.", 422, { code: "VALIDATION_ERROR" });
    }

    const parsed = patchLawyerVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return fail("입력값이 올바르지 않습니다.", 422, {
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const { verificationStatus: nextStatus, rejectionReason: reasonRaw } = parsed.data;
    const trimmedReason = reasonRaw?.trim() ?? "";

    const existing = await prisma.lawyerProfile.findFirst({
      where: { id: lawyerProfileId, user: { role: "LAWYER" } },
      select: {
        id: true,
        verificationStatus: true,
        userId: true,
        user: { select: { email: true } },
      },
    });

    if (!existing) {
      return fail("프로필을 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    const fromStatus = existing.verificationStatus;
    const rejectionReason =
      nextStatus === LawyerVerificationStatus.APPROVED
        ? null
        : trimmedReason.length > 0
          ? trimmedReason
          : null;

    const updated = await prisma.lawyerProfile.update({
      where: { id: lawyerProfileId },
      data: {
        verificationStatus: nextStatus,
        rejectionReason,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        verificationStatus: true,
        reviewedAt: true,
        reviewedById: true,
        rejectionReason: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: auditActionForStatus(nextStatus),
      entityType: "LAWYER_PROFILE",
      entityId: lawyerProfileId,
      message: `[${fromStatus} → ${nextStatus}] ${existing.user.email}${trimmedReason ? ` | ${trimmedReason.slice(0, 200)}${trimmedReason.length > 200 ? "…" : ""}` : ""}`,
      metadata: {
        lawyerUserId: existing.userId,
        fromStatus,
        toStatus: nextStatus,
        hasRejectionReason: trimmedReason.length > 0,
      },
    });

    return ok({ profile: updated });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return fail(err.message ?? "처리 실패", err.status ?? 500, {
      code: err.status === 401 ? "UNAUTHORIZED" : err.status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR",
    });
  }
}
