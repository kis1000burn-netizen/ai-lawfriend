/**
 * Product Phase 33-C — Website / landing message blocks SSOT.
 */
import type { WebsiteLandingMessageRefreshResult } from "./website-landing-message.schema";

export const WEBSITE_LANDING_MESSAGE_REGISTRY_MARKER_PHASE33C =
  "phase33c-website-landing-message-registry" as const;

type LandingMessageBlock = Omit<
  WebsiteLandingMessageRefreshResult["blocks"][number],
  "refreshed"
>;

export const LANDING_MESSAGE_BLOCKS: LandingMessageBlock[] = [
  { blockId: "HERO_MESSAGE", label: "Hero message aligned to enterprise ICP", required: true },
  { blockId: "VALUE_PROPOSITION", label: "Value proposition for law firms and partners", required: true },
  { blockId: "TRUST_BADGES", label: "Trust badges linked to Phase 32 evidence", required: true },
  { blockId: "CTA_FUNNEL", label: "CTA funnel to demo and pilot intake", required: true },
  {
    blockId: "LEGAL_DISCLAIMER",
    label: "Legal disclaimer — no unverified performance claims",
    required: true,
  },
];
