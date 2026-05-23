import {
  VoicePrivacyOpsRequestStatus,
  VoicePrivacyOpsRequestType,
  VoiceTranscriptStatus,
  type Prisma,
  type VoicePrivacyOpsResolutionCode,
} from "@prisma/client";

import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  VOICE_OPS_CONFIRMED_AUTO_PURGE_ALLOWED,
  VOICE_OPS_CONFIRMED_ESCALATION_RESOLUTION,
  VOICE_OPS_DRAFT_PURGE_RESOLUTION,
  canVoiceOpsDraftPurgeForTranscriptStatus,
  isVoicePrivacyOpsTerminalStatus,
} from "@/lib/voice/voice-ops-policy";
import {
  isVoiceTranscriptConfirmedRetained,
  isVoiceTranscriptDraftCleanupEligible,
} from "@/lib/voice/voice-transcript-policy";

/** Phase 7-A — 라우트·검증 스크립트 정적 마커 */
export const VOICE_PHASE7A_OPS_SERVICE_MARKER = "phase7a-voice-ops-e2e-hardening";

const transcriptOpsSelect = {
  id: true,
  caseId: true,
  questionKey: true,
  status: true,
  createdByUserId: true,
  interviewId: true,
  storeOriginalAudio: true,
  expiresAt: true,
  confirmedAt: true,
  rejectedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { traces: true } },
} satisfies Prisma.VoiceTranscriptSelect;

export type VoiceTranscriptOpsRow = {
  id: string;
  caseId: string;
  questionKey: string;
  status: VoiceTranscriptStatus;
  createdByUserId: string;
  interviewId: string | null;
  storeOriginalAudio: boolean;
  expiresAt: string | null;
  confirmedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  traceCount: number;
  ttlOverdue: boolean;
};

function mapTranscriptOpsRow(
  row: Prisma.VoiceTranscriptGetPayload<{ select: typeof transcriptOpsSelect }>,
  now: Date,
): VoiceTranscriptOpsRow {
  const ttlOverdue =
    row.expiresAt != null &&
    row.expiresAt.getTime() < now.getTime() &&
    isVoiceTranscriptDraftCleanupEligible(row.status);

  return {
    id: row.id,
    caseId: row.caseId,
    questionKey: row.questionKey,
    status: row.status,
    createdByUserId: row.createdByUserId,
    interviewId: row.interviewId,
    storeOriginalAudio: row.storeOriginalAudio,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    traceCount: row._count.traces,
    ttlOverdue,
  };
}

export type VoiceTranscriptOpsSummary = {
  total: number;
  byStatus: Record<VoiceTranscriptStatus, number>;
  ttlOverdueCount: number;
  openPrivacyOpsCount: number;
};

export async function getVoiceTranscriptOpsSummary(): Promise<VoiceTranscriptOpsSummary> {
  const now = new Date();

  const [statusGroups, ttlOverdueCount, openPrivacyOpsCount] = await Promise.all([
    prisma.voiceTranscript.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.voiceTranscript.count({
      where: {
        expiresAt: { lt: now },
        status: { in: ["CAPTURED", "NEEDS_CONFIRMATION", "REJECTED"] },
      },
    }),
    prisma.voicePrivacyOpsRequest.count({
      where: { status: { in: ["OPEN", "IN_REVIEW"] } },
    }),
  ]);

  const byStatus: Record<VoiceTranscriptStatus, number> = {
    CAPTURED: 0,
    NEEDS_CONFIRMATION: 0,
    CONFIRMED: 0,
    REJECTED: 0,
  };

  let total = 0;
  for (const group of statusGroups) {
    byStatus[group.status] = group._count._all;
    total += group._count._all;
  }

  return {
    total,
    byStatus,
    ttlOverdueCount,
    openPrivacyOpsCount,
  };
}

export async function listVoiceTranscriptOpsRows(input?: {
  status?: VoiceTranscriptStatus;
  ttlOverdueOnly?: boolean;
  limit?: number;
}): Promise<VoiceTranscriptOpsRow[]> {
  const now = new Date();
  const limit = input?.limit ?? 50;

  const where: Prisma.VoiceTranscriptWhereInput = {};
  if (input?.status) {
    where.status = input.status;
  }
  if (input?.ttlOverdueOnly) {
    where.expiresAt = { lt: now };
    where.status = { in: ["CAPTURED", "NEEDS_CONFIRMATION", "REJECTED"] };
  }

  const rows = await prisma.voiceTranscript.findMany({
    where,
    orderBy: [{ expiresAt: "asc" }, { updatedAt: "desc" }],
    take: limit,
    select: transcriptOpsSelect,
  });

  return rows.map((row) => mapTranscriptOpsRow(row, now));
}

