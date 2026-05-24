/**
 * Product Phase 30-A — Enterprise deployment model service.
 */
import { ENTERPRISE_SCALE_DEFAULT_TENANT_SLUG } from "./enterprise-deployment-model.registry";
import { assembleEnterpriseDeploymentModel } from "./enterprise-deployment-model.policy";
import { ENTERPRISE_DEPLOYMENT_OPTIONS } from "./enterprise-deployment-model.registry";
import type { EnterpriseDeploymentModelResult } from "./enterprise-deployment-model.schema";

export const ENTERPRISE_DEPLOYMENT_MODEL_SERVICE_MARKER_PHASE30A =
  "phase30a-enterprise-deployment-model-service" as const;

export function buildEnterpriseDeploymentModel(input?: {
  tenantSlug?: string;
  configuredOptionIds?: string[];
}): EnterpriseDeploymentModelResult {
  const configuredOptionIds = new Set(
    input?.configuredOptionIds ??
      ENTERPRISE_DEPLOYMENT_OPTIONS.filter((o) => o.required).map((o) => o.optionId),
  );

  return assembleEnterpriseDeploymentModel({
    tenantSlug: input?.tenantSlug ?? ENTERPRISE_SCALE_DEFAULT_TENANT_SLUG,
    configuredOptionIds,
  });
}
