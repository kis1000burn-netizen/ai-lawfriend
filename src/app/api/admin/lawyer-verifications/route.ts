import { type Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { fail, ok } from "@/lib/domain-api-response";
import { resolveLawyerVerificationListStatuses } from "@/lib/admin/lawyer-verification-filters";

export const dynamic = "force-dynamic";

/** GET /api/admin/lawyer-verifications — 승인 대기 큐(기본: PENDING·NEEDS_MORE_INFO). ?status=PENDING 단일 등 */
export async function GET(req: NextRequest) {
  try {
    await requireStaffOrPlatformAdminApi();

    const { searchParams } = new URL(req.url);
    const statusFilter = resolveLawyerVerificationListStatuses(searchParams.get("status"));

    const docGap = searchParams.get("docGap") === "1";

    const where: Prisma.LawyerProfileWhereInput = {
      user: { role: "LAWYER" },
      verificationStatus: { in: statusFilter },
      ...(docGap ? { verificationDocuments: { none: {} } } : {}),
    };

    const [items, counts] = await Promise.all([
      prisma.lawyerProfile.findMany({
        where,
        orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          registrationNumber: true,
          barAssociation: true,
          officeName: true,
          officeAddress: true,
          officePhone: true,
          verificationStatus: true,
          submittedAt: true,
          reviewedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              status: true,
            },
          },
        },
      }),
      prisma.lawyerProfile.groupBy({
        by: ["verificationStatus"],
        where: { user: { role: "LAWYER" } },
        _count: { _all: true },
      }),
    ]);

    const statusCounts = Object.fromEntries(
      counts.map((c) => [c.verificationStatus, c._count._all]),
    ) as Record<string, number>;

    return ok({
      items,
      statusFilter,
      statusCounts,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return fail(err.message ?? "목록 조회 실패", err.status ?? 500, {
      code: err.status === 401 ? "UNAUTHORIZED" : err.status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR",
    });
  }
}
