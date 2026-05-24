import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import {
  getAdminTenantPlanConsoleSnapshot,
  updateAdminTenantPlan,
} from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.service";
import { adminUpdateTenantPlanBodySchema } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ tenantId: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const { tenantId } = await context.params;
    const snapshot = await getAdminTenantPlanConsoleSnapshot(tenantId);
    return ok(snapshot);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const { tenantId } = await context.params;
    const body = adminUpdateTenantPlanBodySchema.parse(await req.json());
    const plan = await updateAdminTenantPlan({
      tenantId,
      body,
      actorUserId: auth.user.id,
    });
    return ok({ plan });
  } catch (error) {
    return handleApiError(error);
  }
}
