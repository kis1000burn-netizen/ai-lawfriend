import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  getClientDisclosureDelivery,
  mapClientDisclosureDeliveryToSummaryShape,
} from "@/features/ai-core/client-disclosure-delivery.service";
import { isClientSafeDisclosureAudience } from "@/features/ai-core/client-safe-disclosure.service";
import { invokeCaseSummaryGenerate } from "@/features/ai-core/case-summary-ai-core-runtime.service";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

/**
 * [FILE-020] 사건 요약(인터뷰 기반) — `POST` body 없음.
 * Phase 9-B: ai-core `invokeCaseSummaryGenerate` 위임 (응답 shape 하위 호환).
 * Phase 9-E: `summary.intelligenceGraph` — Claim Graph + Contradiction Radar (additive).
 * Phase 9-F: `summary.intelligenceGraph.ledger` — Lawyer Judgment Boundary Ledger draft.
 * Phase 10-A: AI governance invoke gate + role-based intelligenceGraph visibility.
 * Phase 10-B: governance audit + usage metering on invoke/denial.
 * Phase 10-C: CLIENT audience → clientSafeDisclosure only (internal graph stripped).
 * Phase 11-C: CLIENT audience → CaseClientDisclosureRelease delivery only (no generate/graph).
 */
export async function POST(_req: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = await context.params;

    if (isClientSafeDisclosureAudience(currentUser)) {
      const delivery = await getClientDisclosureDelivery(currentUser, caseId);
      const summary = mapClientDisclosureDeliveryToSummaryShape(delivery);
      return ok({ summary });
    }

    const result = await invokeCaseSummaryGenerate({
      currentUser,
      caseId,
    });

    const { audit: _audit, ...summary } = result;

    return ok({ summary });
  } catch (error) {
    return toErrorResponse(error);
  }
}
