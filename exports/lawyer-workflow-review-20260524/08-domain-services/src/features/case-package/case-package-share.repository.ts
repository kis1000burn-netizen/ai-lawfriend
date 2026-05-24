import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildCasePackageShareSnapshot } from "./build-case-package-share-snapshot";
import {
  buildCasePackageConsentSnapshot,
  generateCasePackagePublicCode,
  hashOptionalPin,
  issueCasePackageAccessToken,
  resolveCasePackageShareStatus,
} from "./case-package-share-policy-utils";
import {
  DEFAULT_CASE_PACKAGE_DOWNLOAD_PERMISSIONS,
  DEFAULT_CASE_PACKAGE_SHARE_SCOPE,
  type CasePackageDownloadPermissions,
  type CasePackageShareScope,
} from "./case-package-share-policy";

type CreateCasePackageShareInput = {
  caseId: string;
  ownerUserId: string;
  lawyerUserId?: string | null;
  optionalPin?: string | null;
  scope?: Partial<CasePackageShareScope>;
  downloadPermissions?: Partial<CasePackageDownloadPermissions>;
  expiresAt?: Date | string | null;
};

type RequestContext = {
  actorUserId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

const MAX_PUBLIC_CODE_RETRY = 10;

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildShareSelect() {
  return {
    id: true,
    caseId: true,
    ownerUserId: true,
    lawyerUserId: true,
    publicCode: true,
    status: true,
    allowSummary: true,
    allowInterview: true,
    allowAttachmentList: true,
    allowAttachmentDownload: true,
    allowDocumentDraft: true,
    allowPackagePdf: true,
    snapshotSha256: true,
    consentText: true,
    consentedAt: true,
    expiresAt: true,
    revokedAt: true,
    revokeReason: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.CasePackageShareSelect;
}

export async function createCasePackageShare(input: CreateCasePackageShareInput) {
  const caseRecord = await prisma.case.findFirst({
    where: {
      id: input.caseId,
      ownerUserId: input.ownerUserId,
    },
    select: {
      id: true,
    },
  });

  if (!caseRecord) {
    throw new Error("CASE_NOT_FOUND_OR_FORBIDDEN");
  }

  const scope = {
    ...DEFAULT_CASE_PACKAGE_SHARE_SCOPE,
    ...input.scope,
  };

  const downloadPermissions = {
    ...DEFAULT_CASE_PACKAGE_DOWNLOAD_PERMISSIONS,
    ...input.downloadPermissions,
  };

  const accessToken = issueCasePackageAccessToken();
  const optionalPinHash = input.optionalPin
    ? hashOptionalPin(input.optionalPin)
    : null;

  const consentSnapshot = buildCasePackageConsentSnapshot({
    ownerUserId: input.ownerUserId,
    caseId: input.caseId,
    targetLawyerUserId: input.lawyerUserId ?? null,
    scope,
    downloadPermissions,
    expiresAt: input.expiresAt ?? null,
  });

  const { dto: snapshotDto, snapshotSha256 } = await buildCasePackageShareSnapshot(
    input.caseId,
    input.ownerUserId,
  );

  const year = getCurrentYear();

  for (let attempt = 0; attempt < MAX_PUBLIC_CODE_RETRY; attempt += 1) {
    const sequenceSeed = Math.floor(Math.random() * 1_000_000);
    const publicCode = generateCasePackagePublicCode({
      year,
      sequence: sequenceSeed,
    });

    try {
      const share = await prisma.casePackageShare.create({
        data: {
          caseId: input.caseId,
          ownerUserId: input.ownerUserId,
          lawyerUserId: input.lawyerUserId ?? null,
          publicCode,
          accessTokenHash: accessToken.tokenHash,
          optionalPinHash,
          allowSummary: scope.allowSummary,
          allowInterview: scope.allowInterview,
          allowAttachmentList: scope.allowAttachmentList,
          allowAttachmentDownload:
            downloadPermissions.allowAttachmentDownload,
          allowDocumentDraft: scope.allowDocumentDraft,
          allowPackagePdf: downloadPermissions.allowPackagePdf,
          snapshotJson: snapshotDto as unknown as Prisma.InputJsonValue,
          snapshotSha256,
          consentText: consentSnapshot.consentText,
          consentedAt: new Date(consentSnapshot.consentedAt),
          expiresAt: toDate(consentSnapshot.expiresAt),
        },
        select: buildShareSelect(),
      });

      return {
        share,
        plainAccessToken: accessToken.plainToken,
      };
    } catch (error) {
      const maybePrismaError = error as { code?: string };
      if (maybePrismaError.code === "P2002") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("PUBLIC_CODE_GENERATION_FAILED");
}

export async function listCasePackageShares(input: {
  caseId: string;
  ownerUserId: string;
}) {
  return prisma.casePackageShare.findMany({
    where: {
      caseId: input.caseId,
      ownerUserId: input.ownerUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: buildShareSelect(),
  });
}

export async function revokeCasePackageShare(input: {
  caseId: string;
  shareId: string;
  ownerUserId: string;
  reason?: string | null;
}) {
  const share = await prisma.casePackageShare.findFirst({
    where: {
      id: input.shareId,
      caseId: input.caseId,
      ownerUserId: input.ownerUserId,
    },
    select: {
      id: true,
    },
  });

  if (!share) {
    throw new Error("SHARE_NOT_FOUND_OR_FORBIDDEN");
  }

  return prisma.casePackageShare.update({
    where: {
      id: input.shareId,
    },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revokeReason: input.reason ?? "의뢰인 공유 취소",
    },
    select: buildShareSelect(),
  });
}

export async function findShareByPublicCode(publicCode: string) {
  return prisma.casePackageShare.findUnique({
    where: {
      publicCode,
    },
    select: {
      ...buildShareSelect(),
      optionalPinHash: true,
      snapshotJson: true,
      snapshotSha256: true,
      case: {
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function findShareForLawyer(input: {
  shareId: string;
  lawyerUserId: string;
}) {
  return prisma.casePackageShare.findFirst({
    where: {
      id: input.shareId,
      OR: [
        {
          lawyerUserId: input.lawyerUserId,
        },
        {
          lawyerUserId: null,
        },
      ],
    },
    select: {
      ...buildShareSelect(),
      snapshotJson: true,
      snapshotSha256: true,
      case: {
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          attachments: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              sizeBytes: true,
              createdAt: true,
            },
            where: {
              status: "ACTIVE",
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          legalDocuments: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              updatedAt: "desc",
            },
          },
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function logCasePackageAccess(input: {
  shareId: string;
  caseId: string;
  action: "VIEW" | "DOWNLOAD" | "DENIED" | "EXPIRED" | "REVOKED";
  targetType: string;
  targetId?: string | null;
  resultMessage?: string | null;
  context?: RequestContext;
}) {
  return prisma.casePackageAccessLog.create({
    data: {
      shareId: input.shareId,
      caseId: input.caseId,
      actorUserId: input.context?.actorUserId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      ip: input.context?.ip ?? null,
      userAgent: input.context?.userAgent ?? null,
      resultMessage: input.resultMessage ?? null,
    },
  });
}

export function resolveShareStatusForResponse(input: {
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
}) {
  return resolveCasePackageShareStatus(input);
}

export async function listCasePackageAccessLogsForOwner(input: {
  caseId: string;
  shareId: string;
  ownerUserId: string;
}) {
  const share = await prisma.casePackageShare.findFirst({
    where: {
      id: input.shareId,
      caseId: input.caseId,
      ownerUserId: input.ownerUserId,
    },
    select: {
      id: true,
    },
  });

  if (!share) {
    throw new Error("SHARE_NOT_FOUND_OR_FORBIDDEN");
  }

  return prisma.casePackageAccessLog.findMany({
    where: {
      shareId: input.shareId,
      caseId: input.caseId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    select: {
      id: true,
      shareId: true,
      caseId: true,
      actorUserId: true,
      action: true,
      targetType: true,
      targetId: true,
      ip: true,
      userAgent: true,
      resultMessage: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function findShareAttachmentForLawyer(input: {
  shareId: string;
  attachmentId: string;
  lawyerUserId: string;
}) {
  return prisma.casePackageShare.findFirst({
    where: {
      id: input.shareId,
      OR: [
        {
          lawyerUserId: input.lawyerUserId,
        },
        {
          lawyerUserId: null,
        },
      ],
    },
    select: {
      id: true,
      caseId: true,
      publicCode: true,
      status: true,
      expiresAt: true,
      revokedAt: true,
      allowAttachmentList: true,
      allowAttachmentDownload: true,
      case: {
        select: {
          id: true,
          attachments: {
            where: {
              id: input.attachmentId,
            },
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              sizeBytes: true,
              storagePath: true,
            },
            take: 1,
          },
        },
      },
    },
  });
}

export async function findShareForPackagePdf(input: {
  shareId: string;
  actorUserId: string;
  actorMode: "OWNER" | "LAWYER";
}) {
  return prisma.casePackageShare.findFirst({
    where: {
      id: input.shareId,
      ...(input.actorMode === "OWNER"
        ? {
            ownerUserId: input.actorUserId,
          }
        : {
            OR: [
              {
                lawyerUserId: input.actorUserId,
              },
              {
                lawyerUserId: null,
              },
            ],
          }),
    },
    select: {
      ...buildShareSelect(),
      snapshotJson: true,
      snapshotSha256: true,
      case: {
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          attachments: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              sizeBytes: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          legalDocuments: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              updatedAt: "desc",
            },
          },
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

// Admin functions for dashboard/operations view

type AdminCasePackageShareStatusFilter = "ALL" | "ACTIVE" | "EXPIRED" | "REVOKED";

type ListAdminCasePackageSharesInput = {
  status?: AdminCasePackageShareStatusFilter;
  query?: string | null;
  take?: number;
};

function normalizeAdminShareTake(value?: number): number {
  if (!value || !Number.isInteger(value)) {
    return 50;
  }

  return Math.min(Math.max(value, 1), 100);
}

function buildAdminShareWhere(input: ListAdminCasePackageSharesInput) {
  const status = input.status ?? "ALL";
  const query = input.query?.trim();

  return {
    ...(status === "ALL"
      ? {}
      : {
          status,
        }),
    ...(query
      ? {
          OR: [
            {
              publicCode: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              case: {
                title: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              case: {
                category: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              owner: {
                email: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              lawyer: {
                email: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function listAdminCasePackageShares(
  input: ListAdminCasePackageSharesInput = {},
) {
  const take = normalizeAdminShareTake(input.take);

  return prisma.casePackageShare.findMany({
    where: buildAdminShareWhere(input),
    orderBy: {
      createdAt: "desc",
    },
    take,
    select: {
      id: true,
      caseId: true,
      ownerUserId: true,
      lawyerUserId: true,
      publicCode: true,
      status: true,
      allowSummary: true,
      allowInterview: true,
      allowAttachmentList: true,
      allowAttachmentDownload: true,
      allowDocumentDraft: true,
      allowPackagePdf: true,
      snapshotSha256: true,
      consentedAt: true,
      expiresAt: true,
      revokedAt: true,
      revokeReason: true,
      createdAt: true,
      updatedAt: true,
      case: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      lawyer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      accessLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          action: true,
          targetType: true,
          resultMessage: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          accessLogs: true,
        },
      },
    },
  });
}

export async function getAdminCasePackageShareDetail(input: {
  shareId: string;
}) {
  return prisma.casePackageShare.findUnique({
    where: {
      id: input.shareId,
    },
    select: {
      id: true,
      caseId: true,
      ownerUserId: true,
      lawyerUserId: true,
      publicCode: true,
      status: true,
      allowSummary: true,
      allowInterview: true,
      allowAttachmentList: true,
      allowAttachmentDownload: true,
      allowDocumentDraft: true,
      allowPackagePdf: true,
      consentText: true,
      consentedAt: true,
      expiresAt: true,
      revokedAt: true,
      revokeReason: true,
      createdAt: true,
      updatedAt: true,
      case: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      lawyer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      accessLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        select: {
          id: true,
          shareId: true,
          caseId: true,
          actorUserId: true,
          action: true,
          targetType: true,
          targetId: true,
          resultMessage: true,
          createdAt: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });
}
