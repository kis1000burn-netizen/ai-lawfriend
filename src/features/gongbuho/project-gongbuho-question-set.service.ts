import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { createQuestionSet } from "@/features/question-set/question-set.service";
import { projectGongbuhoQuestionFlowToQuestions } from "./project-gongbuho-question-flow";

const DUPLICATE_SCAN_LIMIT = 800;

/** `QuestionSet.definitionJson` 에 기록되는 공부호 유래 블록(카탈로그 스키마와 독립) */
export type GongbuhoQuestionSetProjectionEnvelope = {
  source: "GONGBUHO";
  gongbuho: {
    packetId: string;
    code: string;
    version: string;
    projectedAt: string;
  };
};

export function isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(
  definitionJson: unknown,
  identity: { packetId: string; code: string; version: string },
): boolean {
  if (definitionJson === null || definitionJson === undefined) return false;
  if (typeof definitionJson !== "object" || Array.isArray(definitionJson)) return false;
  const root = definitionJson as Record<string, unknown>;
  if (root.source !== "GONGBUHO") return false;
  const gh = root.gongbuho;
  if (!gh || typeof gh !== "object" || Array.isArray(gh)) return false;
  const g = gh as Record<string, unknown>;
  const gid = g.packetId;
  if (typeof gid === "string" && gid === identity.packetId) return true;
  const gc = g.code;
  const gv = g.version;
  if (typeof gc === "string" && typeof gv === "string") {
    return gc.trim() === identity.code.trim() && gv.trim() === identity.version.trim();
  }
  return false;
}

export async function findExistingQuestionSetForGongbuhoIdentity(
  identity: { packetId: string; code: string; version: string },
): Promise<{ id: string } | null> {
  const rows = await prisma.questionSet.findMany({
    select: { id: true, definitionJson: true },
    orderBy: { createdAt: "desc" },
    take: DUPLICATE_SCAN_LIMIT,
  });
  const hit = rows.find((row) =>
    isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(row.definitionJson, identity),
  );
  return hit ? { id: hit.id } : null;
}

export type ProjectGongbuhoQuestionSetDraftResult = {
  source: "GONGBUHO";
  gongbuhoPacket: { id: string; code: string; version: string };
  questionSet: { id: string; title: string; status: string };
  questions: Awaited<ReturnType<typeof projectGongbuhoQuestionFlowToQuestions>>;
};

export async function projectGongbuhoPacketToQuestionSetDraft(opts: {
  gongbuhoPacketId: string;
}): Promise<ProjectGongbuhoQuestionSetDraftResult> {
  const packet = await prisma.gongbuhoPacket.findUnique({
    where: { id: opts.gongbuhoPacketId },
    select: {
      id: true,
      code: true,
      version: true,
      name: true,
      status: true,
      packetJson: true,
    },
  });

  if (!packet) {
    throw new NotFoundError("공부호 패킷을 찾을 수 없습니다.");
  }

  if (packet.status !== "APPROVED") {
    throw new ValidationError(
      "APPROVED 상태의 공부호만 QuestionSet 초안 저장이 가능합니다.",
      {
        code: "GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET",
      },
    );
  }

  const identity = { packetId: packet.id, code: packet.code, version: packet.version };

  const existing = await findExistingQuestionSetForGongbuhoIdentity(identity);
  if (existing) {
    throw new ConflictError(
      "동일 공부호에서 생성한 QuestionSet 초안이 이미 있습니다.",
      {
        code: "QUESTION_SET_FROM_GONGBUHO_EXISTS",
        existingQuestionSetId: existing.id,
      },
    );
  }

  const questions = projectGongbuhoQuestionFlowToQuestions(packet.packetJson);

  const projectedAt = new Date().toISOString();
  const envelope: GongbuhoQuestionSetProjectionEnvelope = {
    source: "GONGBUHO",
    gongbuho: {
      packetId: packet.id,
      code: packet.code,
      version: packet.version,
      projectedAt,
    },
  };

  const merged = await createQuestionSet({
    name: `${packet.name} · 질문셋 초안`,
    description: `공부호 패킷 ${packet.code} @ ${packet.version} 에서 저장됨.`,
    questions,
    definitionJson: envelope,
    isActive: false,
  });

  const row = await prisma.questionSet.findUniqueOrThrow({
    where: { id: merged.id },
    select: { id: true, name: true, catalogStatus: true },
  });

  return {
    source: "GONGBUHO",
    gongbuhoPacket: { id: packet.id, code: packet.code, version: packet.version },
    questionSet: {
      id: row.id,
      title: row.name,
      status: row.catalogStatus,
    },
    questions,
  };
}
