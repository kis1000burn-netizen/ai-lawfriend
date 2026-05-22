import { prisma } from "@/lib/prisma";
import { CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE } from "@/features/case-interview/case-interview.repository";

/** 사건 ID별 최신 인터뷰 답변 맵 메모 내용(caseId → content). */
export async function findLatestInterviewAnswersMapMemoByCaseIds(caseIds: string[]) {
  if (caseIds.length === 0) {
    return new Map<string, string>();
  }

  const rows = await prisma.caseTimelineMemo.findMany({
    where: {
      caseId: { in: caseIds },
      noteType: CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: { caseId: true, content: true },
  });

  const map = new Map<string, string>();
  for (const row of rows) {
    if (!map.has(row.caseId)) {
      map.set(row.caseId, row.content);
    }
  }
  return map;
}
