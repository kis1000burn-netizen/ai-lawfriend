/**
 * Product Phase 27-D — Pilot issue triage & hotfix loop schema (Zod SSOT).
 */
import { z } from "zod";

export const PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_SCHEMA_MARKER_PHASE27D =
  "phase27d-pilot-issue-triage-hotfix-loop-schema" as const;

export const PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_VERSION = "27-D.1" as const;

export const HOTFIX_LOOP_STEP_IDS = [
  "INTAKE",
  "TRIAGE",
  "HOTFIX_BRANCH",
  "STAGING_VERIFY",
  "PRODUCTION_DEPLOY",
  "POSTMORTEM",
] as const;

export const hotfixLoopStepSchema = z.object({
  stepId: z.enum(HOTFIX_LOOP_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  runbookPath: z.string().optional(),
  completed: z.boolean(),
});

export const pilotIssueTriageHotfixLoopResultSchema = z.object({
  version: z.literal(PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_VERSION),
  generatedAt: z.string().datetime(),
  steps: z.array(hotfixLoopStepSchema).min(1),
  openIssueCount: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  hotfixLoopReady: z.boolean(),
});

export type HotfixLoopStepId = (typeof HOTFIX_LOOP_STEP_IDS)[number];
export type PilotIssueTriageHotfixLoopResult = z.infer<
  typeof pilotIssueTriageHotfixLoopResultSchema
>;
