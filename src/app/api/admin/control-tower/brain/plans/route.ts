import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { listPlans } from "@/features/control-tower-brain/control-tower-brain.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    return ok({ plans: listPlans() });
  } catch (error) {
    return handleApiError(error);
  }
}