const privacyOpsSelect = {
  id: true,
  caseId: true,
  voiceTranscriptId: true,
  requestType: true,
  status: true,
  requesterChannel: true,
  requesterNote: true,
  opsNotes: true,
  resolutionCode: true,
  evidenceTag: true,
  createdByUserId: true,
  assignedToUserId: true,
  resolvedAt: true,
  resolvedByUserId: true,
  createdAt: true,
  updatedAt: true,
  voiceTranscript: { select: { status: true, questionKey: true } },
} satisfies Prisma.VoicePrivacyOpsRequestSelect;

export type VoicePrivacyOpsRequestRow = Prisma.VoicePrivacyOpsRequestGetPayload<{
  select: typeof privacyOpsSelect;
}>;

export async function listVoicePrivacyOpsRequests(input?: {
  status?: VoicePrivacyOpsRequestStatus;
  requestType?: VoicePrivacyOpsRequestType;
  caseId?: string;
  limit?: number;
}): Promise<VoicePrivacyOpsRequestRow[]> {
  const where: Prisma.VoicePrivacyOpsRequestWhereInput = {};
  if (input?.status) where.status = input.status;
  if (input?.requestType) where.requestType = input.requestType;
  if (input?.caseId) where.caseId = input.caseId;

  return prisma.voicePrivacyOpsRequest.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: input?.limit ?? 50,
    select: privacyOpsSelect,
  });
}

export async function getVoicePrivacyOpsRequestById(
  requestId: string,
): Promise<VoicePrivacyOpsRequestRow> {
  const row = await prisma.voicePrivacyOpsRequest.findUnique({
    where: { id: requestId },
    select: privacyOpsSelect,
  });
  if (!row) {
    throw new NotFoundError("Voice 개인정보 운영 요청을 찾을 수 없습니다.");
  }
  return row;
}

export type CreateVoicePrivacyOpsRequestInput = {
  caseId: string;
  voiceTranscriptId?: string | null;
  requestType: "DELETION" | "CORRECTION" | "STT_COMPLAINT";
  requesterChannel?: string | null;
  requesterNote: string;
  evidenceTag?: string | null;
};

export async function createVoicePrivacyOpsRequest(
  user: SessionUser,
  input: CreateVoicePrivacyOpsRequestInput,
) {
  const caseRow = await prisma.case.findUnique({
    where: { id: input.caseId },
    select: { id: true },
  });
  if (!caseRow) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  if (input.voiceTranscriptId) {
    const transcript = await prisma.voiceTranscript.findFirst({
      where: { id: input.voiceTranscriptId, caseId: input.caseId },
      select: { id: true },
    });
    if (!transcript) {
      throw new ValidationError("해당 사건에 속하지 않는 transcript ID입니다.", {
        code: "VOICE_OPS_TRANSCRIPT_CASE_MISMATCH",
      });
    }
  }

  return prisma.voicePrivacyOpsRequest.create({
    data: {
      caseId: input.caseId,
      voiceTranscriptId: input.voiceTranscriptId ?? null,
      requestType: input.requestType,
      requesterChannel: input.requesterChannel?.trim() || null,
      requesterNote: input.requesterNote.trim(),
      evidenceTag: input.evidenceTag?.trim() || null,
      createdByUserId: user.id,
    },
    select: privacyOpsSelect,
  });
}

