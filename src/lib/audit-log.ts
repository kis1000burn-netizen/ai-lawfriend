import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redactAuditLogMetadataForPersist } from "@/lib/data-governance/data-redaction.service";

type WriteAuditLogParams = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  message?: string;
  metadata?: unknown;
};

export async function writeAuditLog(params: WriteAuditLogParams) {
  const metadata =
    params.metadata === undefined
      ? undefined
      : redactAuditLogMetadataForPersist(params.metadata);

  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      message: params.message,
      metadata:
        metadata === undefined ? undefined : (metadata as Prisma.InputJsonValue),
    },
  });
}
