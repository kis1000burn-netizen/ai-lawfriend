/**
 * Product Phase 33-C — Website / landing message refresh service.
 */
import { PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG } from "../trust-center/trust-center-content.registry";
import { LANDING_MESSAGE_BLOCKS } from "./website-landing-message.registry";
import { assembleWebsiteLandingMessageRefresh } from "./website-landing-message.policy";
import type { WebsiteLandingMessageRefreshResult } from "./website-landing-message.schema";

export const WEBSITE_LANDING_MESSAGE_SERVICE_MARKER_PHASE33C =
  "phase33c-website-landing-message-service" as const;

export function buildWebsiteLandingMessageRefresh(input?: {
  launchScopeSlug?: string;
  refreshedBlockIds?: string[];
}): WebsiteLandingMessageRefreshResult {
  const refreshedBlockIds = new Set(
    input?.refreshedBlockIds ??
      LANDING_MESSAGE_BLOCKS.filter((block) => block.required).map((block) => block.blockId),
  );

  return assembleWebsiteLandingMessageRefresh({
    launchScopeSlug: input?.launchScopeSlug ?? PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG,
    refreshedBlockIds,
  });
}
