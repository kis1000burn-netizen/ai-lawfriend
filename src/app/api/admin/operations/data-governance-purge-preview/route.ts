import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { getDataGovernancePurgePreviewSnapshot } from "@/features/data-governance/data-governance-purge-preview.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const preview = await getDataGovernancePurgePreviewSnapshot(auth.user);
    return ok(preview);
  } catch (error) {
    return handleApiError(error);
  }
}