function assertResolutionAllowed(input: {
  requestType: CreateVoicePrivacyOpsRequestInput["requestType"];
  resolutionCode: VoicePrivacyOpsResolutionCode | null | undefined;
  transcriptStatus: VoiceTranscriptStatus | null | undefined;
}) {
  if (!input.resolutionCode) return;

  if (input.resolutionCode === VOICE_OPS_DRAFT_PURGE_RESOLUTION) {
    if (!input.transcriptStatus || !canVoiceOpsDraftPurgeForTranscriptStatus(input.transcriptStatus)) {
      throw new ValidationError("CONFIRMED transcript는 자동 purge 대상이 아닙니다.", {
        code: "VOICE_OPS_CONFIRMED_PURGE_BLOCKED",
        details: { confirmedAutoPurgeAllowed: VOICE_OPS_CONFIRMED_AUTO_PURGE_ALLOWED },
      });
    }
  }

  if (
    input.transcriptStatus &&
    isVoiceTranscriptConfirmedRetained(input.transcriptStatus) &&
    input.requestType === "DELETION" &&
    input.resolutionCode !== VOICE_OPS_CONFIRMED_ESCALATION_RESOLUTION &&
    input.resolutionCode !== "METADATA_ONLY_CLOSED" &&
    input.resolutionCode !== "REQUEST_REJECTED"
  ) {
    throw new ValidationError("CONFIRMED transcript 삭제는 변호사/운영 검토 에스컬레이션만 허용됩니다.", {
      code: "VOICE_OPS_CONFIRMED_DELETION_ESCALATION_ONLY",
    });
  }
}

export type UpdateVoicePrivacyOpsRequestInput = {
  status?: VoicePrivacyOpsRequestStatus;
  assignedToUserId?: string | null;
  opsNotes?: string | null;
  resolutionCode?: VoicePrivacyOpsResolutionCode | null;
  evidenceTag?: string | null;
};

export async function updateVoicePrivacyOpsRequest(
  user: SessionUser,
  requestId: string,
  input: UpdateVoicePrivacyOpsRequestInput,
) {
  const existing = await prisma.voicePrivacyOpsRequest.findUnique({
    where: { id: requestId },
    include: {
      voiceTranscript: { select: { id: true, status: true } },
    },
  });
  if (!existing) {
    throw new NotFoundError("Voice 개인정보 운영 요청을 찾을 수 없습니다.");
  }

  if (isVoicePrivacyOpsTerminalStatus(existing.status) && input.status && input.status !== existing.status) {
    throw new ValidationError("종료된 요청의 상태는 변경할 수 없습니다.", {
      code: "VOICE_OPS_REQUEST_TERMINAL",
    });
  }

  const nextStatus = input.status ?? existing.status;
  const nextResolution = input.resolutionCode !== undefined ? input.resolutionCode : existing.resolutionCode;

  if (nextStatus === "RESOLVED" && !nextResolution) {
    throw new ValidationError("RESOLVED 처리 시 resolutionCode가 필요합니다.", {
      code: "VOICE_OPS_RESOLUTION_REQUIRED",
    });
  }

  assertResolutionAllowed({
    requestType: existing.requestType,
    resolutionCode: nextResolution,
    transcriptStatus: existing.voiceTranscript?.status,
  });

  const shouldPurgeDraft =
    nextStatus === "RESOLVED" && nextResolution === VOICE_OPS_DRAFT_PURGE_RESOLUTION;

  return prisma.$transaction(async (tx) => {
    if (shouldPurgeDraft && existing.voiceTranscriptId) {
      const transcript = await tx.voiceTranscript.findUnique({
        where: { id: existing.voiceTranscriptId },
        select: { id: true, status: true },
      });
      if (transcript && canVoiceOpsDraftPurgeForTranscriptStatus(transcript.status)) {
        await tx.voiceTranscript.delete({ where: { id: transcript.id } });
      }
    }

    return tx.voicePrivacyOpsRequest.update({
      where: { id: requestId },
      data: {
        status: input.status,
        assignedToUserId: input.assignedToUserId,
        opsNotes: input.opsNotes !== undefined ? input.opsNotes : undefined,
        resolutionCode: input.resolutionCode !== undefined ? input.resolutionCode : undefined,
        evidenceTag: input.evidenceTag !== undefined ? input.evidenceTag : undefined,
        resolvedAt:
          nextStatus === "RESOLVED" || nextStatus === "REJECTED"
            ? new Date()
            : input.status && !isVoicePrivacyOpsTerminalStatus(nextStatus)
              ? null
              : undefined,
        resolvedByUserId:
          nextStatus === "RESOLVED" || nextStatus === "REJECTED" ? user.id : undefined,
      },
      select: privacyOpsSelect,
    });
  });
}

/** Ops 응답 직렬화 — draftText 등 본문 필드가 없음을 테스트·검증용으로 노출. */
export function serializeVoiceTranscriptOpsRowForApi(row: VoiceTranscriptOpsRow) {
  return row;
}
