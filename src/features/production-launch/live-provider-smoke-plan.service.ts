/**
 * Product Phase 25-D — Live provider smoke plan service.
 */
import { assembleLiveProviderSmokePlan } from "./live-provider-smoke-plan.policy";
import type { LiveProviderSmokePlanResult } from "./live-provider-smoke-plan.schema";

export const LIVE_PROVIDER_SMOKE_PLAN_SERVICE_MARKER_PHASE25D =
  "phase25d-live-provider-smoke-plan-service" as const;

export function buildLiveProviderSmokePlan(input?: {
  environment?: "staging" | "production";
  passedProviderIds?: string[];
  env?: NodeJS.ProcessEnv;
}): LiveProviderSmokePlanResult {
  return assembleLiveProviderSmokePlan({
    environment: input?.environment ?? "staging",
    passedProviderIds: new Set(input?.passedProviderIds ?? ["HEALTH"]),
    env: input?.env,
  });
}
