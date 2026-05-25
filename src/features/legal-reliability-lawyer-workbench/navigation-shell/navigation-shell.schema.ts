/**
 * Product Phase 48-A — Lawyer Workbench Navigation Shell schema SSOT.
 */
import { z } from "zod";

export const LAWYER_WORKBENCH_NAVIGATION_SHELL_VERSION = "48-A.1" as const;

export const LAWYER_WORKBENCH_NAVIGATION_SHELL_ITEM_IDS = ["CASE_SUMMARY_BAR", "LEGAL_RELIABILITY_STATUS", "REVIEW_PROGRESS", "UNREVIEWED_AI_COUNT", "HIGH_RISK_COUNT", "SUPPLEMENT_REQUEST_COUNT", "PANEL_NAV"] as const;

export const lawyerWorkbenchNavigationShellItemIdSchema = z.enum(LAWYER_WORKBENCH_NAVIGATION_SHELL_ITEM_IDS);

export const lawyerWorkbenchNavigationShellItemSchema = z.object({
  itemId: lawyerWorkbenchNavigationShellItemIdSchema,
  label: z.string(),
  required: z.boolean(),
  defined: z.boolean(),
  uiRoute: z.string().optional(),
});

export const lawyerWorkbenchNavigationShellResultSchema = z.object({
  version: z.literal(LAWYER_WORKBENCH_NAVIGATION_SHELL_VERSION),
  workbenchScopeSlug: z.string(),
  generatedAt: z.string(),
  uiRoute: z.string(),
  items: z.array(lawyerWorkbenchNavigationShellItemSchema),
  completionRate: z.number(),
  lawyerWorkbenchNavigationShellReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type LawyerWorkbenchNavigationShellResult = z.infer<typeof lawyerWorkbenchNavigationShellResultSchema>;
