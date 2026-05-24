/**
 * Product Phase 30-A — Enterprise deployment model policy SSOT.
 */
import { ENTERPRISE_DEPLOYMENT_OPTIONS } from "./enterprise-deployment-model.registry";
import type { EnterpriseDeploymentModelResult } from "./enterprise-deployment-model.schema";
import { ENTERPRISE_DEPLOYMENT_MODEL_VERSION } from "./enterprise-deployment-model.schema";

export const ENTERPRISE_DEPLOYMENT_MODEL_POLICY_MARKER_PHASE30A =
  "phase30a-enterprise-deployment-model-policy" as const;

export function assembleEnterpriseDeploymentModel(input: {
  tenantSlug: string;
  configuredOptionIds: Set<string>;
  generatedAt?: string;
}): EnterpriseDeploymentModelResult {
  const options = ENTERPRISE_DEPLOYMENT_OPTIONS.map((option) => ({
    ...option,
    configured: input.configuredOptionIds.has(option.optionId),
  }));

  const required = options.filter((option) => option.required);
  const configuredRequired = required.filter((option) => option.configured).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((configuredRequired / required.length) * 100);

  return {
    version: ENTERPRISE_DEPLOYMENT_MODEL_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    options,
    completionRate,
    deploymentModelReady: configuredRequired === required.length,
  };
}
