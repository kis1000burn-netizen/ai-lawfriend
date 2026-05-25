/**
 * Product Phase 33-E — Partner / enterprise proposal kit schema (Zod SSOT).
 */
import { z } from "zod";

export const PROPOSAL_KIT_SCHEMA_MARKER_PHASE33E = "phase33e-proposal-kit-schema" as const;

export const PROPOSAL_KIT_VERSION = "33-E.1" as const;

export const PROPOSAL_KIT_SECTION_IDS = [
  "EXEC_SUMMARY",
  "SCOPE_OF_WORK",
  "SLA_TIER",
  "PARTNER_NETWORK",
  "SECURITY_APPENDIX_LINK",
] as const;

export const proposalKitSectionSchema = z.object({
  sectionId: z.enum(PROPOSAL_KIT_SECTION_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  assembled: z.boolean(),
});

export const partnerEnterpriseProposalKitResultSchema = z.object({
  version: z.literal(PROPOSAL_KIT_VERSION),
  launchScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  sections: z.array(proposalKitSectionSchema).min(1),
  completionRate: z.number().min(0).max(100),
  proposalKitReady: z.boolean(),
});

export type ProposalKitSectionId = (typeof PROPOSAL_KIT_SECTION_IDS)[number];
export type PartnerEnterpriseProposalKitResult = z.infer<
  typeof partnerEnterpriseProposalKitResultSchema
>;
