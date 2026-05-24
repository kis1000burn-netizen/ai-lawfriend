import { z } from "zod";
import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { ValidationError } from "@/lib/errors";
import { exportDataGovernancePurgeDryRun } from "@/features/data-governance/data-governance-purge-dry-run.service";
import { DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE } from "@/features/data-governance/data-governance-rc-lock";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  operatorConfirmationPhrase: z.string().min(1),
  rollbackWarningAcknowledged: z.boolean(),
  bundledRcVerifyPassed: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const body = bodySchema.parse(await request.json());

    if (body.operatorConfirmationPhrase.trim() !== DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE) {
      throw new ValidationError("Operator confirmation phrase mismatch");
    }

    const exportResult = await exportDataGovernancePurgeDryRun(auth.user, body);
    return ok(exportResult);
  } catch (error) {
    return handleApiError(error);
  }
}
