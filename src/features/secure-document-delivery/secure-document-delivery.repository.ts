/**
 * Phase 15-F — Secure document delivery repository.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CaseDocumentDeliveryChannel,
  CaseDocumentDeliveryStatus,
  ExternalMessageStatus,
} from "@prisma/client";

export async function findLegalDocumentForCase(caseId: string, documentId: string) {
  return prisma.legalDocument.findFirst({
    where: { id: documentId, caseId },
    select: {
      id: true,
      title: true,
      status: true,
      body: true,
      paragraphs: {
        orderBy: { displayOrder: "asc" },
        take: 3,
        select: { title: true, content: true },
      },
    },
  });
}

export async function findCaseClientOwner(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, ownerUserId: true, title: true },
  });
}

export async function createCaseSharedDocumentRow(input: {
  caseId: string;
  documentId: string;
  sharedByUserId: string;
  sharedWithClientUserId: string;
  expiresAt: Date;
}) {
  return prisma.caseSharedDocument.create({
    data: {
      caseId: input.caseId,
      documentId: input.documentId,
      sharedByUserId: input.sharedByUserId,
      sharedWithClientUserId: input.sharedWithClientUserId,
      expiresAt: input.expiresAt,
    },
    include: {
      document: { select: { id: true, title: true } },
    },
  });
}

export async function createDocumentDeliveryRow(input: {
  caseId: string;
  sharedDocumentId: string;
  documentId: string;
  recipientClientUserId: string;
  deliveryChannel: CaseDocumentDeliveryChannel;
  deliveryStatus: CaseDocumentDeliveryStatus;
  secureLinkTokenHash: string;
  tokenExpiresAt: Date;
  failureReason?: string | null;
  createdByUserId: string;
  sentAt?: Date | null;
}) {
  return prisma.caseDocumentDelivery.create({
    data: {
      caseId: input.caseId,
      sharedDocumentId: input.sharedDocumentId,
      documentId: input.documentId,
      recipientClientUserId: input.recipientClientUserId,
      deliveryChannel: input.deliveryChannel,
      deliveryStatus: input.deliveryStatus,
      secureLinkTokenHash: input.secureLinkTokenHash,
      tokenExpiresAt: input.tokenExpiresAt,
      failureReason: input.failureReason ?? null,
      createdByUserId: input.createdByUserId,
      sentAt: input.sentAt ?? null,
    },
  });
}

export async function findExternalMessageLogByProviderMessageId(providerMessageId: string) {
  return prisma.externalMessageLog.findFirst({
    where: {
      payloadSummaryJson: {
        path: ["providerMessageId"],
        equals: providerMessageId,
      },
    },
    include: {
      delivery: {
        select: {
          id: true,
          deliveryStatus: true,
          deliveryChannel: true,
          sharedDocumentId: true,
        },
      },
    },
  });
}

export async function updateExternalMessageLogRow(
  logId: string,
  data: {
    status?: ExternalMessageStatus;
    failureReason?: string | null;
    payloadSummaryJson?: Prisma.InputJsonValue;
    sentAt?: Date | null;
  },
) {
  return prisma.externalMessageLog.update({
    where: { id: logId },
    data,
  });
}

export async function createExternalMessageLogRow(input: {
  caseId: string;
  recipientUserId: string;
  deliveryId?: string | null;
  channel: CaseDocumentDeliveryChannel;
  provider?: string;
  templateCode?: string | null;
  payloadSummaryJson: Prisma.InputJsonValue;
  status: ExternalMessageStatus;
  failureReason?: string | null;
  sentAt?: Date | null;
}) {
  return prisma.externalMessageLog.create({
    data: {
      caseId: input.caseId,
      recipientUserId: input.recipientUserId,
      deliveryId: input.deliveryId ?? null,
      channel: input.channel,
      provider: input.provider ?? "STUB",
      templateCode: input.templateCode ?? null,
      payloadSummaryJson: input.payloadSummaryJson,
      status: input.status,
      failureReason: input.failureReason ?? null,
      sentAt: input.sentAt ?? null,
    },
  });
}

export async function findSharedDocumentForCase(caseId: string, shareId: string) {
  return prisma.caseSharedDocument.findFirst({
    where: { id: shareId, caseId },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          body: true,
          paragraphs: {
            orderBy: { displayOrder: "asc" },
            take: 5,
            select: { title: true, content: true },
          },
        },
      },
      deliveries: true,
    },
  });
}

export async function listSharedDocumentsForCommandCenter(caseId: string) {
  return prisma.caseSharedDocument.findMany({
    where: { caseId },
    orderBy: { sharedAt: "desc" },
    take: 20,
    include: {
      document: { select: { id: true, title: true } },
      deliveries: {
        select: {
          id: true,
          deliveryChannel: true,
          deliveryStatus: true,
          sentAt: true,
          viewedAt: true,
        },
      },
    },
  });
}

export async function listShareableDocumentsForCase(caseId: string) {
  return prisma.legalDocument.findMany({
    where: { caseId },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, status: true, type: true },
  });
}

export async function getOrCreateClientNotificationPreference(userId: string) {
  return prisma.clientNotificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function markDeliveryViewed(
  deliveryId: string,
  shareId: string,
  viewedAt: Date,
) {
  await prisma.caseDocumentDelivery.update({
    where: { id: deliveryId },
    data: { deliveryStatus: "VIEWED", viewedAt },
  });
  await prisma.caseSharedDocument.updateMany({
    where: { id: shareId, firstViewedAt: null },
    data: { firstViewedAt: viewedAt },
  });
}

export async function updateDeliveryStatus(
  deliveryId: string,
  data: {
    deliveryStatus: CaseDocumentDeliveryStatus;
    sentAt?: Date | null;
    failureReason?: string | null;
  },
) {
  return prisma.caseDocumentDelivery.update({
    where: { id: deliveryId },
    data,
  });
}

export async function findDeliveryForShareChannel(
  shareId: string,
  channel: CaseDocumentDeliveryChannel,
) {
  return prisma.caseDocumentDelivery.findFirst({
    where: { sharedDocumentId: shareId, deliveryChannel: channel },
    orderBy: { createdAt: "desc" },
  });
}
