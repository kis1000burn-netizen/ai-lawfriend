/**
 * Product Phase 33-E — Partner / enterprise proposal kit policy SSOT.
 */
import { PROPOSAL_KIT_SECTIONS } from "./proposal-kit.registry";
import type { PartnerEnterpriseProposalKitResult } from "./proposal-kit.schema";
import { PROPOSAL_KIT_VERSION } from "./proposal-kit.schema";

export const PROPOSAL_KIT_POLICY_MARKER_PHASE33E = "phase33e-proposal-kit-policy" as const;

export function assemblePartnerEnterpriseProposalKit(input: {
  launchScopeSlug: string;
  assembledSectionIds: Set<string>;
  generatedAt?: string;
}): PartnerEnterpriseProposalKitResult {
  const sections = PROPOSAL_KIT_SECTIONS.map((section) => ({
    ...section,
    assembled: input.assembledSectionIds.has(section.sectionId),
  }));

  const required = sections.filter((section) => section.required);
  const assembledRequired = required.filter((section) => section.assembled).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((assembledRequired / required.length) * 100);

  return {
    version: PROPOSAL_KIT_VERSION,
    launchScopeSlug: input.launchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sections,
    completionRate,
    proposalKitReady: assembledRequired === required.length,
  };
}
