/**
 * Product Phase 25-D — Live provider smoke plan schema (Zod SSOT).
 */
import { z } from "zod";

export const LIVE_PROVIDER_SMOKE_PLAN_SCHEMA_MARKER_PHASE25D =
  "phase25d-live-provider-smoke-plan-schema" as const;

export const LIVE_PROVIDER_SMOKE_PLAN_VERSION = "25-D.1" as const;

export const LIVE_PROVIDER_IDS = ["EMAIL", "KAKAO_ALIMTALK", "HEALTH", "OAUTH_CALLBACK"] as const;

export const liveProviderSmokeCaseSchema = z.object({
  providerId: z.enum(LIVE_PROVIDER_IDS),
  label: z.string().min(1),
  modeEnvKey: z.string().optional(),
  smokeCommand: z.string().optional(),
  required: z.boolean().default(true),
  passed: z.boolean(),
  notes: z.array(z.string()).default([]),
});

export const liveProviderSmokePlanResultSchema = z.object({
  version: z.literal(LIVE_PROVIDER_SMOKE_PLAN_VERSION),
  generatedAt: z.string().datetime(),
  environment: z.enum(["staging", "production"]),
  cases: z.array(liveProviderSmokeCaseSchema).min(1),
  passRate: z.number().min(0).max(100),
  liveProviderReady: z.boolean(),
});

export type LiveProviderSmokePlanResult = z.infer<typeof liveProviderSmokePlanResultSchema>;
