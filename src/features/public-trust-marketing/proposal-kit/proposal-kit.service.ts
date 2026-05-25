/**
 * Product Phase 33-E — Partner / enterprise proposal kit service.
 */
import { PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG } from "../trust-center/trust-center-content.registry";
import { PROPOSAL_KIT_SECTIONS } from "./proposal-kit.registry";
import { assemblePartnerEnterpriseProposalKit } from "./proposal-kit.policy";
import type { PartnerEnterpriseProposalKitResult } from "./proposal-kit.schema";

export const PROPOSAL_KIT_SERVICE_MARKER_PHASE33E = "phase33e-proposal-kit-service" as const;

export function buildPartnerEnterpriseProposalKit(input?: {
  launchScopeSlug?: string;
  assembledSectionIds?: string[];
}): PartnerEnterpriseProposalKitResult {
  const assembledSectionIds = new Set(
    input?.assembledSectionIds ??
      PROPOSAL_KIT_SECTIONS.filter((section) => section.required).map(
        (section) => section.sectionId,
      ),
  );

  return assemblePartnerEnterpriseProposalKit({
    launchScopeSlug: input?.launchScopeSlug ?? PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG,
    assembledSectionIds,
  });
}
