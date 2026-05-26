import { z } from "zod";

export const PHASE60B_ERROR_DETECTION_VERSION = "60-B.1" as const;
export const PHASE60B_ERROR_DETECTION_MARKER = "phase60b-error-detection-v1" as const;

export const brainIssueSourceSchema = z.enum([
  "TEST",
  "TYPECHECK",
  "LINT",
  "VERIFY",
  "RUNTIME",
  "MIGRATION",
  "EVIDENCE",
  "NAVIGATOR",
  "STATIC",
]);

export const brainIssueSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const brainDetectedIssueSchema = z.object({
  issueId: z.string().min(1),
  source: brainIssueSourceSchema,
  severity: brainIssueSeveritySchema,
  phase: z.string().optional(),
  files: z.array(z.string()),
  summary: z.string().min(1),
  rawLogRef: z.string().min(1),
  detectedAt: z.string().datetime(),
});

export type BrainDetectedIssue = z.infer<typeof brainDetectedIssueSchema>;

export const brainScanInputSchema = z.object({
  vitestLog: z.string().optional(),
  typecheckLog: z.string().optional(),
  lintLog: z.string().optional(),
  verifyLog: z.string().optional(),
  runtimeLog: z.string().optional(),
  includeStaticRepoChecks: z.boolean().default(true),
});

export type BrainScanInput = z.infer<typeof brainScanInputSchema>;

export const brainScanResultSchema = z.object({
  marker: z.literal(PHASE60B_ERROR_DETECTION_MARKER),
  version: z.literal(PHASE60B_ERROR_DETECTION_VERSION),
  scannedAt: z.string().datetime(),
  issues: z.array(brainDetectedIssueSchema),
  recommendedCommands: z.array(z.string()),
});

export type BrainScanResult = z.infer<typeof brainScanResultSchema>;
