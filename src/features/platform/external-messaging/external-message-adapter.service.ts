/**
 * Product Phase 20-A — External message adapter orchestration (dry-run default · log prep).
 */
import { Prisma } from "@prisma/client";
import { ValidationError } from "@/lib/errors";
import { assertExternalMessagingEntitlement } from "@/features/platform/tenant-entitlement/tenant-entitlement.service";
import { recordTenantExternalMessageUsage } from "@/features/platform/tenant-metering/tenant-metering.service";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";
import { DATA_GOVERNANCE_REDACTION_POLICY_MARKER_PHASE19B } from "@/lib/data-governance/data-redaction-policy.schema";
import { EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS } from "@/features/platform/reliability/external-message-redelivery.schema";
import type { ExternalMessageAdapter } from "./external-message-adapter.contract";
import type {
  ExternalMessageChannel,
  ExternalMessageProvider,
  ExternalMessageSendPayload,
} from "./external-message-adapter.schema";
import { externalMessageSendPayloadSchema } from "./external-message-adapter.schema";
import type { ExternalMessageProviderResult } from "./external-message-adapter-result";
import {
  createDryRunAdapterForChannel,
  ExternalMessageDryRunAdapter,
} from "./external-message-dry-run-adapter";
import { validateExternalMessageChannelPolicy } from "./external-message-channel-policy";
import { validateExternalMessageTemplatePolicy } from "./external-message-template-policy";
import { mapUnknownProviderError } from "./external-message-provider-error";
import {
  emailProviderForResolved,
  readSmtpEmailConfig,
  resolveEmailProvider,
} from "./external-message-email-config";
import { ExternalMessageSmtpAdapter } from "./external-message-smtp-adapter";
import { ExternalMessageSendGridAdapter } from "./external-message-sendgrid-adapter";
import { createSmtpEmailTransportFromConfig } from "./external-message-email-transport";
import { createSendGridAdapterFromEnv } from "./external-message-sendgrid-adapter";
import {
  kakaoProviderForResolved,
  readKakaoAlimtalkConfig,
  resolveKakaoProvider,
} from "./external-message-kakao-config";
import { ExternalMessageKakaoAlimtalkAdapter } from "./external-message-kakao-alimtalk-adapter";
import { createKakaoAlimtalkTransportFromConfig } from "./external-message-kakao-alimtalk-transport";

export const REAL_MESSAGING_ADAPTER_SERVICE_MARKER_PHASE20A =
  "phase20a-real-messaging-adapter-service" as const;

export const REAL_MESSAGING_ADAPTER_SERVICE_MARKER_PHASE20B =
  "phase20b-real-messaging-email-adapter-service" as const;

export const REAL_MESSAGING_ADAPTER_SERVICE_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-adapter-service" as const;

export const EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION =
  DATA_GOVERNANCE_REDACTION_POLICY_MARKER_PHASE19B;

const adapterRegistry = new Map<string, ExternalMessageAdapter>();

function registryKey(provider: ExternalMessageProvider, channel: ExternalMessageChannel): string {
  return `${provider}:${channel}`;
}

export function registerExternalMessageAdapter(adapter: ExternalMessageAdapter): void {
  adapterRegistry.set(registryKey(adapter.provider, adapter.channel), adapter);
}

export function getExternalMessageAdapter(
  provider: ExternalMessageProvider,
  channel: ExternalMessageChannel,
): ExternalMessageAdapter | undefined {
  return adapterRegistry.get(registryKey(provider, channel));
}

let emailAdaptersBootstrapped = false;
let kakaoAdaptersBootstrapped = false;

export function ensureDefaultDryRunAdaptersRegistered(): void {
  for (const channel of ["EMAIL", "KAKAO", "IN_APP"] as const) {
    const key = registryKey("DRY_RUN", channel);
    if (!adapterRegistry.has(key)) {
      registerExternalMessageAdapter(createDryRunAdapterForChannel(channel));
    }
  }
}

/** Phase 20-B — register EMAIL provider from EMAIL_PROVIDER env (SMTP · SENDGRID · DRY_RUN). */
export async function ensureEmailAdaptersRegistered(): Promise<void> {
  ensureDefaultDryRunAdaptersRegistered();
  if (emailAdaptersBootstrapped) {
    return;
  }

  const resolved = resolveEmailProvider();
  const provider = emailProviderForResolved(resolved);

  if (provider === "SMTP") {
    const smtpConfig = readSmtpEmailConfig();
    if (smtpConfig) {
      const transport = await createSmtpEmailTransportFromConfig(smtpConfig);
      registerExternalMessageAdapter(new ExternalMessageSmtpAdapter(transport, smtpConfig));
    }
  }

  if (provider === "SENDGRID") {
    const sendGridAdapter = createSendGridAdapterFromEnv();
    if (sendGridAdapter) {
      registerExternalMessageAdapter(sendGridAdapter);
    }
  }

  emailAdaptersBootstrapped = true;
}

