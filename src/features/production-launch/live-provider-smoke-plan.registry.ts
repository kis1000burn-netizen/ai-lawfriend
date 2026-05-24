/**
 * Product Phase 25-D — Live provider smoke cases SSOT.
 */
import type { LiveProviderSmokePlanResult } from "./live-provider-smoke-plan.schema";

export const LIVE_PROVIDER_SMOKE_PLAN_REGISTRY_MARKER_PHASE25D =
  "phase25d-live-provider-smoke-plan-registry" as const;

type SmokeCase = Omit<LiveProviderSmokePlanResult["cases"][number], "passed" | "notes">;

export const LIVE_PROVIDER_SMOKE_CASES: SmokeCase[] = [
  {
    providerId: "HEALTH",
    label: "/api/health liveness",
    smokeCommand: "ops:staging-deploy-readiness-live-check",
    required: true,
  },
  {
    providerId: "EMAIL",
    label: "Email delivery (stub/live mode)",
    modeEnvKey: "PRODUCTION_EMAIL_DELIVERY_MODE",
    smokeCommand: "verify:aibeopchin-real-messaging-phase20b",
    required: true,
  },
  {
    providerId: "KAKAO_ALIMTALK",
    label: "Kakao Alimtalk (stub/live mode)",
    modeEnvKey: "PRODUCTION_KAKAO_ALIMTALK_MODE",
    smokeCommand: "verify:aibeopchin-real-messaging-phase20c",
    required: true,
  },
  {
    providerId: "OAUTH_CALLBACK",
    label: "OAuth callback redirect",
    smokeCommand: "ops:staging-deploy-readiness-live-check",
    required: true,
  },
];
