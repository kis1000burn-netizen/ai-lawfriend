import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { updateAdminTenantFeatureOverrides } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.service";
import { adminUpdateTenantFeatureOverridesBodySchema } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ tenantId: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const { tenantId } = await context.params;
    const body = adminUpdateTenantFeatureOverridesBodySchema.parse(await req.json());
    const plan = await updateAdminTenantFeatureOverrides({
      tenantId,
      body,
      actorUserId: auth.user.id,
    });
    return ok({ plan });
  } catch (error) {
    return handleApiError(error);
  }
}
