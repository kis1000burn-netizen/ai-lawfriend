/**
 * Phase 10-C — Client-Safe Disclosure Layer schema SSOT.
 * @see docs/ai/AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md
 *
 * 내부 법률 지능과 의뢰인 공개 정보를 분리한다.
 */
import { z } from "zod";

import { CaseStatusEnum } from "@/lib/definitions/case-status";

export const PHASE10C_CLIENT_SAFE_DISCLOSURE_MARKER =
  "PHASE10C_CLIENT_SAFE_DISCLOSURE" as const;

export const CLIENT_SAFE_DISCLOSURE_VERSION = "10-C.1" as const;

/** 의뢰인에게 절대 노출하지 않는 내부 카테고리 */
export const CLIENT_SAFE_BLOCKED_CATEGORIES = [
  "RADAR",
  "INTELLIGENCE_GRAPH",
  "INTERNAL_LAWYER_MEMO",
  "PENDING_LEDGER",
  "UNREVIEWED_LEDGER",
] as const;

export type ClientSafeBlockedCategory = (typeof CLIENT_SAFE_BLOCKED_CATEGORIES)[number];

export const CLIENT_SAFE_RELEASED_JUDGMENT_STATES = ["CONFIRMED", "EDITED"] as const;
export type ClientSafeReleasedJudgmentState =
  (typeof CLIENT_SAFE_RELEASED_JUDGMENT_STATES)[number];

export const clientSafeStatementSchema = z.object({
  statementId: z.string().min(1),
  text: z.string().min(1).max(4000),
  sourceEntryId: z.string().min(1),
  judgmentState: z.enum(CLIENT_SAFE_RELEASED_JUDGMENT_STATES),
  clientVisibleLane: z.literal(true),
  releaseGatePassed: z.literal(true),
  releasedAt: z.string().datetime(),
});

export type ClientSafeStatement = z.infer<typeof clientSafeStatementSchema>;

export const clientSafeDisclosureLayerSchema = z.object({
  disclosureVersion: z.literal(CLIENT_SAFE_DISCLOSURE_VERSION),
  caseId: z.string().min(1),
  caseStatus: CaseStatusEnum,
  generatedAt: z.string().datetime(),
  releaseGatePassed: z.boolean(),
  statements: z.array(clientSafeStatementSchema),
  blockedCategories: z.array(z.enum(CLIENT_SAFE_BLOCKED_CATEGORIES)).min(1),
  disclaimer: z.string().min(1),
  /** 공개 가능 문장이 없을 때 안내 */
  emptyReleaseNotice: z.string().optional(),
});

export type ClientSafeDisclosureLayer = z.infer<typeof clientSafeDisclosureLayerSchema>;

export function parseClientSafeDisclosureLayer(input: unknown): ClientSafeDisclosureLayer {
  return clientSafeDisclosureLayerSchema.parse(input);
}
