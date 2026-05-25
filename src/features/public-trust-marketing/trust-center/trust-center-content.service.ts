/**
 * Product Phase 33-A — Trust center content pack service.
 */
import {
  PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG,
  TRUST_CENTER_SECTIONS,
} from "./trust-center-content.registry";
import { assembleTrustCenterContentPack } from "./trust-center-content.policy";
import type { TrustCenterContentPackResult } from "./trust-center-content.schema";

export const TRUST_CENTER_CONTENT_SERVICE_MARKER_PHASE33A =
  "phase33a-trust-center-content-service" as const;

export function buildTrustCenterContentPack(input?: {
  launchScopeSlug?: string;
  publishedSectionIds?: string[];
}): TrustCenterContentPackResult {
  const publishedSectionIds = new Set(
    input?.publishedSectionIds ??
      TRUST_CENTER_SECTIONS.filter((section) => section.required).map(
        (section) => section.sectionId,
      ),
  );

  return assembleTrustCenterContentPack({
    launchScopeSlug: input?.launchScopeSlug ?? PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG,
    publishedSectionIds,
  });
}
