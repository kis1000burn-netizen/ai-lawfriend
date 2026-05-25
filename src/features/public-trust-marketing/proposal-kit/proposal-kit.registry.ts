/**
 * Product Phase 33-E — Partner / enterprise proposal kit sections SSOT.
 */
import type { PartnerEnterpriseProposalKitResult } from "./proposal-kit.schema";

export const PROPOSAL_KIT_REGISTRY_MARKER_PHASE33E = "phase33e-proposal-kit-registry" as const;

type ProposalKitSection = Omit<PartnerEnterpriseProposalKitResult["sections"][number], "assembled">;

export const PROPOSAL_KIT_SECTIONS: ProposalKitSection[] = [
  { sectionId: "EXEC_SUMMARY", label: "Executive summary for enterprise buyers", required: true },
  { sectionId: "SCOPE_OF_WORK", label: "Scope of work and onboarding timeline", required: true },
  { sectionId: "SLA_TIER", label: "SLA and support tier options (Phase 28-C)", required: true },
  {
    sectionId: "PARTNER_NETWORK",
    label: "Partner ecosystem overview (Phase 31)",
    required: true,
  },
  {
    sectionId: "SECURITY_APPENDIX_LINK",
    label: "Security and compliance appendix (Phase 32)",
    required: true,
  },
];
