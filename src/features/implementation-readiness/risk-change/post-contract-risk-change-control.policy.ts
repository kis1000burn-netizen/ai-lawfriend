/**
 * Product Phase 36-E — Post-contract risk / change control policy SSOT.
 */
import { POST_CONTRACT_CONTROLS } from "./post-contract-risk-change-control.registry";
import type { PostContractRiskChangeControlResult } from "./post-contract-risk-change-control.schema";
import { POST_CONTRACT_RISK_CHANGE_VERSION } from "./post-contract-risk-change-control.schema";

export const POST_CONTRACT_RISK_CHANGE_POLICY_MARKER_PHASE36E =
  "phase36e-post-contract-risk-change-policy" as const;

export function assemblePostContractRiskChangeControl(input: {
  implementationScopeSlug: string;
  definedControlIds: Set<string>;
  generatedAt?: string;
}): PostContractRiskChangeControlResult {
  const controls = POST_CONTRACT_CONTROLS.map((control) => ({
    ...control,
    defined: input.definedControlIds.has(control.controlId),
  }));

  const required = controls.filter((control) => control.required);
  const definedRequired = required.filter((control) => control.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: POST_CONTRACT_RISK_CHANGE_VERSION,
    implementationScopeSlug: input.implementationScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    controls,
    completionRate,
    postContractRiskChangeControlReady: definedRequired === required.length,
  };
}
