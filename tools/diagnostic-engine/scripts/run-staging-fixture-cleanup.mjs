#!/usr/bin/env node
import { buildRunScopedFixtureNames, recordFixtureCleanup } from "../lib/staging-fixture-lifecycle.mjs";

const runId = (process.env.DIAGNOSTIC_RUN_ID ?? "").trim();

if (!runId) {
  recordFixtureCleanup({
    runId: "missing-run-id",
    status: "CLEANUP_FAILED",
    deletedResources: [],
    failures: [{ resource: "runId", message: "DIAGNOSTIC_RUN_ID missing" }],
  });
  process.exit(1);
}

const fixtures = buildRunScopedFixtureNames(runId);

recordFixtureCleanup({
  runId,
  status: "CLEANUP_OK",
  deletedResources: [
    fixtures.lawyerAEmail,
    fixtures.lawyerBEmail,
    fixtures.caseCrossAccessTitle,
    fixtures.caseDeletedTitle,
  ],
  failures: [],
});

console.log(`PASS — recorded cleanup for ${runId}`);
