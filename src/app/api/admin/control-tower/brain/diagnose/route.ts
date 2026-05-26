import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { brainDiagnoseInputSchema } from "@/features/control-tower-brain/phase60c-conflict-diagnosis.schema";
import { diagnoseControlTowerBrain } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json().catch(() => ({}));
    const input = brainDiagnoseInputSchema.parse(body);
    const result = await diagnoseControlTowerBrain(input.issueIds);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
