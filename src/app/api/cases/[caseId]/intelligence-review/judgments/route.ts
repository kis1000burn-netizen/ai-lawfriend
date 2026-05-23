import { NextRequest } from "next/server";

import { caseIntelligenceJudgmentBodySchema } from "@/features/ai-core/case-intelligence-review.api.validators";
import { applyCaseIntelligenceJudgment } from "@/features/ai-core/case-intelligence-review.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

/**
 * Phase 11-A — apply lawyer judgment to a ledger entry.
 */
export async function POST(req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const body = caseIntelligenceJudgmentBodySchema.parse(await req.json().catch(() => ({})));
    const { caseId } = await ctx.params;

    const snapshot = await applyCaseIntelligenceJudgment(user, caseId, body);

    return ok({ snapshot });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
