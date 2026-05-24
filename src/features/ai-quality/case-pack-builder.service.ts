/**
 * Product Phase 23-C — Case pack builder service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  findInterviewAnswersByCaseId,
  findInterviewCompletionByCaseId,
} from "@/features/case-interview/case-interview.repository";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { buildCasePackageDto } from "@/features/case-package/build-case-package-dto";
import type { CasePackageDto } from "@/features/case-package/case-package-dto";
import type { AiEvaluationCasePackType } from "./ai-evaluation-dataset.schema";
import {
  buildCasePackBuilderResult,
  resolveCasePackTypeFromCaseCategory,
} from "./case-pack-builder.policy";
import type { CasePackBuilderResult } from "./case-pack-builder.schema";

export const CASE_PACK_BUILDER_SERVICE_MARKER_PHASE23C =
  "phase23c-case-pack-builder-service" as const;

export type BuiltCasePack = {
  builder: CasePackBuilderResult;
  packageDto: CasePackageDto;
};

async function latestInterviewAnswerRows(caseId: string) {
  const rows = await findInterviewAnswersByCaseId(caseId);
  const byKey = new Map<
    string,
    { questionKey: string; questionLabel: string; answer: string }
  >();
  for (const row of rows) {
    byKey.set(row.questionKey, {
      questionKey: row.questionKey,
      questionLabel: row.questionText,
      answer: row.answerText,
    });
  }
  return [...byKey.values()];
}

export async function buildCasePackForCase(
  currentUser: SessionUser,
  caseId: string,
  packTypeOverride?: AiEvaluationCasePackType,
): Promise<BuiltCasePack> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canRead) {
    throw new NotFoundError();
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      owner: { select: { name: true } },
      attachments: {
        where: { status: "ACTIVE", deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      legalDocuments: {
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: {
          versions: {
            orderBy: { versionNo: "desc" },
            take: 1,
            select: { versionNo: true },
          },
        },
      },
    },
  });

  if (!caseRecord) {
    throw new NotFoundError();
  }

  const packType =
    packTypeOverride ?? resolveCasePackTypeFromCaseCategory(caseRecord.category);

  const builder = buildCasePackBuilderResult({
    caseId,
    packType,
    caseTitle: caseRecord.title,
  });

  const [interviewAnswers, completion] = await Promise.all([
    latestInterviewAnswerRows(caseId),
    findInterviewCompletionByCaseId(caseId),
  ]);

  const packageDto = buildCasePackageDto({
    caseRecord: {
      id: caseRecord.id,
      title: caseRecord.title,
      caseType: caseRecord.category,
      status: caseRecord.status,
      createdAt: caseRecord.createdAt,
      updatedAt: caseRecord.updatedAt,
      clientDisplayName: caseRecord.owner.name,
      opponentDisplayName: caseRecord.opponentName,
      summary: caseRecord.description,
    },
    interview: {
      completed: Boolean(completion),
      answers: interviewAnswers,
    },
    attachments: caseRecord.attachments.map((attachment) => ({
      id: attachment.id,
      filename: attachment.originalName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      category: String(attachment.category),
      uploadedAt: attachment.createdAt,
    })),
    documents: caseRecord.legalDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      status: document.status,
      latestVersionLabel: document.versions[0]
        ? `v${document.versions[0].versionNo}`
        : null,
      approved: document.status === "APPROVED" || document.status === "LOCKED",
      printable: document.status === "APPROVED" || document.status === "LOCKED",
    })),
  });

  return { builder, packageDto };
}
