import type { NextRequest } from "next/server";
import { created, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { createAdminBillingLedgerAdjustment } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.service";
import { adminBillingLedgerAdjustmentBodySchema } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ tenantId: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const { tenantId } = await context.params;
    const body = adminBillingLedgerAdjustmentBodySchema.parse(await req.json());
    const ledger = await createAdminBillingLedgerAdjustment({
      tenantId,
      body,
      actorUserId: auth.user.id,
    });
    return created({ ledger });
  } catch (error) {
    return handleApiError(error);
  }
}
