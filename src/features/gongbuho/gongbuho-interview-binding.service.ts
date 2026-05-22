import type { QuestionSetStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { updateCaseById } from "@/features/cases/case.repository";
import { getCaseGongbuhoCandidates } from "@/features/gongbuho/gongbuho-case-candidate.service";
import { isQuestionSetDefinitionLinkedToSameGongbuhoIdentity } from "@/features/gongbuho/project-gongbuho-question-set.service";
import { getQuestionSetById } from "@/features/question-set/question-set.service";
import type { QuestionSetQuestion } from "@/features/question-set/question-set.types";
import { mergeLatestGongbuhoTraceInterviewBinding } from "@/features/gongbuho/gongbuho-packet.service";

const PUBLISHED_ACTIVE_SCAN_LIMIT = 600;

export type GongbuhoInterviewBindInput =
  | { mode: "auto" }
  | { mode: "explicit"; gongbuhoPacketId: string; questionSetId: string };

export type CaseGongbuhoInterviewPayload =
  | {
      caseId: string;
      bound: false;
    }
  | {
      caseId: string;
      bound: true;
      gongbuhoPacket: {
        id: string;
        code: string;
        version: string;
        name: string | null;
      } | null;
      questionSet: {
        id: string;
        title: string;
        status: QuestionSetStatus;
        isActive: boolean;
      };
      questions: QuestionSetQuestion[];
    };

/** 게시 및 활성 질문셋만 통과(DRAFT·비활성은 인터뷰 불가 — Phase 3-D). */
export function assertQuestionSetOperationalForInterview(row: {
  catalogStatus: QuestionSetStatus;
  isActive: boolean;
}): void {
  if (!row.isActive) {
    throw new ConflictError(
      "질문셋이 활성 상태가 아니어 인터뷰에 연결할 수 없습니다.",
      { code: "GONGBUHO_INTERVIEW_QUESTION_SET_NOT_ACTIVE" },
    );
  }
  if (row.catalogStatus !== "PUBLISHED") {
    throw new ConflictError(
      `질문셋이 게시(PUBLISHED) 상태가 아닙니다. 현재 상태: ${row.catalogStatus}`,
      {
        code: "GONGBUHO_INTERVIEW_QUESTION_SET_NOT_PUBLISHED",
        catalogStatus: row.catalogStatus,
      },
    );
  }
}

async function fetchPublishedActiveQuestionSetsForScan(): Promise<
  Array<{ id: string; definitionJson: unknown }>
> {
  return prisma.questionSet.findMany({
    where: { isActive: true, catalogStatus: "PUBLISHED" },
    orderBy: [{ updatedAt: "desc" }],
    take: PUBLISHED_ACTIVE_SCAN_LIMIT,
    select: { id: true, definitionJson: true },
  });
}

async function findPublishedLinkedQuestionSetsForPacketIdentity(
  identity: Readonly<{ packetId: string; code: string; version: string }>,
): Promise<string[]> {
  const rows = await fetchPublishedActiveQuestionSetsForScan();
  return rows
    .filter((r) =>
      isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(r.definitionJson, identity),
    )
    .map((r) => r.id);
}

export async function bindCaseGongbuhoInterview(
  caseId: string,
  input: GongbuhoInterviewBindInput,
  actorUserId: string,
): Promise<Extract<CaseGongbuhoInterviewPayload, { bound: true }>> {
  if (input.mode === "auto") {
    const cand = await getCaseGongbuhoCandidates(caseId);
    if (!cand) throw new NotFoundError("사건을 찾을 수 없습니다.");
    if (cand.selectionPolicy !== "AUTO_IF_SINGLE_APPROVED") {
      throw new ValidationError(
        "자동 연결은 APPROVED 공부호 후보가 정확히 1건일 때만 가능합니다.",
        {
          code: "GONGBUHO_INTERVIEW_AUTO_UNAVAILABLE",
          selectionPolicy: cand.selectionPolicy,
        },
      );
    }

    const p = cand.candidates[0]!;
    const hits = await findPublishedLinkedQuestionSetsForPacketIdentity({
      packetId: p.id,
      code: p.code,
      version: p.version,
    });

    if (hits.length === 0) {
      throw new ConflictError(
        "해당 공부호에서 생성되어 게시·활성화된 질문셋이 없습니다.",
        { code: "GONGBUHO_INTERVIEW_NO_PUBLISHED_QUESTION_SET" },
      );
    }

    if (hits.length > 1) {
      throw new ConflictError(
        "동일 공부호에 연결 가능한 게시 질문셋이 여러 개입니다. questionSetId를 명시해 주세요.",
        {
          code: "GONGBUHO_INTERVIEW_MULTIPLE_PUBLISHED_QUESTION_SETS",
          questionSetIds: hits,
        },
      );
    }

    await updateCaseById(caseId, { questionSetId: hits[0]! });

    await mergeLatestGongbuhoTraceInterviewBinding({
      caseId,
      gongbuhoPacketId: p.id,
      actorUserId,
      questionSetId: hits[0]!,
    });

    const refreshed = await getCaseGongbuhoInterview(caseId);
    if (!refreshed || refreshed.bound !== true) {
      throw new NotFoundError("연결 결과를 불러오지 못했습니다.");
    }
    return refreshed;
  }

  const packet = await prisma.gongbuhoPacket.findUnique({
    where: { id: input.gongbuhoPacketId },
    select: {
      id: true,
      code: true,
      version: true,
      name: true,
      status: true,
    },
  });
  if (!packet) throw new NotFoundError("공부호 패킷을 찾을 수 없습니다.");
  if (packet.status !== "APPROVED") {
    throw new ValidationError(
      "APPROVED 상태의 공부호만 인터뷰 질문셋 연결이 허용됩니다.",
      { code: "GONGBUHO_INTERVIEW_PACKET_NOT_APPROVED" },
    );
  }

  const qsRow = await prisma.questionSet.findUnique({
    where: { id: input.questionSetId },
    select: {
      id: true,
      catalogStatus: true,
      isActive: true,
      definitionJson: true,
    },
  });
  if (!qsRow) throw new NotFoundError("질문셋을 찾을 수 없습니다.");

  const identity = { packetId: packet.id, code: packet.code, version: packet.version };
  if (!isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(qsRow.definitionJson, identity)) {
    throw new ValidationError(
      "선택한 질문셋은 해당 공부호 패킷의 공부호 envelope(origin)과 일치하지 않습니다.",
      { code: "GONGBUHO_INTERVIEW_QUESTION_SET_NOT_FROM_PACKET" },
    );
  }

  assertQuestionSetOperationalForInterview(qsRow);

  await updateCaseById(caseId, { questionSetId: qsRow.id });

  await mergeLatestGongbuhoTraceInterviewBinding({
    caseId,
    gongbuhoPacketId: packet.id,
    actorUserId,
    questionSetId: qsRow.id,
  });

  const refreshed = await getCaseGongbuhoInterview(caseId);
  if (!refreshed || refreshed.bound !== true) {
    throw new NotFoundError("연결 결과를 불러오지 못했습니다.");
  }
  return refreshed;
}

export async function getCaseGongbuhoInterview(
  caseId: string,
): Promise<CaseGongbuhoInterviewPayload | null> {
  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, questionSetId: true },
  });
  if (!c) return null;

  if (!c.questionSetId) {
    return { caseId: c.id, bound: false };
  }

  const [qsEntity, meta] = await Promise.all([
    getQuestionSetById(c.questionSetId),
    prisma.questionSet.findUnique({
      where: { id: c.questionSetId },
      select: {
        id: true,
        name: true,
        catalogStatus: true,
        isActive: true,
        definitionJson: true,
      },
    }),
  ]);

  if (!qsEntity || !meta) {
    return { caseId: c.id, bound: false };
  }

  let gongbuhoPacket: Extract<
    CaseGongbuhoInterviewPayload,
    { bound: true }
  >["gongbuhoPacket"] = null;

  const gh = extractGongbuhoEnvelope(meta.definitionJson);
  if (gh?.packetId) {
    const p = await prisma.gongbuhoPacket.findUnique({
      where: { id: gh.packetId },
      select: { id: true, code: true, version: true, name: true },
    });
    if (p) {
      gongbuhoPacket = {
        id: p.id,
        code: p.code,
        version: p.version,
        name: p.name ?? null,
      };
    }
  }

  return {
    caseId: c.id,
    bound: true,
    gongbuhoPacket,
    questionSet: {
      id: meta.id,
      title: meta.name,
      status: meta.catalogStatus,
      isActive: meta.isActive,
    },
    questions: qsEntity.questions,
  };
}

function extractGongbuhoEnvelope(
  definitionJson: unknown,
): { packetId: string; code: string; version: string } | null {
  if (definitionJson === null || definitionJson === undefined) return null;
  if (typeof definitionJson !== "object" || Array.isArray(definitionJson)) return null;
  const root = definitionJson as Record<string, unknown>;
  if (root.source !== "GONGBUHO") return null;
  const gh = root.gongbuho;
  if (!gh || typeof gh !== "object" || Array.isArray(gh)) return null;
  const g = gh as Record<string, unknown>;
  const packetId = g.packetId;
  const code = g.code;
  const version = g.version;
  if (
    typeof packetId === "string" &&
    typeof code === "string" &&
    typeof version === "string"
  ) {
    return { packetId: packetId.trim(), code: code.trim(), version: version.trim() };
  }
  return null;
}
