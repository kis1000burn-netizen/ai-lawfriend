import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";
import { brainApprovePatchInputSchema } from "./schema";
import { approveControlTowerBrainPatch } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const input = brainApprovePatchInputSchema.parse(body);
    const plan = await approveControlTowerBrainPatch(input.planId, auth.user.id);
    if (!plan) {
      throw new NotFoundError("Patch plan not found.");
    }

    return ok({ plan });
  } catch (error) {
    return handleApiError(error);
  }
}
