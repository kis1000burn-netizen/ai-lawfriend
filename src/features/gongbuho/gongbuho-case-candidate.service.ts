import { prisma } from "@/lib/prisma";

/** Phase 3-B `DUPLICATE_SCAN_LIMIT` 과 동일한 definitionJson 역스캔 상한 */
const QUESTION_SET_GONGBUHO_ENVELOPE_SCAN_LIMIT = 800;

export type CaseGongbuhoCandidateSelectionPolicy =
  | "AUTO_IF_SINGLE_APPROVED"
  | "REQUIRE_CODE_VERSION_IF_MULTIPLE"
  | "NO_APPROVED_PACKET";

/** 카테고리 없음 등으로 후보를 만들 수 없을 때 부가 코드(HTTP 400 아님) */
export type GongbuhoCandidatesResolutionReason = "CASE_TYPE_REQUIRED";

export type GongbuhoCandidateItem = {
  id: string;
  code: string;
  version: string;
  name: string;
  status: "APPROVED";
  questionSetDraftProjected: boolean;
  traceApplied: boolean;
};

export type GongbuhoLatestTraceSummary = {
  id: string;
  gongbuhoPacketId: string;
  code: string;
  version: string;
  createdAt: string;
  humanApprovalStatus: string | null;
  riskFlagsCount: number;
};

export type CaseGongbuhoCandidatesPayload = {
  caseId: string;
  caseType: string | null;
  candidates: GongbuhoCandidateItem[];
  selectionPolicy: CaseGongbuhoCandidateSelectionPolicy;
  resolutionReason?: GongbuhoCandidatesResolutionReason;
  latestTrace: GongbuhoLatestTraceSummary | null;
};

export function normalizeCaseCategoryForGongbuho(
  v: string | null | undefined,
): string | null {
  if (v === undefined || v === null) return null;
  const t = typeof v === "string" ? v.trim() : "";
  return t.length === 0 ? null : t;
}

function riskFlagsCountFromJson(flags: unknown): number {
  return Array.isArray(flags) ? flags.length : 0;
}

/** 최근 저장된 QuestionSet 중 Gongbuho envelope 에 나온 packetId 만 수집 */
export async function collectGongbuhoPacketIdsFromRecentQuestionSets(
  relevantPacketIds: ReadonlySet<string>,
): Promise<Set<string>> {
  if (relevantPacketIds.size === 0) return new Set();

  const rows = await prisma.questionSet.findMany({
    select: { definitionJson: true },
    orderBy: { createdAt: "desc" },
    take: QUESTION_SET_GONGBUHO_ENVELOPE_SCAN_LIMIT,
  });

  const out = new Set<string>();
  for (const row of rows) {
    const j = row.definitionJson as unknown;
    if (j === null || typeof j !== "object" || Array.isArray(j)) continue;
    const root = j as Record<string, unknown>;
    if (root.source !== "GONGBUHO") continue;
    const gh = root.gongbuho;
    if (!gh || typeof gh !== "object" || Array.isArray(gh)) continue;
    const pid = (gh as Record<string, unknown>).packetId;
    if (typeof pid === "string" && relevantPacketIds.has(pid)) out.add(pid);
  }
  return out;
}

/**
 * 사건 카테고리(`Case.category`)로 APPROVED 공부호 후보·선택 정책·최근 Trace 요약 반환.
 * 사건 존재·권한은 라우트에서 선행 처리 권장; 여기서는 `caseId` 행 부재 시 `null`.
 */
export async function getCaseGongbuhoCandidates(
  caseId: string,
): Promise<CaseGongbuhoCandidatesPayload | null> {
  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, category: true },
  });
  if (!c) return null;

  const caseType = normalizeCaseCategoryForGongbuho(c.category);

  let resolutionReason: GongbuhoCandidatesResolutionReason | undefined;

  let approvedRows: { id: string; code: string; version: string; name: string }[];
  if (!caseType) {
    approvedRows = [];
    resolutionReason = "CASE_TYPE_REQUIRED";
  } else {
    approvedRows = await prisma.gongbuhoPacket.findMany({
      where: { status: "APPROVED", caseType },
      orderBy: [{ code: "asc" }, { version: "desc" }],
      select: {
        id: true,
        code: true,
        version: true,
        name: true,
      },
    });
  }

  let selectionPolicy: CaseGongbuhoCandidateSelectionPolicy;
  if (approvedRows.length === 0) {
    selectionPolicy = "NO_APPROVED_PACKET";
  } else if (approvedRows.length === 1) {
    selectionPolicy = "AUTO_IF_SINGLE_APPROVED";
  } else {
    selectionPolicy = "REQUIRE_CODE_VERSION_IF_MULTIPLE";
  }

  const packetIds = new Set(approvedRows.map((p) => p.id));

  const [tracedRows, latestTraceRow, draftPacketIds] = await Promise.all([
    prisma.gongbuhoTrace.findMany({
      where: { caseId },
      select: { gongbuhoPacketId: true },
    }),
    prisma.gongbuhoTrace.findFirst({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        gongbuhoPacketId: true,
        code: true,
        version: true,
        createdAt: true,
        humanApprovalStatus: true,
        riskFlags: true,
      },
    }),
    collectGongbuhoPacketIdsFromRecentQuestionSets(packetIds),
  ]);

  const tracedPacketIds = new Set(tracedRows.map((t) => t.gongbuhoPacketId));

  const latestTrace: GongbuhoLatestTraceSummary | null = latestTraceRow
    ? {
        id: latestTraceRow.id,
        gongbuhoPacketId: latestTraceRow.gongbuhoPacketId,
        code: latestTraceRow.code,
        version: latestTraceRow.version,
        createdAt: latestTraceRow.createdAt.toISOString(),
        humanApprovalStatus: latestTraceRow.humanApprovalStatus,
        riskFlagsCount: riskFlagsCountFromJson(latestTraceRow.riskFlags),
      }
    : null;

  const candidates: GongbuhoCandidateItem[] = approvedRows.map((p) => ({
    id: p.id,
    code: p.code,
    version: p.version,
    name: p.name,
    status: "APPROVED",
    questionSetDraftProjected: draftPacketIds.has(p.id),
    traceApplied: tracedPacketIds.has(p.id),
  }));

  return {
    caseId: c.id,
    caseType,
    candidates,
    selectionPolicy,
    ...(resolutionReason ? { resolutionReason } : {}),
    latestTrace,
  };
}
