/**
 * Product Phase 22-C — Tenant usage metering · aggregation · plan limit comparison.
 */
import { resolveTenantEntitlements } from "@/features/platform/tenant-entitlement/tenant-entitlement.service";
import type { ExternalMessageChannel } from "@/features/platform/external-messaging/external-message-adapter.schema";

import {
  aggregateTenantCaseLlmUsage,
  aggregateTenantUsageTotals,
  createTenantUsageEvent,
} from "./tenant-metering.repository";
import {
  buildTenantUsageSummary,
  resolveTenantUsagePeriodKey,
} from "./tenant-usage.policy";
import type { RecordTenantUsageEventInput, TenantUsageSummary } from "./tenant-usage.schema";
import { recordTenantUsageEventInputSchema } from "./tenant-usage.schema";

export const TENANT_METERING_SERVICE_MARKER_PHASE22C =
  "phase22c-tenant-metering-service" as const;

export async function recordTenantUsageEvent(input: RecordTenantUsageEventInput) {
  const parsed = recordTenantUsageEventInputSchema.parse(input);
  const event = await createTenantUsageEvent(parsed);

  const { promoteMeteringEventToBillingLedgerDraft } = await import(
    "@/features/platform/billing-ledger/billing-usage-ledger-bridge.service"
  );
  await promoteMeteringEventToBillingLedgerDraft(event.id);

  return event;
}

export async function recordTenantAiTokenUsage(input: {
  tenantId: string;
  tokensUsed: number;
  caseId?: string;
  feature?: string;
}) {
  if (input.tokensUsed <= 0) {
    return null;
  }
  return recordTenantUsageEvent({
    tenantId: input.tenantId,
    kind: "AI_TOKEN_USAGE",
    quantity: input.tokensUsed,
    unit: "TOKENS",
    caseId: input.caseId,
    metadata: input.feature ? { feature: input.feature } : undefined,
  });
}

export async function recordTenantLlmCall(input: {
  tenantId: string;
  caseId?: string;
  feature?: string;
}) {
  return recordTenantUsageEvent({
    tenantId: input.tenantId,
    kind: "LLM_CALL",
    quantity: 1,
    unit: "COUNT",
    caseId: input.caseId,
    metadata: input.feature ? { feature: input.feature } : undefined,
  });
}

export async function recordTenantExternalMessageUsage(input: {
  tenantId: string;
  caseId?: string;
  channel: ExternalMessageChannel;
}) {
  return recordTenantUsageEvent({
    tenantId: input.tenantId,
    kind: "EXTERNAL_MESSAGE",
    quantity: 1,
    unit: "COUNT",
    caseId: input.caseId,
    metadata: { channel: input.channel },
  });
}

export async function recordTenantDocumentProcessingUsage(input: {
  tenantId: string;
  caseId?: string;
  documentKind?: string;
}) {
  return recordTenantUsageEvent({
    tenantId: input.tenantId,
    kind: "DOCUMENT_PROCESSING",
    quantity: 1,
    unit: "COUNT",
    caseId: input.caseId,
    metadata: input.documentKind ? { documentKind: input.documentKind } : undefined,
  });
}

export async function recordTenantFileUploadUsage(input: {
  tenantId: string;
  caseId?: string;
  bytesEstimate?: number;
}) {
  return recordTenantUsageEvent({
    tenantId: input.tenantId,
    kind: "FILE_UPLOAD",
    quantity: 1,
    unit: "COUNT",
    caseId: input.caseId,
    metadata:
      input.bytesEstimate !== undefined
        ? { bytesEstimate: Math.max(0, Math.trunc(input.bytesEstimate)) }
        : undefined,
  });
}

export async function recordTenantClientPortalActiveUsage(input: {
  tenantId: string;
  caseId?: string;
  surface?: string;
}) {
  return recordTenantUsageEvent({
    tenantId: input.tenantId,
    kind: "CLIENT_PORTAL_ACTIVE",
    quantity: 1,
    unit: "COUNT",
    caseId: input.caseId,
    metadata: input.surface ? { surface: input.surface } : undefined,
  });
}

/** Usage aggregation service — totals + 22-B plan limit comparison + over-limit warnings. */
export async function getTenantUsageSummary(input: {
  tenantId: string;
  periodKey?: string;
}): Promise<TenantUsageSummary | null> {
  const periodKey = input.periodKey ?? resolveTenantUsagePeriodKey();
  const entitlements = await resolveTenantEntitlements(input.tenantId);
  if (!entitlements) {
    return null;
  }

  const [totals, caseLlmUsage] = await Promise.all([
    aggregateTenantUsageTotals(input.tenantId, periodKey),
    aggregateTenantCaseLlmUsage(input.tenantId, periodKey),
  ]);

  return buildTenantUsageSummary({
    tenantId: input.tenantId,
    periodKey,
    totals,
    limits: entitlements.limits,
    caseLlmUsage,
  });
}

export async function getTenantUsageOverLimitWarnings(input: {
  tenantId: string;
  periodKey?: string;
}) {
  const summary = await getTenantUsageSummary(input);
  return summary?.warnings ?? [];
}
