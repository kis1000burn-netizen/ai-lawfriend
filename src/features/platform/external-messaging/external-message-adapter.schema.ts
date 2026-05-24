/**
 * Product Phase 20-A — External message adapter schema (channel · provider · payload).
 */
import { z } from "zod";

export const REAL_MESSAGING_ADAPTER_SCHEMA_MARKER_PHASE20A =
  "phase20a-real-messaging-adapter-schema" as const;

export const EXTERNAL_MESSAGE_CHANNELS = ["EMAIL", "KAKAO", "IN_APP"] as const;

export const EXTERNAL_MESSAGE_PROVIDERS = [
  "DRY_RUN",
  "SMTP",
  "SENDGRID",
  "KAKAO_ALIMTALK",
  "KAKAO_FRIENDTALK",
] as const;

export const EXTERNAL_MESSAGE_SEND_SURFACES = [
  "SUPPLEMENT_REQUEST",
  "DOCUMENT_DELIVERY",
  "COURT_DEADLINE_REMINDER",
  "CLIENT_PORTAL_MESSAGE",
  "SYSTEM_NOTICE",
] as const;

export const EXTERNAL_MESSAGE_METADATA_SOURCES = [
  "CLIENT_PORTAL",
  "COMMAND_CENTER",
  "DEADLINE",
  "DOCUMENT_DELIVERY",
] as const;

export const externalMessageChannelSchema = z.enum(EXTERNAL_MESSAGE_CHANNELS);
export const externalMessageProviderSchema = z.enum(EXTERNAL_MESSAGE_PROVIDERS);
export const externalMessageSendSurfaceSchema = z.enum(EXTERNAL_MESSAGE_SEND_SURFACES);
export const externalMessageMetadataSourceSchema = z.enum(EXTERNAL_MESSAGE_METADATA_SOURCES);

export const externalMessageRecipientSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
  displayName: z.string().max(100).optional(),
});

export const externalMessageTemplateSchema = z.object({
  templateKey: z.string().trim().min(1).max(120),
  providerTemplateCode: z.string().trim().max(100).optional(),
  variables: z.record(z.string(), z.string()).default({}),
});

export const externalMessageSafeLinkSchema = z.object({
  portalPath: z.string().trim().min(1).max(300),
  expiresAt: z.string().datetime().optional(),
});

export const externalMessageSendMetadataSchema = z.object({
  source: externalMessageMetadataSourceSchema,
  idempotencyKey: z.string().trim().min(8).max(128),
  redactionPolicyVersion: z.string().trim().min(1).max(64),
  consentVerified: z.boolean().optional(),
});

export const externalMessageSendPayloadSchema = z.object({
  channel: externalMessageChannelSchema,
  provider: externalMessageProviderSchema,
  surface: externalMessageSendSurfaceSchema,
  caseId: z.string().cuid().optional(),
  tenantId: z.string().cuid().optional(),
  recipientUserId: z.string().cuid().optional(),
  recipient: externalMessageRecipientSchema,
  template: externalMessageTemplateSchema,
  safeLink: externalMessageSafeLinkSchema.optional(),
  metadata: externalMessageSendMetadataSchema,
});

export type ExternalMessageChannel = z.infer<typeof externalMessageChannelSchema>;
export type ExternalMessageProvider = z.infer<typeof externalMessageProviderSchema>;
export type ExternalMessageSendSurface = z.infer<typeof externalMessageSendSurfaceSchema>;
export type ExternalMessageSendPayload = z.infer<typeof externalMessageSendPayloadSchema>;

export type ExternalMessagePayloadValidationResult =
  | { ok: true }
  | { ok: false; reason: string };
