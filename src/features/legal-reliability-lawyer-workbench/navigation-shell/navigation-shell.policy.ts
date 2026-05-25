/**
 * Product Phase 48-A — Lawyer Workbench Navigation Shell policy SSOT.
 */
import { LAWYER_WORKBENCH_NAVIGATION_SHELL_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./navigation-shell.registry";
import type { LawyerWorkbenchNavigationShellResult } from "./navigation-shell.schema";
import { LAWYER_WORKBENCH_NAVIGATION_SHELL_VERSION } from "./navigation-shell.schema";

export const LAWYER_WORKBENCH_NAVIGATION_SHELL_POLICY_MARKER_48A = "phase48a-navigation-shell-policy" as const;
export const LAWYER_WORKBENCH_NAVIGATION_SHELL_GATE_MARKER_48A = "phase48a-navigation-shell-gate" as const;

export const LAWYERWORKBENCHNAVIGATIONSHELL_BOUNDARY_LAWYER_REVIEW_REQUIRED = "LAWYER_REVIEW_REQUIRED" as const;
export const LAWYERWORKBENCHNAVIGATIONSHELL_BOUNDARY_NO_UNEXPLAINED_WORKBENCH_ITEM = "NO_UNEXPLAINED_WORKBENCH_ITEM" as const;

export function assembleLawyerWorkbenchNavigationShell(input: {
  workbenchScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerWorkbenchNavigationShellResult {
  const items = LAWYER_WORKBENCH_NAVIGATION_SHELL_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_WORKBENCH_NAVIGATION_SHELL_VERSION,
    workbenchScopeSlug: input.workbenchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    uiRoute: "/cases/{caseId}/lawyer-workbench",
    items,
    completionRate,
    lawyerWorkbenchNavigationShellReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
