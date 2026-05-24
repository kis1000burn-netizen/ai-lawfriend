/**
 * Product Phase 25-D — Live provider smoke plan policy SSOT.
 */
import { LIVE_PROVIDER_SMOKE_CASES } from "./live-provider-smoke-plan.registry";
import type { LiveProviderSmokePlanResult } from "./live-provider-smoke-plan.schema";
import { LIVE_PROVIDER_SMOKE_PLAN_VERSION } from "./live-provider-smoke-plan.schema";

export const LIVE_PROVIDER_SMOKE_PLAN_POLICY_MARKER_PHASE25D =
  "phase25d-live-provider-smoke-plan-policy" as const;

export function resolveProviderMode(
  envKey: string | undefined,
  env: NodeJS.ProcessEnv = process.env,
): "stub" | "live" | "unknown" {
  if (!envKey) {
    return "unknown";
  }
  const value = (env[envKey] ?? "").trim().toLowerCase();
  if (value === "live") {
    return "live";
  }
  if (value === "stub") {
    return "stub";
  }
  return "unknown";
}

export function assembleLiveProviderSmokePlan(input: {
  environment: "staging" | "production";
  passedProviderIds: Set<string>;
  env?: NodeJS.ProcessEnv;
  generatedAt?: string;
}): LiveProviderSmokePlanResult {
  const cases = LIVE_PROVIDER_SMOKE_CASES.map((testCase) => {
    const mode = resolveProviderMode(testCase.modeEnvKey, input.env);
    const notes: string[] = [];
    if (testCase.modeEnvKey && mode !== "unknown") {
      notes.push(`mode=${mode}`);
    }
    return {
      ...testCase,
      passed: input.passedProviderIds.has(testCase.providerId),
      notes,
    };
  });

  const required = cases.filter((testCase) => testCase.required);
  const passedRequired = required.filter((testCase) => testCase.passed).length;
  const passRate =
    required.length === 0 ? 100 : Math.round((passedRequired / required.length) * 100);

  return {
    version: LIVE_PROVIDER_SMOKE_PLAN_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    environment: input.environment,
    cases,
    passRate,
    liveProviderReady: passedRequired === required.length,
  };
}
