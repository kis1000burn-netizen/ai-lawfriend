import { NextRequest } from "next/server";

import { clientDisclosureReleaseBodySchema } from "@/features/ai-core/client-disclosure-preview.api.validators";
import {
  getClientDisclosurePreview,
  recordClientDisclosureRelease,
} from "@/features/ai-core/client-disclosure-preview.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

/**
 * Phase 11-B — Client disclosure preview & release control.
 * GET: preview + diff · POST: record release.
 */
export async function GET(_req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { caseId } = await ctx.params;
    const preview = await getClientDisclosurePreview(user, caseId);

    return ok({ preview });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const body = clientDisclosureReleaseBodySchema.parse(await req.json().catch(() => ({})));
    const { caseId } = await ctx.params;

    const preview = await recordClientDisclosureRelease(user, caseId, body);

    return ok({ preview });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
