/**
 * Product Phase 36-E — Post-contract risk / change control service.
 */
import { IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG } from "../project-plan/implementation-project-plan.registry";
import { POST_CONTRACT_CONTROLS } from "./post-contract-risk-change-control.registry";
import { assemblePostContractRiskChangeControl } from "./post-contract-risk-change-control.policy";
import type { PostContractRiskChangeControlResult } from "./post-contract-risk-change-control.schema";

export const POST_CONTRACT_RISK_CHANGE_SERVICE_MARKER_PHASE36E =
  "phase36e-post-contract-risk-change-service" as const;

export function buildPostContractRiskChangeControl(input?: {
  implementationScopeSlug?: string;
  definedControlIds?: string[];
}): PostContractRiskChangeControlResult {
  const definedControlIds = new Set(
    input?.definedControlIds ??
      POST_CONTRACT_CONTROLS.filter((control) => control.required).map(
        (control) => control.controlId,
      ),
  );

  return assemblePostContractRiskChangeControl({
    implementationScopeSlug:
      input?.implementationScopeSlug ?? IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG,
    definedControlIds,
  });
}
