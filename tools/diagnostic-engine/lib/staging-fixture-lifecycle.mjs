import { writeJson } from "./paths.mjs";

export function buildRunScopedFixtureNames(runId) {
  const safeRunId = runId.trim();
  return {
    runId: safeRunId,
    lawyerAEmail: `${safeRunId}-lawyer-a@diagnostic.local`,
    lawyerBEmail: `${safeRunId}-lawyer-b@diagnostic.local`,
    adminEmail: `${safeRunId}-admin@diagnostic.local`,
    clientEmail: `${safeRunId}-client@diagnostic.local`,
    caseCrossAccessTitle: `${safeRunId}-case-cross-access`,
    caseDeletedTitle: `${safeRunId}-case-deleted`,
    recommendationNote: `${safeRunId} admin review recommendation`,
  };
}

export function recordFixtureCleanup(input) {
  const payload = {
    runId: input.runId,
    evaluatedAt: new Date().toISOString(),
    status: input.status,
    deletedResources: input.deletedResources ?? [],
    failures: input.failures ?? [],
    note: "Fixture identifiers only — no credential values logged.",
  };
  writeJson("_runtime/staging-fixture-cleanup.json", payload);
  return payload;
}

export async function cleanupRunScopedFixtures(runId, deleter) {
  const fixtures = buildRunScopedFixtureNames(runId);
  const deletedResources = [];
  const failures = [];

  try {
    const result = await deleter(fixtures);
    deletedResources.push(...(result.deletedResources ?? []));
    failures.push(...(result.failures ?? []));
  } catch (error) {
    failures.push({
      resource: "cleanup-runner",
      message: error instanceof Error ? error.message : "cleanup failed",
    });
  }

  return recordFixtureCleanup({
    runId,
    status: failures.length > 0 ? "CLEANUP_FAILED" : "CLEANUP_OK",
    deletedResources,
    failures,
  });
}
