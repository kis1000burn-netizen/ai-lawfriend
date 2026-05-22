import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listCaseInterviewAnswersService } from "@/features/case-interview/case-interview.service";
import { buildGongbuhoAwareSummaryGeneratePayload } from "@/features/gongbuho/gongbuho-summary-contract.service";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

const SUMMARY_DISCLAIMER =
  "본 요약은 참고용 자동 생성 결과이며, 최종 법률 판단은 담당 전문가의 검토를 거쳐야 합니다.";
const AI_NOT_FINAL_JUDGMENT_NOTE =
  "자동 생성된 내용은 법률적 최종 판단·승패 예측을 제공하지 않습니다. 변호사 검토 필요 항목은 별도 표시되어 있습니다.";

function sanitizeLegalOverclaim(text: string): string {
  return text
    .replaceAll("반드시 승소", "유리할 가능성")
    .replaceAll("100% 확실", "추가 검토 필요");
}

/**
 * [FILE-020] 사건 요약(인터뷰 기반) — `POST` body 없음; `listCaseInterviewAnswersService` + 고지.
 * Phase 3-E: Gongbuho `outputContract.summary` 가 있으면 동일 순서 섹션(`contractSections`)을 채워 내려준다.
 * (별도 `regenerate` route 없음, 초안·문단 재생성은 `document-draft.validators`·`.strict()`.)
 */
export async function POST(_req: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = await context.params;

    const data = await listCaseInterviewAnswersService(currentUser, caseId);
    const enriched = await buildGongbuhoAwareSummaryGeneratePayload(caseId, {
      legacy: data.summary,
      answers: data.answers,
    });

    const overview = sanitizeLegalOverclaim(enriched.flat.caseOverview);
    const contractSections = enriched.contractSections?.map((s) => ({
      heading: s.heading,
      body: sanitizeLegalOverclaim(s.body),
    }));

    return ok({
      summary: {
        generatedAt: new Date().toISOString(),
        outputContractApplied: enriched.outputContractApplied,
        gongbuhoResolution: enriched.gongbuhoResolution,
        content: {
          caseOverview: overview,
          timeline: enriched.flat.timeline,
          issues: enriched.flat.issues,
          riskNotes: enriched.flat.riskNotes,
          checklist: enriched.flat.checklist,
          contractSections,
          structuredSummaryNote: enriched.outputContractApplied
            ? AI_NOT_FINAL_JUDGMENT_NOTE
            : undefined,
          disclaimer: SUMMARY_DISCLAIMER,
        },
        disclaimerApplied: true,
        caseStatus: data.case.status,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
