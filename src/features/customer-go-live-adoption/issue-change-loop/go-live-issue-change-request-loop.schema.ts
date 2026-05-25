/**
 * Product Phase 37-E — Go-live issue / change request loop schema (Zod SSOT).
 */
import { z } from "zod";

export const GO_LIVE_ISSUE_CHANGE_LOOP_SCHEMA_MARKER_PHASE37E =
  "phase37e-go-live-issue-change-loop-schema" as const;

export const GO_LIVE_ISSUE_CHANGE_LOOP_VERSION = "37-E.1" as const;

export const GO_LIVE_ISSUE_CHANGE_STEP_IDS = [
  "ISSUE_INTAKE",
  "SEVERITY_TRIAGE",
  "CHANGE_REQUEST_LOG",
  "RESOLUTION_TRACKING",
  "POST_INCIDENT_REVIEW",
] as const;

export const goLiveIssueChangeStepSchema = z.object({
  stepId: z.enum(GO_LIVE_ISSUE_CHANGE_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const goLiveIssueChangeRequestLoopResultSchema = z.object({
  version: z.literal(GO_LIVE_ISSUE_CHANGE_LOOP_VERSION),
  adoptionScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(goLiveIssueChangeStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  goLiveIssueChangeLoopReady: z.boolean(),
});

export type GoLiveIssueChangeStepId = (typeof GO_LIVE_ISSUE_CHANGE_STEP_IDS)[number];
export type GoLiveIssueChangeRequestLoopResult = z.infer<
  typeof goLiveIssueChangeRequestLoopResultSchema
>;
