import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { getDataGovernanceVisibilitySnapshot } from "@/features/data-governance/data-governance-visibility.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const snapshot = await getDataGovernanceVisibilitySnapshot(auth.user);
    return ok(snapshot);
  } catch (error) {
    return handleApiError(error);
  }
}
