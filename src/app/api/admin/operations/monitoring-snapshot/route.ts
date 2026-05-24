import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { getOperationsMonitoringSnapshot } from "@/features/operations-monitoring/operations-monitoring-snapshot.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const snapshot = await getOperationsMonitoringSnapshot();
    return ok(snapshot);
  } catch (error) {
    return handleApiError(error);
  }
}
