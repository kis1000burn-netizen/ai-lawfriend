import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { brainAutoFixInputSchema } from "@/features/control-tower-brain/phase60e-safe-auto-fix.schema";
import { autoFixControlTowerBrain } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const input = brainAutoFixInputSchema.parse(body);
    const result = await autoFixControlTowerBrain({
      planId: input.planId,
      dryRun: input.dryRun,
      actorUserId: auth.user.id,
    });
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
