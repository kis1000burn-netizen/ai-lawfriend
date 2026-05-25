/**
 * Product Phase 48-A — Lawyer Workbench Navigation Shell SSOT.
 */
import type { LawyerWorkbenchNavigationShellResult } from "./navigation-shell.schema";

export const LAWYER_WORKBENCH_NAVIGATION_SHELL_REGISTRY_MARKER_48A =
  "phase48a-navigation-shell-registry" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG = "legal-reliability-lawyer-workbench-001" as const;

type Item = Omit<LawyerWorkbenchNavigationShellResult["items"][number], "defined">;

export const LAWYER_WORKBENCH_NAVIGATION_SHELL_ITEMS: Item[] = [
  { itemId: "CASE_SUMMARY_BAR", label: "Case summary bar", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench" },
  { itemId: "LEGAL_RELIABILITY_STATUS", label: "Legal Reliability status", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench" },
  { itemId: "REVIEW_PROGRESS", label: "Lawyer review progress", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench" },
  { itemId: "UNREVIEWED_AI_COUNT", label: "Unreviewed AI candidate count", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench" },
  { itemId: "HIGH_RISK_COUNT", label: "HIGH risk weakness count", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench" },
  { itemId: "SUPPLEMENT_REQUEST_COUNT", label: "Supplement request needed count", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench" },
  { itemId: "PANEL_NAV", label: "Workbench panel navigation", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench" },
];
