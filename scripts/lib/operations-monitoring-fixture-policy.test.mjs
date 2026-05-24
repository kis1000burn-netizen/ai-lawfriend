import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertAdminApiBlocked,
  assertSnapshotResponseShape,
  validateAllOperationsMonitoringFixtures,
} from "./operations-monitoring-fixture-policy.mjs";

describe("operations-monitoring-fixture-policy (Phase 17-F)", () => {
  it("validates all 17-F fixtures on disk", () => {
    const { passed, errors } = validateAllOperationsMonitoringFixtures();
    assert.equal(errors.length, 0, errors.join("; "));
    assert.equal(passed, true);
    assert.equal(validateAllOperationsMonitoringFixtures().results.length, 3);
  });

  it("asserts monitoring snapshot response shape", () => {
    const errors = assertSnapshotResponseShape({
      capturedAt: "2026-05-24T00:00:00.000Z",
      windowHours: 24,
      health: { ok: true },
      release: { commitSha: "abc" },
      audit: {
        byDomain: {
          AI_USAGE: 0,
          DOCUMENT_PROCESSING: 0,
          NOTIFICATION: 0,
          FILE_PROCESSING: 0,
          ERROR: 0,
        },
        recentIssues: [],
      },
      externalMessages: { recentFailures: [] },
      cron: { recentFailures: [] },
    });
    assert.deepEqual(errors, []);
  });

  it("blocks unauthenticated admin API success", () => {
    assert.deepEqual(assertAdminApiBlocked(401, {}), []);
    assert.deepEqual(assertAdminApiBlocked(403, {}), []);
    assert.notEqual(assertAdminApiBlocked(200, { ok: true, data: {} }).length, 0);
  });
});
