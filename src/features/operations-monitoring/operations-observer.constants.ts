/**
 * Phase 17-B — Error / Audit / AI Usage observer domains.
 * Maps AuditLog.action prefixes to operator-facing incident categories.
 */
export const OPERATIONS_MONITORING_RC_OBSERVER_MARKER_PHASE17B =
  "phase17b-operations-error-audit-ai-observer" as const;

export const OPERATIONS_OBSERVER_DOMAINS = [
  "AI_USAGE",
  "DOCUMENT_PROCESSING",
  "NOTIFICATION",
  "FILE_PROCESSING",
  "ERROR",
] as const;

export type OperationsObserverDomain = (typeof OPERATIONS_OBSERVER_DOMAINS)[number];

/** AuditLog.action prefix → domain (first match wins) */
export const OPERATIONS_OBSERVER_ACTION_PREFIXES: Record<
  OperationsObserverDomain,
  readonly string[]
> = {
  AI_USAGE: [
    "AI_GOVERNANCE_",
    "AI_INVOKE",
    "CASE_SUMMARY",
    "LITIGATION_ANALYZE",
    "LITIGATION_OPPONENT_BRIEF",
    "LITIGATION_CLASSIFY",
  ],
  DOCUMENT_PROCESSING: [
    "LITIGATION_CMD_CENTER",
    "LITIGATION_EXTRACT",
    "LITIGATION_REVIEW",
    "DOCUMENT_",
    "SUPPLEMENT_",
    "SECURE_DOCUMENT",
  ],
  NOTIFICATION: ["DEADLINE_", "EXTERNAL_", "CLIENT_NOTIFICATION"],
  FILE_PROCESSING: ["FILE_", "UPLOAD", "ATTACHMENT", "CLIENT_PORTAL_FILE"],
  ERROR: ["_FAILED", "_DENIED", "_ERROR", "FAIL"],
};

export function resolveOperationsObserverDomain(action: string): OperationsObserverDomain {
  const upper = action.toUpperCase();
  for (const domain of OPERATIONS_OBSERVER_DOMAINS) {
    const prefixes = OPERATIONS_OBSERVER_ACTION_PREFIXES[domain];
    if (prefixes.some((prefix) => upper.includes(prefix.toUpperCase()))) {
      return domain;
    }
  }
  return "DOCUMENT_PROCESSING";
}

export function isOperationsObserverIssueAction(action: string): boolean {
  const upper = action.toUpperCase();
  return (
    upper.includes("FAILED") ||
    upper.includes("DENIED") ||
    upper.includes("_ERROR") ||
    upper.endsWith("_FAIL")
  );
}
