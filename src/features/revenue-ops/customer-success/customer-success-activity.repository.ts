/**
 * Product Phase 29-B — Customer success activity repository.
 */
import type { CustomerSuccessActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RecordCustomerSuccessActivityInput } from "./customer-success-activity.schema";

export const CUSTOMER_SUCCESS_ACTIVITY_REPOSITORY_MARKER_PHASE29B =
  "phase29b-customer-success-activity-repository" as const;

export async function createCustomerSuccessActivity(input: RecordCustomerSuccessActivityInput) {
  return prisma.customerSuccessActivity.create({
    data: {
      tenantId: input.tenantId,
      activityType: input.activityType as CustomerSuccessActivityType,
      summary: input.summary,
      ownerUserId: input.ownerUserId,
      riskSignal: input.riskSignal,
      nextActionAt: input.nextActionAt ? new Date(input.nextActionAt) : undefined,
    },
  });
}

export async function listCustomerSuccessActivitiesByTenant(tenantId: string, limit = 20) {
  return prisma.customerSuccessActivity.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
