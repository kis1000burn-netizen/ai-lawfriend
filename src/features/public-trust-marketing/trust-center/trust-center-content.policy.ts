/**
 * Product Phase 33-A — Trust center content pack policy SSOT.
 */
import { TRUST_CENTER_SECTIONS } from "./trust-center-content.registry";
import type { TrustCenterContentPackResult } from "./trust-center-content.schema";
import { TRUST_CENTER_CONTENT_VERSION } from "./trust-center-content.schema";

export const TRUST_CENTER_CONTENT_POLICY_MARKER_PHASE33A =
  "phase33a-trust-center-content-policy" as const;

export const TRUST_CENTER_CONTENT_GATE_MARKER_PHASE33A = "phase33a-trust-center-content-gate" as const;

export function assembleTrustCenterContentPack(input: {
  launchScopeSlug: string;
  publishedSectionIds: Set<string>;
  generatedAt?: string;
}): TrustCenterContentPackResult {
  const sections = TRUST_CENTER_SECTIONS.map((section) => ({
    ...section,
    published: input.publishedSectionIds.has(section.sectionId),
  }));

  const required = sections.filter((section) => section.required);
  const publishedRequired = required.filter((section) => section.published).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((publishedRequired / required.length) * 100);

  return {
    version: TRUST_CENTER_CONTENT_VERSION,
    launchScopeSlug: input.launchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sections,
    completionRate,
    trustCenterContentReady: publishedRequired === required.length,
  };
}
