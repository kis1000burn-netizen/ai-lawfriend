/**
 * Product Phase 22-C — Bridge AI governance invoke → persisted tenant usage events.
 */
import { prisma } from "@/lib/prisma";
import {
  recordTenantAiTokenUsage,
  recordTenantLlmCall,
} from "./tenant-metering.service";

export const TENANT_METERING_BRIDGE_MARKER_PHASE22C =
  "phase22c-tenant-metering-bridge" as const;

export async function recordTenantAiUsageFromGovernanceInvoke(input: {
  caseId?: string;
  feature?: string;
  llmInvoked: boolean;
  tokensUsed?: number;
}) {
  if (!input.caseId) {
    return;
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: input.caseId },
    select: { tenantId: true },
  });
  if (!caseRecord?.tenantId) {
    return;
  }

  const tenantId = caseRecord.tenantId;

  if (input.llmInvoked) {
    await recordTenantLlmCall({
      tenantId,
      caseId: input.caseId,
      feature: input.feature,
    });
  }

  const tokens = input.tokensUsed ?? 0;
  if (tokens > 0) {
    await recordTenantAiTokenUsage({
      tenantId,
      tokensUsed: tokens,
      caseId: input.caseId,
      feature: input.feature,
    });
  }
}
