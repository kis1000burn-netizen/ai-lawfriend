import { Prisma } from "@prisma/client";
import type { GongbuhoPacketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import type { GongbuhoPacketJsonMin } from "@/lib/validators/gongbuho";
import type { SessionUser } from "@/lib/auth/session";

function normalizeCaseType(v: string | null | undefined): string | null {
  if (v === undefined || v === null) return null;
  const t = typeof v === "string" ? v.trim() : "";
  return t.length === 0 ? null : t;
}

function parseExpertReviewSnap(
  packetJson: Prisma.JsonValue,
): Prisma.InputJsonValue | null {
  if (typeof packetJson !== "object" || packetJson === null) return null;
  const v = (packetJson as Record<string, unknown>).expertReviewPoints;
  return Array.isArray(v) ? (v as Prisma.InputJsonValue) : null;
}

function deriveHumanApprovalStatus(packetJson: Prisma.JsonValue): string | null {
  if (typeof packetJson !== "object" || packetJson === null) return "PENDING";
  const ha = (packetJson as Record<string, unknown>).humanApproval;
  if (typeof ha === "object" && ha !== null && !Array.isArray(ha)) {
    const lawyer = Boolean((ha as Record<string, unknown>).lawyerReviewRequired);
    const client = Boolean(
      (ha as Record<string, unknown>).clientConfirmationRequired,
    );
    if (lawyer || client) return "PENDING";
    return "NOT_REQUIRED";
  }
  return "PENDING";
}

export async function listGongbuhoPacketsForAdmin(filters: {
  status?: GongbuhoPacketStatus;
  code?: string;
  caseType?: string;
}) {
  const where: Prisma.GongbuhoPacketWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.code?.trim()) where.code = filters.code.trim();
  if (filters.caseType?.trim()) where.caseType = filters.caseType.trim();

  return prisma.gongbuhoPacket.findMany({
    where,
    orderBy: [{ code: "asc" }, { version: "desc" }],
    select: {
      id: true,
      code: true,
      version: true,
      name: true,
      domain: true,
      caseType: true,
      status: true,
      approvedAt: true,
      createdByUserId: true,
      approvedByUserId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getGongbuhoPacketDetailForAdmin(gongbuhoId: string) {
  const row = await prisma.gongbuhoPacket.findUnique({
    where: { id: gongbuhoId },
  });
  if (!row) throw new NotFoundError("공부호 패킷을 찾을 수 없습니다.");
  return row;
}

export async function createGongbuhoPacketDraft(
  currentUserId: string,
  parsedPacket: GongbuhoPacketJsonMin,
) {
  const packetJson = parsedPacket as unknown as Prisma.InputJsonValue;

  try {
    return await prisma.gongbuhoPacket.create({
      data: {
        code: parsedPacket.code.trim(),
        version: parsedPacket.version.trim(),
        name: parsedPacket.name.trim(),
        domain: parsedPacket.domain.trim(),
        caseType: normalizeCaseType(parsedPacket.caseType ?? undefined),
        status: "DRAFT",
        packetJson,
        createdByUserId: currentUserId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new ConflictError("동일 code·version 의 공부호가 이미 등록되어 있습니다.", {
        code: "DUPLICATE_PACKET",
      });
    }
    throw e;
  }
}

export async function approveGongbuhoPacket(params: {
  gongbuhoId: string;
  approver: SessionUser;
}) {
  const row = await prisma.gongbuhoPacket.findUnique({
    where: { id: params.gongbuhoId },
  });
  if (!row) throw new NotFoundError("공부호 패킷을 찾을 수 없습니다.");

  if (row.status === "APPROVED") {
    return { packet: row, alreadyApproved: true as const };
  }

  if (row.status === "ARCHIVED") {
    throw new ValidationError("ARCHIVED 상태의 공부호는 승인할 수 없습니다.", {
      code: "GONGBUHO_PACKET_NOT_APPROVABLE",
    });
  }

  if (row.status !== "DRAFT" && row.status !== "REVIEW") {
    throw new ValidationError("승인할 수 있는 상태가 아닙니다.", {
      code: "GONGBUHO_PACKET_NOT_APPROVABLE",
    });
  }

  const updated = await prisma.gongbuhoPacket.update({
    where: { id: params.gongbuhoId },
    data: {
      status: "APPROVED",
      approvedByUserId: params.approver.id,
      approvedAt: new Date(),
    },
  });

  return { packet: updated, alreadyApproved: false as const };
}

export async function archiveGongbuhoPacket(params: {
  gongbuhoId: string;
  actor: SessionUser;
}) {
  void params.actor;

  const row = await prisma.gongbuhoPacket.findUnique({
    where: { id: params.gongbuhoId },
  });
  if (!row) throw new NotFoundError("공부호 패킷을 찾을 수 없습니다.");

  if (row.status === "ARCHIVED") {
    return { packet: row, alreadyArchived: true as const };
  }

  const updated = await prisma.gongbuhoPacket.update({
    where: { id: params.gongbuhoId },
    data: { status: "ARCHIVED" },
  });

  return { packet: updated, alreadyArchived: false as const };
}

export async function findApprovedPacketForApply(params: {
  caseCategory: string | null;
  code?: string;
  version?: string;
}) {
  if (params.code && params.version) {
    const row = await prisma.gongbuhoPacket.findFirst({
      where: {
        code: params.code.trim(),
        version: params.version.trim(),
        status: "APPROVED",
      },
    });
    if (!row) {
      throw new NotFoundError("APPROVED 상태의 해당 공부호를 찾을 수 없습니다.");
    }
    return { packet: row, appliedVia: "explicit" as const };
  }

  const ct = params.caseCategory?.trim();
  if (!ct) {
    throw new ValidationError(
      "사건 카테고리가 없습니다. 적용할 공부호의 code와 version을 요청 본문에 지정하세요.",
      { code: "NO_APPROVED_PACKET_FOR_CASE" },
    );
  }

  const candidates = await prisma.gongbuhoPacket.findMany({
    where: {
      caseType: ct,
      status: "APPROVED",
    },
    orderBy: [{ code: "asc" }, { version: "desc" }],
  });

  if (candidates.length === 0) {
    throw new NotFoundError(
      "사건 카테고리에 맞는 APPROVED 공부호가 없습니다.",
    );
  }

  if (candidates.length > 1) {
    throw new ValidationError(
      "동일 카테고리에 복수의 APPROVED 공부호가 있습니다. code와 version을 지정하세요.",
      {
        code: "AMBIGUOUS_GONGBUHO_PACKET",
        candidates: candidates.map((c) => ({
          id: c.id,
          code: c.code,
          version: c.version,
        })),
      },
    );
  }

  return { packet: candidates[0]!, appliedVia: "caseType" as const };
}

export async function applyGongbuhoToCase(params: {
  caseId: string;
  actorUserId?: string;
  caseSnapshot: {
    category: string | null;
    status: string;
    title: string;
  };
  explicit?: { code: string; version: string };
}) {
  const resolved = await findApprovedPacketForApply({
    caseCategory: params.caseSnapshot.category,
    code: params.explicit?.code,
    version: params.explicit?.version,
  });

  const expertPts = parseExpertReviewSnap(resolved.packet.packetJson);

  const appliedAtIso = new Date().toISOString();

  const trace = await prisma.gongbuhoTrace.create({
    data: {
      caseId: params.caseId,
      gongbuhoPacketId: resolved.packet.id,
      code: resolved.packet.code,
      version: resolved.packet.version,
      inputSnapshot: {
        category: params.caseSnapshot.category,
        status: params.caseSnapshot.status,
        title: params.caseSnapshot.title,
        appliedVia: resolved.appliedVia,
      },
      validationResult: {
        ok: true,
        appliedVia: resolved.appliedVia,
        policy: "APPROVED_ONLY",
        gongbuhoPhase4Flow: {
          applied: {
            traceEvent: "GONGBUHO_APPLIED_TO_CASE" as const,
            actorUserId: params.actorUserId ?? null,
            appliedAtIso,
          },
        },
      },
      riskFlags: [],
      ...(expertPts !== null ? { expertReviewPoints: expertPts } : {}),
      humanApprovalStatus: deriveHumanApprovalStatus(resolved.packet.packetJson),
    },
  });

  return { trace, packet: resolved.packet, appliedVia: resolved.appliedVia };
}

/**
 * 해당 사건·패킷에 대한 최신 `GongbuhoTrace.validationResult.gongbuhoPhase4Flow` 에
 * 인터뷰 바인딩 마커(Phase 4-F)를 병합한다.
 */
export async function mergeLatestGongbuhoTraceInterviewBinding(args: {
  caseId: string;
  gongbuhoPacketId: string;
  actorUserId: string;
  questionSetId: string;
}): Promise<void> {
  const latest = await prisma.gongbuhoTrace.findFirst({
    where: { caseId: args.caseId, gongbuhoPacketId: args.gongbuhoPacketId },
    orderBy: { createdAt: "desc" },
    select: { id: true, validationResult: true },
  });

  if (!latest) return;

  const vrPrev = latest.validationResult;
  const vrObj: Record<string, unknown> =
    typeof vrPrev === "object" && vrPrev !== null && !Array.isArray(vrPrev)
      ? { ...(vrPrev as Record<string, unknown>) }
      : {};

  const prevFlow =
    typeof vrObj.gongbuhoPhase4Flow === "object" &&
    vrObj.gongbuhoPhase4Flow !== null &&
    !Array.isArray(vrObj.gongbuhoPhase4Flow)
      ? { ...(vrObj.gongbuhoPhase4Flow as Record<string, unknown>) }
      : {};

  prevFlow.interviewBound = {
    traceEvent: "GONGBUHO_INTERVIEW_BOUND" as const,
    actorUserId: args.actorUserId,
    questionSetId: args.questionSetId,
    boundAtIso: new Date().toISOString(),
  };
  vrObj.gongbuhoPhase4Flow = prevFlow;

  await prisma.gongbuhoTrace.update({
    where: { id: latest.id },
    data: {
      validationResult: vrObj as Prisma.InputJsonValue,
    },
  });
}

export async function listGongbuhoTracesForCase(caseId: string) {
  return prisma.gongbuhoTrace.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    include: {
      gongbuhoPacket: {
        select: {
          id: true,
          code: true,
          version: true,
          name: true,
          status: true,
          caseType: true,
        },
      },
    },
  });
}
