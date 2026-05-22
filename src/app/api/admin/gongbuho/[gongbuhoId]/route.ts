import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { getGongbuhoPacketDetailForAdmin } from "@/features/gongbuho/gongbuho-packet.service";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  gongbuhoId: z.string().cuid("유효한 공부호 ID가 아닙니다."),
});

type RouteContext = {
  params: Promise<{ gongbuhoId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "DETAIL");
    const { gongbuhoId } = paramsSchema.parse(await context.params);

    const packet = await getGongbuhoPacketDetailForAdmin(gongbuhoId);
    return ok({ packet });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (
      typeof err.status === "number" &&
      (err.status === 401 || err.status === 403)
    ) {
      return fail(err.message ?? "권한 오류", err.status, {
        code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
