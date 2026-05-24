/**
 * Product Phase 30-A — Enterprise deployment model options SSOT.
 */
import type { EnterpriseDeploymentModelResult } from "./enterprise-deployment-model.schema";

export const ENTERPRISE_DEPLOYMENT_MODEL_REGISTRY_MARKER_PHASE30A =
  "phase30a-enterprise-deployment-model-registry" as const;

export const ENTERPRISE_SCALE_DEFAULT_TENANT_SLUG = "enterprise-law-network-001" as const;

type DeploymentOption = Omit<
  EnterpriseDeploymentModelResult["options"][number],
  "configured"
>;

export const ENTERPRISE_DEPLOYMENT_OPTIONS: DeploymentOption[] = [
  { optionId: "SINGLE_TENANT_DEDICATED", label: "Dedicated single-tenant stack", required: true },
  { optionId: "MULTI_TENANT_ISOLATED", label: "Multi-tenant row-level isolation", required: true },
  { optionId: "HYBRID_BRANCH", label: "Hybrid branch topology", required: true },
  { optionId: "PRIVATE_VPC", label: "Private VPC / network segment", required: true },
  { optionId: "DR_SECONDARY_REGION", label: "DR secondary region baseline", required: false },
];
