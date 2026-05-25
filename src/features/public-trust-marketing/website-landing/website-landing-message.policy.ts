/**
 * Product Phase 33-C — Website / landing message refresh policy SSOT.
 */
import { LANDING_MESSAGE_BLOCKS } from "./website-landing-message.registry";
import type { WebsiteLandingMessageRefreshResult } from "./website-landing-message.schema";
import { WEBSITE_LANDING_MESSAGE_VERSION } from "./website-landing-message.schema";

export const WEBSITE_LANDING_MESSAGE_POLICY_MARKER_PHASE33C =
  "phase33c-website-landing-message-policy" as const;

export function assembleWebsiteLandingMessageRefresh(input: {
  launchScopeSlug: string;
  refreshedBlockIds: Set<string>;
  generatedAt?: string;
}): WebsiteLandingMessageRefreshResult {
  const blocks = LANDING_MESSAGE_BLOCKS.map((block) => ({
    ...block,
    refreshed: input.refreshedBlockIds.has(block.blockId),
  }));

  const required = blocks.filter((block) => block.required);
  const refreshedRequired = required.filter((block) => block.refreshed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((refreshedRequired / required.length) * 100);

  return {
    version: WEBSITE_LANDING_MESSAGE_VERSION,
    launchScopeSlug: input.launchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    blocks,
    completionRate,
    landingMessageRefreshReady: refreshedRequired === required.length,
  };
}
