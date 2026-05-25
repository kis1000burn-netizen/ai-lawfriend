import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function createLegalReliabilityActionCandidateRepository(input: {
  caseId: string;
  tenantId?: string | null;
  sourcePhase: string;
  sourceType: string;
  sourceId: string;
  actionType: string;
  status: string;
  riskType: string;
  severity: string;
  lawyerFacingTitle: string;
  lawyerFacingReason: string;
  proposedClientRequestTitle: string;
  proposedClientRequestBody: string;
  clientVisibleByDefault: boolean;
  prohibitedClientTextRemoved: boolean;
  requiresLawyerApproval: boolean;
  linkedClaimIds: string[];
  linkedEvidenceIds: string[];
  linkedJudgmentIds: string[];
  createdByUserId?: string | null;
}) {
  return prisma.legalReliabilityActionCandidate.create({
    data: {
      caseId: input.caseId,
      tenantId: input.tenantId ?? null,
      sourcePhase: input.sourcePhase,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      actionType: input.actionType,
      status: input.status,
      riskType: input.riskType,
      severity: input.severity,
      lawyerFacingTitle: input.lawyerFacingTitle,
      lawyerFacingReason: input.lawyerFacingReason,
      proposedClientRequestTitle: input.proposedClientRequestTitle,
      proposedClientRequestBody: input.proposedClientRequestBody,
      clientVisibleByDefault: input.clientVisibleByDefault,
      prohibitedClientTextRemoved: input.prohibitedClientTextRemoved,
      requiresLawyerApproval: input.requiresLawyerApproval,
      linkedClaimIds: input.linkedClaimIds,
      linkedEvidenceIds: input.linkedEvidenceIds,
      linkedJudgmentIds: input.linkedJudgmentIds,
      createdByUserId: input.createdByUserId ?? null,
    },
  });
}

export async function listLegalReliabilityActionCandidatesRepository(caseId: string) {
  return prisma.legalReliabilityActionCandidate.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findLegalReliabilityActionCandidateRepository(candidateId: string) {
  return prisma.legalReliabilityActionCandidate.findUnique({
    where: { id: candidateId },
  });
}

export async function updateLegalReliabilityActionCandidateRepository(input: {
  candidateId: string;
  status: string;
  proposedClientRequestTitle?: string;
  proposedClientRequestBody?: string;
  supplementRequestId?: string | null;
  approvedByUserId?: string | null;
}) {
  const data: Prisma.LegalReliabilityActionCandidateUpdateInput = {
    status: input.status,
  };
  if (input.proposedClientRequestTitle) data.proposedClientRequestTitle = input.proposedClientRequestTitle;
  if (input.proposedClientRequestBody) data.proposedClientRequestBody = input.proposedClientRequestBody;
  if (typeof input.supplementRequestId !== "undefined") {
    data.supplementRequestId = input.supplementRequestId;
  }
  if (typeof input.approvedByUserId !== "undefined") {
    data.approvedByUserId = input.approvedByUserId;
  }

  return prisma.legalReliabilityActionCandidate.update({
    where: { id: input.candidateId },
    data,
  });
}

export async function appendLegalReliabilityActionDecisionLedgerRepository(input: {
  caseId: string;
  tenantId?: string | null;
  actionCandidateId: string;
  decisionType: string;
  decidedByUserId: string;
  decidedByRole: string;
  beforeClientRequestBody?: string | null;
  afterClientRequestBody?: string | null;
  rejectionReason?: string | null;
  deferReason?: string | null;
  sourceRiskRadarSignalId?: string | null;
  linkedClaimIds: string[];
  linkedEvidenceIds: string[];
  linkedJudgmentIds: string[];
}) {
  return prisma.legalReliabilityActionDecisionLedger.create({
    data: {
      caseId: input.caseId,
      tenantId: input.tenantId ?? null,
      actionCandidateId: input.actionCandidateId,
      decisionType: input.decisionType,
      decidedByUserId: input.decidedByUserId,
      decidedByRole: input.decidedByRole,
      beforeClientRequestBody: input.beforeClientRequestBody ?? null,
      afterClientRequestBody: input.afterClientRequestBody ?? null,
      rejectionReason: input.rejectionReason ?? null,
      deferReason: input.deferReason ?? null,
      sourceRiskRadarSignalId: input.sourceRiskRadarSignalId ?? null,
      linkedClaimIds: input.linkedClaimIds,
      linkedEvidenceIds: input.linkedEvidenceIds,
      linkedJudgmentIds: input.linkedJudgmentIds,
    },
  });
}
