/**
 * Product Phase 32-A — Security control inventory schema (Zod SSOT).
 */
import { z } from "zod";

export const SECURITY_CONTROL_INVENTORY_SCHEMA_MARKER_PHASE32A =
  "phase32a-security-control-inventory-schema" as const;

export const SECURITY_CONTROL_INVENTORY_VERSION = "32-A.1" as const;

export const SECURITY_CONTROL_IDS = [
  "ACCESS_CONTROL",
  "ROLE_PERMISSION",
  "TENANT_ISOLATION",
  "ADMIN_ACTION_AUDIT",
  "EXTERNAL_PROVIDER_SECURITY",
  "AI_DATA_HANDLING",
  "INCIDENT_RESPONSE",
  "RETENTION_DELETION",
] as const;

export const securityControlItemSchema = z.object({
  controlId: z.enum(SECURITY_CONTROL_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  documented: z.boolean(),
});

export const securityControlInventoryResultSchema = z.object({
  version: z.literal(SECURITY_CONTROL_INVENTORY_VERSION),
  reviewScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  controls: z.array(securityControlItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  securityControlInventoryReady: z.boolean(),
});

export type SecurityControlId = (typeof SECURITY_CONTROL_IDS)[number];
export type SecurityControlInventoryResult = z.infer<
  typeof securityControlInventoryResultSchema
>;
