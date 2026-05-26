import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { getControlTowerBrainSnapshot } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const snapshot = await getControlTowerBrainSnapshot();
    return ok(snapshot);
  } catch (error) {
    return handleApiError(error);
  }
}
