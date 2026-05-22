import { computeCasePackageSnapshotSha256 } from "./build-case-package-share-snapshot";
import type { CasePackageDto } from "./case-package-dto";
import type { CasePackagePdfSummaryInput } from "./case-package-pdf-summary";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** DB `snapshotJson` → 복구. 무결성은 `resolveVerifiedCasePackageSnapshot`에서 검증 */
export function parseStoredCasePackageDto(value: unknown): CasePackageDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const packageMeta = value.packageMeta;
  const caseInfo = value.caseInfo;
  const summary = value.summary;
  const interview = value.interview;
  const attachments = value.attachments;
  const documents = value.documents;

  if (!isRecord(packageMeta) || typeof packageMeta.caseId !== "string") {
    return null;
  }
  if (!isRecord(caseInfo) || typeof caseInfo.title !== "string") {
    return null;
  }
  if (
    !isRecord(summary) ||
    typeof summary.shortSummary !== "string"
  ) {
    return null;
  }
  if (
    !isRecord(interview) ||
    typeof interview.completed !== "boolean" ||
    typeof interview.answerCount !== "number" ||
    !Array.isArray(interview.publicSafeAnswers)
  ) {
    return null;
  }
  if (!Array.isArray(attachments) || !Array.isArray(documents)) {
    return null;
  }

  return value as CasePackageDto;
}

export function resolveVerifiedCasePackageSnapshot(
  snapshotJson: unknown,
  snapshotSha256: string | null | undefined,
): CasePackageDto | null {
  if (!snapshotSha256 || snapshotJson == null) {
    return null;
  }

  const parsed = parseStoredCasePackageDto(snapshotJson);
  if (!parsed) {
    return null;
  }

  if (computeCasePackageSnapshotSha256(parsed) !== snapshotSha256) {
    return null;
  }

  return parsed;
}

type SharePermRow = {
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowAttachmentDownload: boolean;
  allowDocumentDraft: boolean;
  allowPackagePdf: boolean;
};

export type CasePackageLawyerLiveCaseSubset = {
  id: string;
  title: string;
  status: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  attachments: Array<{
    id: string;
    originalName: string;
    mimeType: string | null;
    sizeBytes: number | null;
    createdAt: Date;
  }>;
  legalDocuments: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

/** 변호사 `GET …/case-packages/[shareId]` JSON 본문 */
export function buildLawyerCasePackageApiPayload(params: {
  share: Pick<
    SharePermRow,
    | "allowSummary"
    | "allowInterview"
    | "allowAttachmentList"
    | "allowAttachmentDownload"
    | "allowDocumentDraft"
    | "allowPackagePdf"
  > & {
    id: string;
    publicCode: string;
    expiresAt?: Date | string | null;
  };
  owner: { id: string; name?: string | null };
  verifiedSnapshot: CasePackageDto | null;
  liveCase: CasePackageLawyerLiveCaseSubset;
}): {
  package: {
    share: SharePermRow & {
      id: string;
      publicCode: string;
      expiresAt: Date | string | null | undefined;
      snapshotCaptured: boolean;
    };
    case: {
      id: string;
      title: string;
      status: string;
      caseType: string | null;
      summary: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    owner: typeof params.owner;
    attachments: Array<{
      id: string;
      filename: string;
      mimeType?: string | null;
      sizeBytes?: number | null;
      createdAt: string | null;
    }>;
    documents: Array<{
      id: string;
      title: string;
      status: string;
      createdAt?: string | null;
      updatedAt?: string | null;
    }>;
    interview: {
      completed: boolean;
      answerCount: number;
      publicSafeAnswers: CasePackageDto["interview"]["publicSafeAnswers"];
    } | null;
  };
} {
  const dto = params.verifiedSnapshot;
  const summaryFromSnapshot = dto?.summary.shortSummary ?? null;

  const caseTitle = dto?.caseInfo.title ?? params.liveCase.title;
  const caseStatus = dto?.caseInfo.status ?? params.liveCase.status;
  const caseType = dto?.caseInfo.caseType ?? params.liveCase.category;
  const summaryText = dto
    ? summaryFromSnapshot
    : params.liveCase.description;
  const createdAtLive =
    dto?.caseInfo.createdAt ?? params.liveCase.createdAt.toISOString();
  const updatedAtLive =
    dto?.caseInfo.updatedAt ?? params.liveCase.updatedAt.toISOString();

  const attachmentsRaw = dto
    ? dto.attachments.map((a) => ({
        id: a.attachmentId,
        filename: a.filename,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes ?? null,
        createdAt: a.uploadedAt ?? null,
      }))
    : params.liveCase.attachments.map((a) => ({
        id: a.id,
        filename: a.originalName,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        createdAt: a.createdAt.toISOString(),
      }));

  const documentsRaw = dto
    ? dto.documents.map((d) => ({
        id: d.documentId,
        title: d.title,
        status: d.status,
        createdAt: null,
        updatedAt: null as string | null,
      }))
    : params.liveCase.legalDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      }));

  const interviewPayload =
    params.share.allowInterview && dto
      ? {
          completed: dto.interview.completed,
          answerCount: dto.interview.answerCount,
          publicSafeAnswers: dto.interview.publicSafeAnswers,
        }
      : null;

  return {
    package: {
      share: {
        id: params.share.id,
        publicCode: params.share.publicCode,
        expiresAt: params.share.expiresAt,
        snapshotCaptured: Boolean(dto),
        allowSummary: params.share.allowSummary,
        allowInterview: params.share.allowInterview,
        allowAttachmentList: params.share.allowAttachmentList,
        allowAttachmentDownload: params.share.allowAttachmentDownload,
        allowDocumentDraft: params.share.allowDocumentDraft,
        allowPackagePdf: params.share.allowPackagePdf,
      },
      case: {
        id: params.liveCase.id,
        title: caseTitle,
        status: caseStatus,
        caseType,
        summary: params.share.allowSummary ? summaryText : null,
        createdAt: new Date(createdAtLive),
        updatedAt: new Date(updatedAtLive),
      },
      owner: params.owner,
      attachments: params.share.allowAttachmentList ? attachmentsRaw : [],
      documents: params.share.allowDocumentDraft ? documentsRaw : [],
      interview: interviewPayload,
    },
  };
}

