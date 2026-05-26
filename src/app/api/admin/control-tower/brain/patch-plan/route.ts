import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { brainPatchPlanInputSchema } from "@/features/control-tower-brain/phase60d-patch-plan.schema";
import { buildControlTowerBrainPatchPlans } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json().catch(() => ({}));
    const input = brainPatchPlanInputSchema.parse(body);
    const result = await buildControlTowerBrainPatchPlans(input.issueIds, input.diagnosisIds);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
