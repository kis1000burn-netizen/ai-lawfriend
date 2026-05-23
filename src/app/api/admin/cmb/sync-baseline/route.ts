import { NextRequest } from "next/server";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { ForbiddenError } from "@/lib/errors";
import { syncBaselineCmbRevisionsFromRegistry } from "@/cmb/publish/cmb-publish-lock.service";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      throw new ForbiddenError("CMB baseline sync는 ADMIN 이상만 가능합니다.");
    }

    const results = await syncBaselineCmbRevisionsFromRegistry(user.id);
    return ok({ results });
  } catch (error: unknown) {
    const err = error as Error & { status?: number; statusCode?: number };
    const status = err.status ?? err.statusCode;
    if (status === 401 || status === 403) {
      return fail(err.message, status, {
        code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
