export function getDiagnosticRunId() {
  return (process.env.DIAGNOSTIC_RUN_ID ?? "").trim();
}

export function buildDiagnosticRunFixtureNames(runId = getDiagnosticRunId()) {
  if (!runId) {
    throw new Error("DIAGNOSTIC_RUN_ID is required for staging diagnostic fixtures");
  }

  return {
    runId,
    lawyerAEmail: `${runId}-lawyer-a@diagnostic.local`,
    lawyerBEmail: `${runId}-lawyer-b@diagnostic.local`,
    adminEmail: `${runId}-admin@diagnostic.local`,
    clientEmail: `${runId}-client@diagnostic.local`,
    caseCrossAccessTitle: `${runId}-case-cross-access`,
    caseDeletedTitle: `${runId}-case-deleted`,
  };
}

export function assertNoSensitiveFixtureLeak(payload: string) {
  const forbiddenPatterns = [
    /case-joohwan-/,
    /장주환/,
    /\"recentPeerReviewCount\"/,
    /\"recentArgumentSignalCount\"/,
    /\b\d{2,}\b.*건/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(payload)) {
      throw new Error(`Sensitive fixture leak detected: ${pattern}`);
    }
  }
}
