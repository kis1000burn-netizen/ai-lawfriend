/**
 * Product Phase 26-A — Staging E2E commercial smoke schema (Zod SSOT).
 */
import { z } from "zod";

export const STAGING_E2E_COMMERCIAL_SMOKE_SCHEMA_MARKER_PHASE26A =
  "phase26a-staging-e2e-commercial-smoke-schema" as const;

export const STAGING_E2E_COMMERCIAL_SMOKE_VERSION = "26-A.1" as const;

export const STAGING_E2E_SMOKE_SCENARIO_IDS = [
  "TENANT_SIGNUP",
  "CASE_CREATE",
  "AI_INTERVIEW",
  "DOCUMENT_GENERATION",
  "CLIENT_NOTIFICATION",
  "BILLING_METER",
] as const;

export const stagingE2eSmokeScenarioSchema = z.object({
  scenarioId: z.enum(STAGING_E2E_SMOKE_SCENARIO_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  verifyScript: z.string().optional(),
  passed: z.boolean(),
  notes: z.array(z.string()).default([]),
});

export const stagingE2eCommercialSmokeResultSchema = z.object({
  version: z.literal(STAGING_E2E_COMMERCIAL_SMOKE_VERSION),
  environment: z.enum(["staging", "production"]),
  generatedAt: z.string().datetime(),
  scenarios: z.array(stagingE2eSmokeScenarioSchema).min(1),
  passRate: z.number().min(0).max(100),
  stagingCommercialReady: z.boolean(),
});

export type StagingE2eSmokeScenarioId = (typeof STAGING_E2E_SMOKE_SCENARIO_IDS)[number];
export type StagingE2eCommercialSmokeResult = z.infer<
  typeof stagingE2eCommercialSmokeResultSchema
>;
