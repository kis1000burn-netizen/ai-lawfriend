import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { getAdminTenantListSnapshot } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const tenants = await getAdminTenantListSnapshot();
    return ok({ tenants });
  } catch (error) {
    return handleApiError(error);
  }
}
