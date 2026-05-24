/**
 * Product Phase 26-B — Real tenant pilot setup schema (Zod SSOT).
 */
import { z } from "zod";

export const REAL_TENANT_PILOT_SETUP_SCHEMA_MARKER_PHASE26B =
  "phase26b-real-tenant-pilot-setup-schema" as const;

export const REAL_TENANT_PILOT_SETUP_VERSION = "26-B.1" as const;

export const realTenantPilotStepSchema = z.object({
  stepId: z.string().min(1),
  label: z.string().min(1),
  ownerRole: z.enum(["PLATFORM_ADMIN", "TENANT_OWNER", "TENANT_ADMIN", "PILOT_LAWYER"]),
  required: z.boolean().default(true),
  completed: z.boolean(),
  docPath: z.string().optional(),
});

export const realTenantPilotSetupResultSchema = z.object({
  version: z.literal(REAL_TENANT_PILOT_SETUP_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(realTenantPilotStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  pilotTenantReady: z.boolean(),
});

export type RealTenantPilotSetupResult = z.infer<typeof realTenantPilotSetupResultSchema>;
