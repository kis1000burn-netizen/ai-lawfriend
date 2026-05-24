/**
 * Product Phase 30-C — Partner / branch network operations schema (Zod SSOT).
 */
import { z } from "zod";

export const PARTNER_BRANCH_NETWORK_SCHEMA_MARKER_PHASE30C =
  "phase30c-partner-branch-network-schema" as const;

export const PARTNER_BRANCH_NETWORK_VERSION = "30-C.1" as const;

export const BRANCH_NETWORK_NODE_IDS = [
  "HQ_TENANT",
  "BRANCH_OFFICE",
  "PARTNER_FIRM",
  "SHARED_CASE_POOL",
  "CROSS_BRANCH_REPORTING",
] as const;

export const branchNetworkNodeSchema = z.object({
  nodeId: z.enum(BRANCH_NETWORK_NODE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  operational: z.boolean(),
});

export const partnerBranchNetworkOperationsResultSchema = z.object({
  version: z.literal(PARTNER_BRANCH_NETWORK_VERSION),
  networkSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  nodes: z.array(branchNetworkNodeSchema).min(1),
  completionRate: z.number().min(0).max(100),
  branchNetworkOpsReady: z.boolean(),
});

export type BranchNetworkNodeId = (typeof BRANCH_NETWORK_NODE_IDS)[number];
export type PartnerBranchNetworkOperationsResult = z.infer<
  typeof partnerBranchNetworkOperationsResultSchema
>;