/** Phase 20-C — register KAKAO provider from KAKAO_PROVIDER env (ALIMTALK · DRY_RUN). */
export function ensureKakaoAdaptersRegistered(): void {
  ensureDefaultDryRunAdaptersRegistered();
  if (kakaoAdaptersBootstrapped) {
    return;
  }

  const resolved = resolveKakaoProvider();
  const provider = kakaoProviderForResolved(resolved);

  if (provider === "KAKAO_ALIMTALK") {
    const config = readKakaoAlimtalkConfig();
    if (config) {
      const transport = createKakaoAlimtalkTransportFromConfig(config);
      registerExternalMessageAdapter(new ExternalMessageKakaoAlimtalkAdapter(transport));
    }
  }

  kakaoAdaptersBootstrapped = true;
}

export async function ensureExternalMessageAdaptersRegistered(): Promise<void> {
  await ensureEmailAdaptersRegistered();
  ensureKakaoAdaptersRegistered();
}

export function resetExternalMessageAdapterRegistryForTests(): void {
  adapterRegistry.clear();
  emailAdaptersBootstrapped = false;
  kakaoAdaptersBootstrapped = false;
}

export function validateExternalMessageSendPayload(
  payload: unknown,
): ExternalMessageSendPayload {
  return externalMessageSendPayloadSchema.parse(payload);
}

export function validateExternalMessageSendRequest(
  payload: ExternalMessageSendPayload,
): { ok: true } | { ok: false; reason: string } {
  const channelPolicy = validateExternalMessageChannelPolicy(payload);
  if (!channelPolicy.ok) return channelPolicy;

  const templatePolicy = validateExternalMessageTemplatePolicy(payload);
  if (!templatePolicy.ok) return templatePolicy;

  return { ok: true };
}

export async function sendExternalMessageViaAdapter(
  payload: ExternalMessageSendPayload,
): Promise<ExternalMessageProviderResult> {
  await ensureExternalMessageAdaptersRegistered();

  const parsed = validateExternalMessageSendPayload(payload);
  const requestValidation = validateExternalMessageSendRequest(parsed);
  if (!requestValidation.ok) {
    throw new ValidationError(requestValidation.reason);
  }

  if (parsed.tenantId) {
    await assertExternalMessagingEntitlement({
      tenantId: parsed.tenantId,
      channel: parsed.channel,
    });
  }

  const adapter =
    getExternalMessageAdapter(parsed.provider, parsed.channel) ??
    getExternalMessageAdapter("DRY_RUN", parsed.channel);

  if (!adapter) {
    throw new ValidationError(`No adapter for ${parsed.provider}/${parsed.channel}`);
  }

  if (!adapter.supportsChannel(parsed.channel)) {
    throw new ValidationError("Adapter does not support channel.");
  }

  const adapterValidation = adapter.validatePayload(parsed);
  if (!adapterValidation.ok) {
    throw new ValidationError(adapterValidation.reason);
  }

  try {
    const result = await adapter.send(parsed);
    if (parsed.tenantId && result.status !== "FAILED") {
      await recordTenantExternalMessageUsage({
        tenantId: parsed.tenantId,
        caseId: parsed.caseId,
        channel: parsed.channel,
      });
    }
    return result;
  } catch (error) {
    const mapped = adapter.mapProviderError(error);
    return {
      status: "FAILED",
      provider: adapter.provider,
      channel: parsed.channel,
      retryable: mapped.retryable,
      redeliveryEligible: mapped.redeliveryEligible,
      providerStatusCode: mapped.code,
      safeSummary: {
        templateKey: parsed.template.templateKey,
        recipientMasked: "(redacted)",
        portalPath: parsed.safeLink?.portalPath,
      },
      rawProviderResponseRedacted: {
        errorCode: mapped.code,
        safeMessage: mapped.safeMessage,
      },
    };
  }
}

/** ExternalMessageLog.payloadSummaryJson prep — 18-B safe keys · 19-B redaction. */
export function buildExternalMessageLogSafeSummary(
  payload: ExternalMessageSendPayload,
  result: ExternalMessageProviderResult,
): Prisma.InputJsonValue {
  const summary: Record<string, unknown> = {
    metadataOnly: true,
    templateKey: result.safeSummary.templateKey,
    templateCode: payload.template.providerTemplateCode,
    portalPath: result.safeSummary.portalPath ?? payload.safeLink?.portalPath,
    documentTitle: payload.template.variables.documentTitle?.slice(0, 200),
    noticeBody: payload.template.variables.noticeBody?.slice(0, 500),
    containsFileAttachment: false,
    provider: result.provider,
    channel: result.channel,
    status: result.status,
    recipientMasked: result.safeSummary.recipientMasked,
    idempotencyKey: payload.metadata.idempotencyKey,
    redactionPolicyVersion: payload.metadata.redactionPolicyVersion,
    providerMessageId: result.providerMessageId,
  };

  for (const key of EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS) {
    if (!(key in summary) && key in payload.template.variables) {
      summary[key] = payload.template.variables[key];
    }
  }

  return redactExternalMessagePayload(summary) as Prisma.InputJsonValue;
}

export function listRegisteredExternalMessageAdapters(): ExternalMessageAdapter[] {
  ensureDefaultDryRunAdaptersRegistered();
  return Array.from(adapterRegistry.values());
}

export function isDryRunAdapter(adapter: ExternalMessageAdapter): adapter is ExternalMessageDryRunAdapter {
  return adapter.provider === "DRY_RUN";
}

export { mapUnknownProviderError };
