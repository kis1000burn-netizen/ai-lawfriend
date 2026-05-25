/**
 * Product Phase 35-D — DPA / security addendum pack schema (Zod SSOT).
 */
import { z } from "zod";

export const DPA_SECURITY_ADDENDUM_SCHEMA_MARKER_PHASE35D =
  "phase35d-dpa-security-addendum-schema" as const;

export const DPA_SECURITY_ADDENDUM_VERSION = "35-D.1" as const;

export const DPA_SECURITY_ADDENDUM_IDS = [
  "DPA_STANDARD",
  "SUBPROCESSOR_LIST",
  "SECURITY_ADDENDUM",
  "BAA_IF_REQUIRED",
  "DATA_RESIDENCY_RIDER",
] as const;

export const dpaSecurityAddendumItemSchema = z.object({
  addendumId: z.enum(DPA_SECURITY_ADDENDUM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const dpaSecurityAddendumPackResultSchema = z.object({
  version: z.literal(DPA_SECURITY_ADDENDUM_VERSION),
  contractingScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  addenda: z.array(dpaSecurityAddendumItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  dpaSecurityAddendumReady: z.boolean(),
});

export type DpaSecurityAddendumId = (typeof DPA_SECURITY_ADDENDUM_IDS)[number];
export type DpaSecurityAddendumPackResult = z.infer<typeof dpaSecurityAddendumPackResultSchema>;
