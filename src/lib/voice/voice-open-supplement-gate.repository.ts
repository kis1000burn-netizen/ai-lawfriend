import { SupplementRequestStatus } from "@prisma/client";

import { VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER } from "@/features/voice/voice-lawyer-supplement.service";
import { prisma } from "@/lib/prisma";

/** Phase 5-H-UI-5 — open Supplement ↔ document finalize gate repository 마커 */
export const VOICE_OPEN_SUPPLEMENT_GATE_REPOSITORY_MARKER_PHASE5H_UI_5 =
  "phase5h-ui-5-voice-open-supplement-finalize-gate" as const;

/** document finalize gate 통과로 간주하는 SupplementRequest 종료 상태 */
export const TERMINAL_SUPPLEMENT_REQUEST_STATUSES: SupplementRequestStatus[] = [
  SupplementRequestStatus.ACCEPTED,
  SupplementRequestStatus.CLOSED,
  SupplementRequestStatus.CANCELLED,
  SupplementRequestStatus.EXPIRED,
];

export type OpenVoiceSupplementGateRow = {
  supplementRequestId: string;
  questionKey: string;
  status: SupplementRequestStatus;
};

/** Voice lawyer review 출처 보완(Supplement) 중 미처리 건 */
export async function loadOpenVoiceOriginSupplementsByCaseId(
  caseId: string,
): Promise<OpenVoiceSupplementGateRow[]> {
  const requests = await prisma.supplementRequest.findMany({
    where: {
      caseId,
      isDeleted: false,
      status: { notIn: TERMINAL_SUPPLEMENT_REQUEST_STATUSES },
      items: {
        some: {
          sourceMarker: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
          interviewQuestionKey: { not: null },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      items: {
        where: {
          sourceMarker: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
          interviewQuestionKey: { not: null },
        },
        select: { interviewQuestionKey: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const rows: OpenVoiceSupplementGateRow[] = [];

  for (const request of requests) {
    for (const item of request.items) {
      if (!item.interviewQuestionKey) continue;
      rows.push({
        supplementRequestId: request.id,
        questionKey: item.interviewQuestionKey,
        status: request.status,
      });
    }
  }

  return rows;
}
