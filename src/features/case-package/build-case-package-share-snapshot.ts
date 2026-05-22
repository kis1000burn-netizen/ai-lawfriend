import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { canonicalStringifyCasePackageSnapshot } from "./canonical-case-package-json";
import {
  findInterviewAnswersByCaseId,
  findInterviewCompletionByCaseId,
} from "@/features/case-interview/case-interview.repository";
import { buildCasePackageDto } from "./build-case-package-dto";
import type { CasePackageDto } from "./case-package-dto";

/** 스냅샷 무결성: `JSON.stringify(buildCasePackageDto 결과)` 바이트 UTF-8 SHA-256 */
export function computeCasePackageSnapshotSha256(dto: CasePackageDto): string {
  return createHash("sha256")
    .update(canonicalStringifyCasePackageSnapshot(dto), "utf8")
    .digest("hex");
}

function latestInterviewAnswerRows(caseId: string) {
  return findInterviewAnswersByCaseId(caseId).then((rows) => {
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
  });
}

/**
 * 의뢰인이 공유를 생성할 때 1회 고정되는 사건 패키지 스냅샷(JSON + 해시).
 * 이후 사건 수정이 있어도 변호사에게 보이는 본 공유건은 생성 시점 기준 유지된다.
 */
export async function buildCasePackageShareSnapshot(
  caseId: string,
  ownerUserId: string,
): Promise<{ dto: CasePackageDto; snapshotSha256: string }> {
  const row = await prisma.case.findFirst({
    where: { id: caseId, ownerUserId },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      opponentName: true,
      createdAt: true,
      updatedAt: true,
      owner: { select: { name: true } },
      attachments: {
        where: { status: "ACTIVE", deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          category: true,
          createdAt: true,
        },
      },
      legalDocuments: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          versions: {
            orderBy: { versionNo: "desc" },
            take: 1,
            select: { versionNo: true, approved: true },
          },
        },
      },
    },
  });

  if (!row) {
    throw new Error("CASE_NOT_FOUND_OR_FORBIDDEN");
  }

  const [interviewAnswers, completion] = await Promise.all([
    latestInterviewAnswerRows(caseId),
    findInterviewCompletionByCaseId(caseId),
  ]);

  const documents = row.legalDocuments.map((doc) => {
    const latest = doc.versions[0];
    return {
      id: doc.id,
      title: doc.title,
      status: doc.status,
      latestVersionLabel: latest ? `v${latest.versionNo}` : null,
      approved: doc.status === "APPROVED" || doc.status === "LOCKED",
      printable: doc.status === "APPROVED" || doc.status === "LOCKED",
      guardrailSummary: null,
    };
  });

  const dto = buildCasePackageDto({
    caseRecord: {
      id: row.id,
      title: row.title,
      caseType: row.category,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      clientDisplayName: row.owner.name,
      opponentDisplayName: row.opponentName,
      summary: row.description,
      detailedSummary: null,
    },
    interview: {
      completed: Boolean(completion),
      answers: interviewAnswers,
    },
    attachments: row.attachments.map((a) => ({
      id: a.id,
      filename: a.originalName,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      category: String(a.category),
      uploadedAt: a.createdAt,
    })),
    documents,
    generatedAt: new Date(),
  });

  dto.packageMeta.packageVersion = "6.2";

  return {
    dto,
    snapshotSha256: computeCasePackageSnapshotSha256(dto),
  };
}
