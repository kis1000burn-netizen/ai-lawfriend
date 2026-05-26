import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { brainScanInputSchema } from "@/features/control-tower-brain/phase60b-error-detection.schema";
import { scanControlTowerBrain } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json().catch(() => ({}));
    const input = brainScanInputSchema.parse(body);
    const result = await scanControlTowerBrain(input);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
