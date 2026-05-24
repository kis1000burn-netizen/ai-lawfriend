/**
 * Phase 15-F — Secure document sharing & Kakao notice SSOT.
 */
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";

export const PHASE15F_SECURE_DOCUMENT_DELIVERY_MARKER =
  "PHASE15F_SECURE_DOCUMENT_DELIVERY" as const;

export const SECURE_DOCUMENT_DELIVERY_VERSION = "15-F.1" as const;

export const DOCUMENT_DELIVERY_CHANNELS = [
  "IN_APP",
  "EMAIL",
  "KAKAO_ALIMTALK",
  "SMS",
] as const;

export const documentDeliveryChannelSchema = z.enum(DOCUMENT_DELIVERY_CHANNELS);

export const createCaseSharedDocumentBodySchema = z.object({
  documentId: z.string().cuid(),
  expiresInHours: z.number().int().min(1).max(720).default(168),
  notifyChannels: z
    .array(documentDeliveryChannelSchema)
    .default(["IN_APP", "KAKAO_ALIMTALK"]),
});

export const sendKakaoDocumentNoticeBodySchema = z.object({
  templateCode: z.string().trim().max(100).default("CLIENT_DOC_SHARE_V1"),
  fallbackChannel: z.enum(["IN_APP", "EMAIL"]).default("IN_APP"),
});

export const markSharedDocumentViewedBodySchema = z.object({
  accessToken: z.string().trim().min(16).max(256).optional(),
});

export const commandCenterSharedDocumentRowSchema = z.object({
  id: z.string().cuid(),
  documentId: z.string().cuid(),
  documentTitle: z.string(),
  shareStatus: z.enum(["ACTIVE", "REVOKED", "EXPIRED"]),
  sharedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable().optional(),
  firstViewedAt: z.string().datetime().nullable().optional(),
  kakaoPending: z.boolean().default(false),
  kakaoSent: z.boolean().default(false),
  inAppSent: z.boolean().default(false),
});

export const clientPortalSharedDocumentDetailSchema = z.object({
  id: z.string().cuid(),
  documentId: z.string().cuid(),
  title: z.string(),
  shareStatus: z.enum(["ACTIVE", "REVOKED", "EXPIRED"]),
  sharedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable().optional(),
  firstViewedAt: z.string().datetime().nullable().optional(),
  previewText: z.string().nullable().optional(),
  notice: z.string(),
});

export const KAKAO_DOCUMENT_NOTICE_BODY =
  "[AI법친] 변호사가 사건 관련 서류를 공유했습니다. 보안 열람을 위해 AI법친에 로그인해 확인해 주세요." as const;

export function buildSecurePortalPath(caseId: string, shareId: string): string {
  return `/client/cases/${caseId}?tab=shared&share=${shareId}`;
}

export function hashSecureLinkToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSecureLinkToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashSecureLinkToken(token) };
}
