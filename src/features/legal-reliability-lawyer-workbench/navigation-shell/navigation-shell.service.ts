/**
 * Product Phase 48-A — Lawyer Workbench Navigation Shell service.
 */
import { LAWYER_WORKBENCH_NAVIGATION_SHELL_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./navigation-shell.registry";
import { assembleLawyerWorkbenchNavigationShell } from "./navigation-shell.policy";
import type { LawyerWorkbenchNavigationShellResult } from "./navigation-shell.schema";

export const LAWYER_WORKBENCH_NAVIGATION_SHELL_SERVICE_MARKER_48A = "phase48a-navigation-shell-service" as const;

export function buildLawyerWorkbenchNavigationShell(input?: {
  workbenchScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerWorkbenchNavigationShellResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_WORKBENCH_NAVIGATION_SHELL_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerWorkbenchNavigationShell({
    workbenchScopeSlug: input?.workbenchScopeSlug ?? LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
