import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getLitigationCommandCenterListSummariesService } from "@/features/document-intelligence/litigation-command-center-list-summary.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  caseIds: z
    .string()
    .min(1)
    .transform((v) => v.split(",").map((id) => id.trim()).filter(Boolean))
    .pipe(z.array(z.string().cuid()).max(50)),
});

export async function GET(request: Request) {
  try {
    const currentUser = await requireSessionUser();
    const url = new URL(request.url);
    const caseIds = querySchema.parse({
      caseIds: url.searchParams.get("caseIds") ?? "",
    }).caseIds;

    const result = await getLitigationCommandCenterListSummariesService(
      currentUser,
      caseIds,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
