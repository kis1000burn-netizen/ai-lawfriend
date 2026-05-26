import { z } from "zod";
import { brainDetectedIssueSchema } from "./phase60b-error-detection.schema";

export const PHASE60C_CONFLICT_DIAGNOSIS_VERSION = "60-C.1" as const;
export const PHASE60C_CONFLICT_DIAGNOSIS_MARKER = "phase60c-conflict-diagnosis-v1" as const;

export const brainDiagnosisCodeSchema = z.enum([
  "TYPE_MISMATCH",
  "MISSING_BOUNDARY_MARKER",
  "PHASE_STATUS_INCONSISTENCY",
  "VERIFY_SCRIPT_OUT_OF_SYNC",
  "SCHEMA_POLICY_DRIFT",
  "MIGRATION_REQUIRED",
  "TENANT_SCOPE_BYPASS_RISK",
  "CLIENT_VISIBILITY_RISK",
  "TEST_FAILURE",
  "LINT_VIOLATION",
  "GENERIC_RUNTIME_ERROR",
  "EVIDENCE_TAG_MISSING",
  "UNKNOWN",
]);

export type BrainDiagnosisCode = z.infer<typeof brainDiagnosisCodeSchema>;

export const brainDiagnosisSchema = z.object({
  diagnosisId: z.string().min(1),
  issueId: z.string().min(1),
  code: brainDiagnosisCodeSchema,
  summary: z.string().min(1),
  likelyRootCause: z.string().min(1),
  affectedPhase: z.string().optional(),
  boundaryViolations: z.array(z.string()),
  safeMitigationHints: z.array(z.string()),
  diagnosedAt: z.string().datetime(),
});

export type BrainDiagnosis = z.infer<typeof brainDiagnosisSchema>;

export const brainDiagnoseInputSchema = z.object({
  issueIds: z.array(z.string()).optional(),
});

export const brainDiagnoseResultSchema = z.object({
  marker: z.literal(PHASE60C_CONFLICT_DIAGNOSIS_MARKER),
  version: z.literal(PHASE60C_CONFLICT_DIAGNOSIS_VERSION),
  diagnosedAt: z.string().datetime(),
  diagnoses: z.array(brainDiagnosisSchema),
  issues: z.array(brainDetectedIssueSchema),
});

export type BrainDiagnoseResult = z.infer<typeof brainDiagnoseResultSchema>;
