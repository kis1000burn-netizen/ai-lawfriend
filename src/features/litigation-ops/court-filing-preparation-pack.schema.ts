/**
 * Product Phase 24-B — Court filing preparation pack schema (Zod SSOT).
 */
import { z } from "zod";

export const COURT_FILING_PREPARATION_PACK_SCHEMA_MARKER_PHASE24B =
  "phase24b-court-filing-preparation-pack-schema" as const;

export const COURT_FILING_PREPARATION_PACK_VERSION = "24-B.1" as const;

export const COURT_FILING_PACK_TYPES = [
  "COMPLAINT",
  "ANSWER",
  "BRIEF",
  "EVIDENCE_LIST",
  "GENERIC",
] as const;

export const courtFilingPackSectionSchema = z.object({
  sectionKey: z.enum([
    "coverSheet",
    "parties",
    "claims",
    "evidenceIndex",
    "deadlines",
    "tasks",
    "attachments",
    "disclaimer",
  ]),
  label: z.string().min(1),
  required: z.boolean().default(true),
});

export const courtFilingPreparationPackSchema = z.object({
  packVersion: z.literal(COURT_FILING_PREPARATION_PACK_VERSION),
  caseId: z.string().min(1),
  filingType: z.enum(COURT_FILING_PACK_TYPES),
  generatedAt: z.string().datetime(),
  courtName: z.string().nullable().optional(),
  sectionsIncluded: z.array(courtFilingPackSectionSchema),
  readinessScore: z.number().min(0).max(100),
  missingRequiredSections: z.array(z.string()),
  disclaimer: z.string().min(1),
});

export type CourtFilingPackType = (typeof COURT_FILING_PACK_TYPES)[number];
export type CourtFilingPreparationPack = z.infer<typeof courtFilingPreparationPackSchema>;
