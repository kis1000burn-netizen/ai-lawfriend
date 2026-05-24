import { NextRequest } from "next/server";

import {
  getCaseIntelligenceReviewSnapshot,
  refreshCaseIntelligenceReviewSnapshot,
} from "@/features/ai-core/case-intelligence-review.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

/**
 * Phase 11-A — Lawyer Review Console snapshot.
 * GET: latest snapshot · POST: refresh (rebuild graph/radar/ledger, merge prior decisions).
 */
export async function GET(_req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { caseId } = await ctx.params;
    const snapshot = await getCaseIntelligenceReviewSnapshot(user, caseId);

    return ok({ snapshot });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

export async function POST(_req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { caseId } = await ctx.params;
    const snapshot = await refreshCaseIntelligenceReviewSnapshot(user, caseId);

    return ok({ snapshot });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
