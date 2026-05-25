/**
 * Product Phase 46-B — StrategyConfidentialMaterialExclusionPolicy schema (Zod SSOT).
 */
import { z } from "zod";

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_SCHEMA_MARKER_46B =
  "phase46b-strategy-confidential-material-exclusion-policy-schema" as const;

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_VERSION = "46-B.2" as const;

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEM_IDS = [
  "STRATEGY_GRAPH_EXCLUSION",
  "UNREVIEWED_AI_EXCLUSION",
  "CONFIDENTIAL_MEMO_EXCLUSION",
  "EXCLUSION_AUDIT_LOG",
] as const;

export const strategyconfidentialmaterialexclusionpolicyItemSchema = z.object({
  itemId: z.enum(STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const strategyconfidentialmaterialexclusionpolicyResultSchema = z.object({
  version: z.literal("46-B.2"),
  neutralPackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(strategyconfidentialmaterialexclusionpolicyItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  strategyConfidentialMaterialExclusionPolicyReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type StrategyConfidentialMaterialExclusionPolicyItemId = (typeof STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEM_IDS)[number];
export type StrategyConfidentialMaterialExclusionPolicyResult = z.infer<typeof strategyconfidentialmaterialexclusionpolicyResultSchema>;
