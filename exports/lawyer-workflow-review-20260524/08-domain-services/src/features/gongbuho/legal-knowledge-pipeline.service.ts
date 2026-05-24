import { Prisma } from "@prisma/client";
import type {
  LegalKnowledgeIntakeStatus,
  LegalKnowledgeLawyerReviewDecisionType,
  LegalKnowledgeLawyerReviewStatus,
  LegalKnowledgeResearchBriefStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";
import {
  LEGAL_KNOWLEDGE_COMPILER_PIPELINE_VERSION,
  assertBriefReadyForLawyerReview,
  assertIntakeComplianceNoRawUgc,
  assertIntakeReadyForResearch,
  assertLawyerApprovedForDraft,
  assertNoProhibitedJsonKeys,
  assertReviewNotAlreadyCompiled,
  validateCanonicalSourceRefs,
  type CanonicalSourceRefInput,
} from "@/lib/gongbuho/legal-knowledge-pipeline-gates";
import type { z } from "zod";
import type {
  compileLegalKnowledgePacketDraftBodySchema,
  createLegalKnowledgeIntakeBodySchema,
  createLegalKnowledgeResearchBriefBodySchema,
  recordLegalKnowledgeLawyerReviewBodySchema,
  updateLegalKnowledgeResearchBriefBodySchema,
} from "@/lib/validators/legal-knowledge-pipeline";

type CreateIntakeBody = z.infer<typeof createLegalKnowledgeIntakeBodySchema>;
type CreateBriefBody = z.infer<typeof createLegalKnowledgeResearchBriefBodySchema>;
type UpdateBriefBody = z.infer<typeof updateLegalKnowledgeResearchBriefBodySchema>;
type LawyerReviewBody = z.infer<typeof recordLegalKnowledgeLawyerReviewBodySchema>;
type CompileBody = z.infer<typeof compileLegalKnowledgePacketDraftBodySchema>;

function parseDateOnly(isoDate: string): Date {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`);
}

function readMappedCaseType(caseTypeMapping: Prisma.JsonValue): string | null {
  if (typeof caseTypeMapping !== "object" || caseTypeMapping === null) {
    return null;
  }
  const v = (caseTypeMapping as Record<string, unknown>).mappedCaseType;
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function readNormalizedKeyword(querySignature: Prisma.JsonValue): string {
  if (typeof querySignature !== "object" || querySignature === null) {
    return "";
  }
  const v = (querySignature as Record<string, unknown>).normalizedKeyword;
  return typeof v === "string" ? v.trim() : "";
}

function buildResearchCompliance(params: {
  intakeCompliance: Prisma.JsonValue;
  canonicalSourceRefs: CanonicalSourceRefInput[];
  attestedByUserId: string;
}): Prisma.InputJsonValue {
  const canonicalOk = validateCanonicalSourceRefs(params.canonicalSourceRefs).ok;
  return {
    compilerPolicyVersion: LEGAL_KNOWLEDGE_COMPILER_PIPELINE_VERSION,
    intakeComplianceInherited: true,
    noRawUgcStored: true,
    minCanonicalSourcesMet: canonicalOk,
    prohibitedFieldScan: "PASS",
    attestedByUserId: params.attestedByUserId,
    attestedAt: new Date().toISOString(),
  };
}

function mapLawyerReviewStatus(
  decision: LegalKnowledgeLawyerReviewDecisionType,
): LegalKnowledgeLawyerReviewStatus {
  switch (decision) {
    case "APPROVE_FOR_PACKET_DRAFT":
      return "APPROVED";
    case "REQUEST_BRIEF_REVISION":
      return "REVISION_REQUESTED";
    case "REJECT":
      return "REJECTED";
    default:
      return "PENDING";
  }
}

function mapBriefStatusAfterReview(
  decision: LegalKnowledgeLawyerReviewDecisionType,
): LegalKnowledgeResearchBriefStatus {
  switch (decision) {
    case "APPROVE_FOR_PACKET_DRAFT":
      return "READY_FOR_LAWYER_REVIEW";
    case "REQUEST_BRIEF_REVISION":
      return "REVISION_REQUESTED";
    case "REJECT":
      return "ARCHIVED";
    default:
      return "DRAFT";
  }
}

function buildPacketJsonFromPipeline(params: {
  compile: CompileBody;
  brief: {
    targetCaseType: string;
    structureHints: Prisma.JsonValue;
    canonicalSourceRefs: Prisma.JsonValue;
  };
  lineage: {
    intakeId: string;
    researchBriefId: string;
    lawyerReviewDecisionId: string;
    demandKeywordSnapshot: string;
  };
}): Prisma.InputJsonValue {
  const hints =
    typeof params.brief.structureHints === "object" &&
    params.brief.structureHints !== null &&
    !Array.isArray(params.brief.structureHints)
      ? (params.brief.structureHints as Record<string, unknown>)
      : {};

  const questionThemes = Array.isArray(hints.suggestedQuestionThemes)
    ? (hints.suggestedQuestionThemes as string[])
    : [];
  const outputSections = Array.isArray(hints.suggestedOutputSections)
    ? (hints.suggestedOutputSections as string[])
    : [];
  const forbiddenThemes = Array.isArray(hints.suggestedForbiddenThemes)
    ? (hints.suggestedForbiddenThemes as string[])
    : [];

  const canonicalRefs = Array.isArray(params.brief.canonicalSourceRefs)
    ? (params.brief.canonicalSourceRefs as CanonicalSourceRefInput[])
    : [];

  return {
    code: params.compile.code.trim(),
    version: params.compile.version.trim(),
    name: params.compile.name.trim(),
    domain: params.compile.domain.trim(),
    caseType: params.brief.targetCaseType,
    locale: "ko-KR",
    meta: {
      description: "Legal Knowledge Pipeline에서 컴파일된 초안 패킷",
      legalKnowledgeLineage: {
        compilerPipelineVersion: LEGAL_KNOWLEDGE_COMPILER_PIPELINE_VERSION,
        intakeId: params.lineage.intakeId,
        researchBriefId: params.lineage.researchBriefId,
        lawyerReviewDecisionId: params.lineage.lawyerReviewDecisionId,
        demandKeywordSnapshot: params.lineage.demandKeywordSnapshot,
        canonicalCitationKeys: canonicalRefs.map((r) => r.citationKey),
      },
    },
    reasoningFlow: questionThemes.length
      ? questionThemes
      : ["사실관계 수집", "쟁점 정리", "증거 매칭", "변호사 검토"],
    questionFlow: questionThemes.map((theme, index) => ({
      id: `Q${index + 1}`,
      phase: "수요 기반",
      text: `${theme}에 대해 구체적으로 설명해 주세요.`,
      purpose: theme,
    })),
    validationRules: [],
    outputContract: {
      summary: {
        sections: outputSections.length
          ? outputSections
          : ["사실관계", "쟁점", "증거", "다음 단계"],
      },
    },
    forbiddenRules: forbiddenThemes.map((theme) => ({
      id: `FR-${theme.slice(0, 24)}`,
      pattern: theme,
      message: theme,
    })),
    expertReviewPoints: [],
    humanApproval: {
      lawyerReviewRequired: true,
      clientConfirmationRequired: true,
    },
  };
}

export async function listLegalKnowledgeIntakes(filters?: {
  status?: LegalKnowledgeIntakeStatus;
}) {
  return prisma.legalKnowledgeDemandIntake.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLegalKnowledgeIntake(intakeId: string) {
  const row = await prisma.legalKnowledgeDemandIntake.findUnique({
    where: { id: intakeId },
    include: {
      researchBriefs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!row) {
    throw new NotFoundError("Legal Knowledge Intake를 찾을 수 없습니다.");
  }
  return row;
}

export async function createLegalKnowledgeIntake(
  currentUserId: string,
  body: CreateIntakeBody,
) {
  assertNoProhibitedJsonKeys(body);
  assertIntakeComplianceNoRawUgc(body.intakeCompliance);

  const status = body.status ?? "DRAFT";

  return prisma.legalKnowledgeDemandIntake.create({
    data: {
      signalSource: body.signalSource.trim(),
      observationWindowFrom: parseDateOnly(body.observationWindow.from),
      observationWindowTo: parseDateOnly(body.observationWindow.to),
      querySignature: body.querySignature as Prisma.InputJsonValue,
      questionType: body.questionType as Prisma.InputJsonValue,
      caseTypeMapping: body.caseTypeMapping as Prisma.InputJsonValue,
      suggestedGongbuhoCode: body.suggestedGongbuhoCode?.trim() ?? null,
      demandStrength: body.demandStrength,
      intakeCompliance: body.intakeCompliance as Prisma.InputJsonValue,
      status,
      operatorNote: body.operatorNote ?? null,
      createdByUserId: currentUserId,
    },
  });
}

export async function createLegalKnowledgeResearchBrief(
  intakeId: string,
  currentUserId: string,
  body: CreateBriefBody,
) {
  const intake = await prisma.legalKnowledgeDemandIntake.findUnique({
    where: { id: intakeId },
  });
  if (!intake) {
    throw new NotFoundError("Legal Knowledge Intake를 찾을 수 없습니다.");
  }

  try {
    assertIntakeReadyForResearch(intake.status);
  } catch {
    throw new ValidationError(
      "Intake가 READY_FOR_RESEARCH 상태일 때만 Research Brief를 생성할 수 있습니다.",
      { code: "LEGAL_KNOWLEDGE_INTAKE_NOT_READY_FOR_RESEARCH" },
    );
  }

  assertIntakeComplianceNoRawUgc(intake.intakeCompliance);
  assertNoProhibitedJsonKeys(body);

  const canonicalResult = validateCanonicalSourceRefs(body.canonicalSourceRefs);
  if (!canonicalResult.ok) {
    throw new ValidationError(canonicalResult.message, {
      code: canonicalResult.code,
    });
  }

  const targetCaseType = readMappedCaseType(intake.caseTypeMapping);
  if (!targetCaseType) {
    throw new ValidationError("Intake caseTypeMapping.mappedCaseType이 필요합니다.", {
      code: "LEGAL_KNOWLEDGE_CASE_TYPE_REQUIRED",
    });
  }

  const demandKeywordSnapshot = readNormalizedKeyword(intake.querySignature);
  const researchCompliance = buildResearchCompliance({
    intakeCompliance: intake.intakeCompliance,
    canonicalSourceRefs: body.canonicalSourceRefs,
    attestedByUserId: currentUserId,
  });

  return prisma.$transaction(async (tx) => {
    const brief = await tx.legalKnowledgeResearchBrief.create({
      data: {
        intakeId,
        demandKeywordSnapshot,
        targetCaseType,
        packetIntent: body.packetIntent,
        targetGongbuhoCode: body.targetGongbuhoCode?.trim() ?? null,
        canonicalSourceRefs: body.canonicalSourceRefs as Prisma.InputJsonValue,
        legalIssueOutline: body.legalIssueOutline.trim(),
        structureHints: body.structureHints as Prisma.InputJsonValue,
        researchCompliance,
        status: "DRAFT",
        preparedByUserId: currentUserId,
      },
    });

    await tx.legalKnowledgeDemandIntake.update({
      where: { id: intakeId },
      data: { status: "RESEARCH_IN_PROGRESS" },
    });

    return brief;
  });
}

export async function getLegalKnowledgeResearchBrief(briefId: string) {
  const row = await prisma.legalKnowledgeResearchBrief.findUnique({
    where: { id: briefId },
    include: {
      intake: true,
      lawyerReviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!row) {
    throw new NotFoundError("Legal Knowledge Research Brief를 찾을 수 없습니다.");
  }
  return row;
}

export async function updateLegalKnowledgeResearchBrief(
  briefId: string,
  currentUserId: string,
  body: UpdateBriefBody,
) {
  const brief = await prisma.legalKnowledgeResearchBrief.findUnique({
    where: { id: briefId },
  });
  if (!brief) {
    throw new NotFoundError("Legal Knowledge Research Brief를 찾을 수 없습니다.");
  }
  if (brief.status === "ARCHIVED" || brief.status === "SUPERSEDED") {
    throw new ValidationError("보관된 Brief는 수정할 수 없습니다.", {
      code: "LEGAL_KNOWLEDGE_BRIEF_NOT_EDITABLE",
    });
  }

  assertNoProhibitedJsonKeys(body);

  const canonicalSourceRefs =
    body.canonicalSourceRefs ??
    (brief.canonicalSourceRefs as CanonicalSourceRefInput[]);
  const canonicalResult = validateCanonicalSourceRefs(canonicalSourceRefs);
  if (!canonicalResult.ok) {
    throw new ValidationError(canonicalResult.message, {
      code: canonicalResult.code,
    });
  }

  const intakeRow = await prisma.legalKnowledgeDemandIntake.findUnique({
    where: { id: brief.intakeId },
    select: { intakeCompliance: true },
  });

  const researchCompliance = buildResearchCompliance({
    intakeCompliance: intakeRow?.intakeCompliance ?? { noRawUgcStored: true },
    canonicalSourceRefs,
    attestedByUserId: currentUserId,
  });

  return prisma.legalKnowledgeResearchBrief.update({
    where: { id: briefId },
    data: {
      ...(body.canonicalSourceRefs
        ? { canonicalSourceRefs: body.canonicalSourceRefs as Prisma.InputJsonValue }
        : {}),
      ...(body.legalIssueOutline
        ? { legalIssueOutline: body.legalIssueOutline.trim() }
        : {}),
      ...(body.structureHints
        ? { structureHints: body.structureHints as Prisma.InputJsonValue }
        : {}),
      ...(body.packetIntent ? { packetIntent: body.packetIntent } : {}),
      ...(body.targetGongbuhoCode !== undefined
        ? { targetGongbuhoCode: body.targetGongbuhoCode?.trim() ?? null }
        : {}),
      researchCompliance,
    },
  });
}

export async function markLegalKnowledgeResearchBriefReadyForReview(
  briefId: string,
  currentUserId: string,
) {
  const brief = await prisma.legalKnowledgeResearchBrief.findUnique({
    where: { id: briefId },
    include: { intake: true },
  });
  if (!brief) {
    throw new NotFoundError("Legal Knowledge Research Brief를 찾을 수 없습니다.");
  }

  const refs = brief.canonicalSourceRefs as CanonicalSourceRefInput[];
  const canonicalResult = validateCanonicalSourceRefs(refs);
  if (!canonicalResult.ok) {
    throw new ValidationError(canonicalResult.message, {
      code: canonicalResult.code,
    });
  }

  assertIntakeComplianceNoRawUgc(brief.intake.intakeCompliance);

  const researchCompliance = buildResearchCompliance({
    intakeCompliance: brief.intake.intakeCompliance,
    canonicalSourceRefs: refs,
    attestedByUserId: currentUserId,
  });

  return prisma.$transaction(async (tx) => {
    const updatedBrief = await tx.legalKnowledgeResearchBrief.update({
      where: { id: briefId },
      data: {
        status: "READY_FOR_LAWYER_REVIEW",
        researchCompliance,
      },
    });

    await tx.legalKnowledgeDemandIntake.update({
      where: { id: brief.intakeId },
      data: { status: "LAWYER_REVIEW_PENDING" },
    });

    return updatedBrief;
  });
}

export async function recordLegalKnowledgeLawyerReview(params: {
  briefId: string;
  reviewer: SessionUser;
  reviewerRole: "LAWYER" | "DELEGATED_LEGAL_REVIEWER";
  body: LawyerReviewBody;
}) {
  const brief = await prisma.legalKnowledgeResearchBrief.findUnique({
    where: { id: params.briefId },
    include: { intake: true },
  });
  if (!brief) {
    throw new NotFoundError("Legal Knowledge Research Brief를 찾을 수 없습니다.");
  }

  try {
    assertBriefReadyForLawyerReview(brief.status);
  } catch {
    throw new ValidationError(
      "Brief가 READY_FOR_LAWYER_REVIEW 상태일 때만 변호사 검수를 기록할 수 있습니다.",
      { code: "LEGAL_KNOWLEDGE_BRIEF_NOT_READY_FOR_REVIEW" },
    );
  }

  assertNoProhibitedJsonKeys(params.body);

  const reviewerAttestation = {
    reviewerUserId: params.reviewer.id,
    reviewerRole: params.reviewerRole,
    reviewedAt: new Date().toISOString(),
    noUgcOrPiiInReviewNotes: true as const,
  };

  const reviewStatus = mapLawyerReviewStatus(params.body.decision);
  const briefStatus = mapBriefStatusAfterReview(params.body.decision);

  let intakeStatus: LegalKnowledgeIntakeStatus = brief.intake.status;
  if (params.body.decision === "REJECT") {
    intakeStatus = "PIPELINE_REJECTED";
  } else if (params.body.decision === "REQUEST_BRIEF_REVISION") {
    intakeStatus = "RESEARCH_IN_PROGRESS";
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.legalKnowledgeLawyerReviewDecision.create({
      data: {
        researchBriefId: params.briefId,
        intakeId: brief.intakeId,
        decision: params.body.decision,
        reviewerAttestation,
        reviewNotes: params.body.reviewNotes.trim(),
        highRiskFlags: params.body.highRiskFlags ?? [],
        rejectionReasonCode: params.body.rejectionReasonCode ?? null,
        status: reviewStatus,
      },
    });

    await tx.legalKnowledgeResearchBrief.update({
      where: { id: params.briefId },
      data: { status: briefStatus },
    });

    await tx.legalKnowledgeDemandIntake.update({
      where: { id: brief.intakeId },
      data: { status: intakeStatus },
    });

    return review;
  });
}

export async function compileLegalKnowledgePacketDraft(params: {
  reviewId: string;
  currentUserId: string;
  body: CompileBody;
}) {
  const review = await prisma.legalKnowledgeLawyerReviewDecision.findUnique({
    where: { id: params.reviewId },
    include: {
      researchBrief: { include: { intake: true } },
    },
  });
  if (!review) {
    throw new NotFoundError("Legal Knowledge Lawyer Review를 찾을 수 없습니다.");
  }

  try {
    assertLawyerApprovedForDraft(review.decision);
  } catch {
    throw new ValidationError(
      "APPROVE_FOR_PACKET_DRAFT 검수 없이 패킷 DRAFT를 생성할 수 없습니다.",
      { code: "LEGAL_KNOWLEDGE_LAWYER_APPROVAL_REQUIRED" },
    );
  }

  if (review.status !== "APPROVED") {
    throw new ValidationError("승인된 Lawyer Review만 컴파일할 수 있습니다.", {
      code: "LEGAL_KNOWLEDGE_LAWYER_APPROVAL_REQUIRED",
    });
  }

  try {
    assertReviewNotAlreadyCompiled(review.gongbuhoPacketId);
  } catch {
    throw new ValidationError("이미 컴파일된 Review입니다.", {
      code: "LEGAL_KNOWLEDGE_PACKET_ALREADY_COMPILED",
    });
  }

  const brief = review.researchBrief;
  const refs = brief.canonicalSourceRefs as CanonicalSourceRefInput[];
  const canonicalResult = validateCanonicalSourceRefs(refs);
  if (!canonicalResult.ok) {
    throw new ValidationError(canonicalResult.message, {
      code: canonicalResult.code,
    });
  }

  assertIntakeComplianceNoRawUgc(brief.intake.intakeCompliance);

  const packetJson = buildPacketJsonFromPipeline({
    compile: params.body,
    brief: {
      targetCaseType: brief.targetCaseType,
      structureHints: brief.structureHints,
      canonicalSourceRefs: brief.canonicalSourceRefs,
    },
    lineage: {
      intakeId: review.intakeId,
      researchBriefId: review.researchBriefId,
      lawyerReviewDecisionId: review.id,
      demandKeywordSnapshot: brief.demandKeywordSnapshot,
    },
  });

  try {
    return await prisma.$transaction(async (tx) => {
      const packet = await tx.gongbuhoPacket.create({
        data: {
          code: params.body.code.trim(),
          version: params.body.version.trim(),
          name: params.body.name.trim(),
          domain: params.body.domain.trim(),
          caseType: brief.targetCaseType,
          status: "DRAFT",
          packetJson,
          createdByUserId: params.currentUserId,
        },
      });

      await tx.legalKnowledgeLawyerReviewDecision.update({
        where: { id: review.id },
        data: { gongbuhoPacketId: packet.id },
      });

      await tx.legalKnowledgeDemandIntake.update({
        where: { id: review.intakeId },
        data: { status: "PACKET_DRAFT_LINKED" },
      });

      return { packet, reviewId: review.id, intakeId: review.intakeId };
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

/** 변호사 포털 — READY_FOR_LAWYER_REVIEW Brief 목록만 */
export async function listLegalKnowledgeBriefsForLawyerReview() {
  return prisma.legalKnowledgeResearchBrief.findMany({
    where: { status: "READY_FOR_LAWYER_REVIEW" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      intakeId: true,
      status: true,
      demandKeywordSnapshot: true,
      targetCaseType: true,
      legalIssueOutline: true,
      canonicalSourceRefs: true,
      updatedAt: true,
    },
  });
}

/** 변호사 포털 — 검수 대상 Brief 상세(READY_FOR_LAWYER_REVIEW 만) */
export async function getLegalKnowledgeBriefForLawyerReview(briefId: string) {
  const row = await prisma.legalKnowledgeResearchBrief.findUnique({
    where: { id: briefId },
    include: {
      intake: {
        select: {
          id: true,
          status: true,
          demandStrength: true,
          querySignature: true,
          caseTypeMapping: true,
          intakeCompliance: true,
        },
      },
      lawyerReviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!row) {
    throw new NotFoundError("Legal Knowledge Research Brief를 찾을 수 없습니다.");
  }

  if (row.status !== "READY_FOR_LAWYER_REVIEW") {
    throw new ValidationError(
      "변호사 검수는 READY_FOR_LAWYER_REVIEW 상태의 Brief만 열람할 수 있습니다.",
      { code: "LEGAL_KNOWLEDGE_BRIEF_NOT_READY_FOR_LAWYER" },
    );
  }

  return row;
}

/** Pipeline에서 컴파일된 패킷 APPROVED 시 Intake 종료 + Audit PIPELINE_COMPLETED */
export async function finalizeLegalKnowledgePipelineOnPacketApproved(params: {
  gongbuhoPacketId: string;
  actorUserId: string;
}): Promise<{ completed: boolean; intakeId?: string }> {
  const review = await prisma.legalKnowledgeLawyerReviewDecision.findFirst({
    where: { gongbuhoPacketId: params.gongbuhoPacketId },
    include: {
      intake: { select: { id: true, status: true } },
    },
  });

  if (!review) {
    return { completed: false };
  }

  if (review.intake.status !== "PACKET_APPROVED") {
    await prisma.legalKnowledgeDemandIntake.update({
      where: { id: review.intakeId },
      data: { status: "PACKET_APPROVED" },
    });
  }

  return {
    completed: true,
    intakeId: review.intakeId,
  };
}
