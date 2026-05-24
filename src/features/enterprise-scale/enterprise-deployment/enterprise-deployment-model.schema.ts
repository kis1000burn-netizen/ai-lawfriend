/**
 * Product Phase 30-A — Enterprise deployment model schema (Zod SSOT).
 */
import { z } from "zod";

export const ENTERPRISE_DEPLOYMENT_MODEL_SCHEMA_MARKER_PHASE30A =
  "phase30a-enterprise-deployment-model-schema" as const;

export const ENTERPRISE_DEPLOYMENT_MODEL_VERSION = "30-A.1" as const;

export const DEPLOYMENT_MODEL_OPTION_IDS = [
  "SINGLE_TENANT_DEDICATED",
  "MULTI_TENANT_ISOLATED",
  "HYBRID_BRANCH",
  "PRIVATE_VPC",
  "DR_SECONDARY_REGION",
] as const;

export const deploymentModelOptionSchema = z.object({
  optionId: z.enum(DEPLOYMENT_MODEL_OPTION_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  configured: z.boolean(),
});

export const enterpriseDeploymentModelResultSchema = z.object({
  version: z.literal(ENTERPRISE_DEPLOYMENT_MODEL_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  options: z.array(deploymentModelOptionSchema).min(1),
  completionRate: z.number().min(0).max(100),
  deploymentModelReady: z.boolean(),
});

export type DeploymentModelOptionId = (typeof DEPLOYMENT_MODEL_OPTION_IDS)[number];
export type EnterpriseDeploymentModelResult = z.infer<
  typeof enterpriseDeploymentModelResultSchema
>;