export function buildCasePackagePdfInputFromShare(params: {
  share: CasePackagePdfSummaryInput["share"];
  verifiedSnapshot: CasePackageDto | null;
  liveCase: Pick<
    CasePackageLawyerLiveCaseSubset,
    "id" | "title" | "status" | "category" | "description" | "createdAt" | "updatedAt"
  > & {
    attachments: CasePackageLawyerLiveCaseSubset["attachments"];
    legalDocuments: CasePackageLawyerLiveCaseSubset["legalDocuments"];
  };
  owner: CasePackagePdfSummaryInput["owner"];
}): CasePackagePdfSummaryInput {
  const dto = params.verifiedSnapshot;
  const caseRow = params.liveCase;

  if (!dto) {
    return {
      share: params.share,
      case: {
        ...caseRow,
        caseType: caseRow.category,
        summary: caseRow.description,
      },
      owner: params.owner,
      attachments: caseRow.attachments,
      documents: caseRow.legalDocuments,
    };
  }

  const attachmentsPdf = dto.attachments.map((a) => ({
    id: a.attachmentId,
    filename: a.filename,
    originalName: a.filename,
    mimeType: a.mimeType ?? null,
    sizeBytes: a.sizeBytes ?? null,
    createdAt: a.uploadedAt ?? null,
  }));

  const documentsPdf = dto.documents.map((d) => ({
    id: d.documentId,
    title: d.title,
    status: d.status,
    updatedAt: null,
  }));

  return {
    share: params.share,
    case: {
      id: caseRow.id,
      title: dto.caseInfo.title ?? caseRow.title,
      status: dto.caseInfo.status ?? caseRow.status,
      caseType: dto.caseInfo.caseType ?? caseRow.category,
      summary: dto.summary.shortSummary,
      createdAt: dto.caseInfo.createdAt ?? caseRow.createdAt.toISOString(),
      updatedAt: dto.caseInfo.updatedAt ?? caseRow.updatedAt.toISOString(),
    },
    owner: params.owner,
    attachments: attachmentsPdf,
    documents: documentsPdf,
  };
}
