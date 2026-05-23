import { NextRequest } from "next/server";

import {
  getClientDisclosureDelivery,
  mapClientDisclosureDeliveryToSummaryShape,
} from "@/features/ai-core/client-disclosure-delivery.service";
import { isClientSafeDisclosureAudience } from "@/features/ai-core/client-safe-disclosure.service";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

/**
 * Phase 11-C — Client portal delivery (latest CaseClientDisclosureRelease only).
 * GET: delivery payload · no preview · no intelligenceGraph.
 */
export async function GET(_req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { caseId } = await ctx.params;
    const delivery = await getClientDisclosureDelivery(user, caseId);

    return ok({ delivery });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

/** POST — summary/generate 호환 shape (CLIENT portal binding) */
export async function POST(_req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    if (!isClientSafeDisclosureAudience(user)) {
      throw new ForbiddenError("POST delivery summary는 의뢰인(CLIENT) audience만 사용합니다.");
    }

    const { caseId } = await ctx.params;
    const delivery = await getClientDisclosureDelivery(user, caseId);
    const summary = mapClientDisclosureDeliveryToSummaryShape(delivery);

    return ok({ summary, delivery });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
