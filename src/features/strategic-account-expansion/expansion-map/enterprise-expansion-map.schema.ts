/**
 * Product Phase 39-B — Enterprise expansion map schema (Zod SSOT).
 */
import { z } from "zod";

export const ENTERPRISE_EXPANSION_MAP_SCHEMA_MARKER_PHASE39B =
  "phase39b-enterprise-expansion-map-schema" as const;

export const ENTERPRISE_EXPANSION_MAP_VERSION = "39-B.1" as const;

export const ENTERPRISE_EXPANSION_MAP_NODE_IDS = [
  "BRANCH_TARGETS",
  "DEPARTMENT_ROLLOUT",
  "GROUP_COMPANY_LINK",
  "PARTNER_CHANNEL_MAP",
  "EXPANSION_PRIORITY_MATRIX",
] as const;

export const enterpriseExpansionMapNodeSchema = z.object({
  nodeId: z.enum(ENTERPRISE_EXPANSION_MAP_NODE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const enterpriseExpansionMapResultSchema = z.object({
  version: z.literal(ENTERPRISE_EXPANSION_MAP_VERSION),
  strategicAccountScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  nodes: z.array(enterpriseExpansionMapNodeSchema).min(1),
  completionRate: z.number().min(0).max(100),
  enterpriseExpansionMapReady: z.boolean(),
});

export type EnterpriseExpansionMapNodeId = (typeof ENTERPRISE_EXPANSION_MAP_NODE_IDS)[number];
export type EnterpriseExpansionMapResult = z.infer<typeof enterpriseExpansionMapResultSchema>;
