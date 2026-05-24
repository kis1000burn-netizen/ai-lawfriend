/**
 * Phase 17-F — Operations monitoring triage fixture policy (static validation).
 */
import fs from "node:fs";
import path from "node:path";

export const OPERATIONS_MONITORING_FIXTURE_MARKER_PHASE17F =
  "phase17f-operations-monitoring-live-smoke-fixtures";

export const OPERATIONS_MONITORING_FIXTURE_PATHS = [
  "data/operations/fixtures/operations-monitoring-audit-issue.fixture.json",
  "data/operations/fixtures/operations-monitoring-cron-failure.fixture.json",
  "data/operations/fixtures/operations-monitoring-external-message-failure.fixture.json",
];

const REQUIRED_SNAPSHOT_KEYS = [
  "capturedAt",
  "windowHours",
  "health",
  "release",
  "audit",
  "externalMessages",
  "cron",
];

const OBSERVER_DOMAINS = [
  "AI_USAGE",
  "DOCUMENT_PROCESSING",
  "NOTIFICATION",
  "FILE_PROCESSING",
  "ERROR",
];

function readJson(root, relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing fixture: ${relativePath}`);
  }
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

export function validateOperationsMonitoringFixture(relativePath, root = process.cwd()) {
  const data = readJson(root, relativePath);
  const errors = [];

  if (data.phase !== "17-F") {
    errors.push(`${relativePath}: phase must be "17-F"`);
  }
  if (!data.fixtureId || !data.description) {
    errors.push(`${relativePath}: fixtureId and description required`);
  }
  if (!data.sample || typeof data.sample !== "object") {
    errors.push(`${relativePath}: sample object required`);
  }

  return { relativePath, errors, data };
}

export function validateAllOperationsMonitoringFixtures(root = process.cwd()) {
  const results = OPERATIONS_MONITORING_FIXTURE_PATHS.map((p) =>
    validateOperationsMonitoringFixture(p, root),
  );
  const errors = results.flatMap((r) => r.errors);
  return { results, errors, passed: errors.length === 0 };
}

export function assertSnapshotResponseShape(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return ["snapshot data must be an object"];
  }
  for (const key of REQUIRED_SNAPSHOT_KEYS) {
    if (!(key in data)) {
      errors.push(`missing snapshot key: ${key}`);
    }
  }
  if (data.audit?.byDomain) {
    for (const domain of OBSERVER_DOMAINS) {
      if (typeof data.audit.byDomain[domain] !== "number") {
        errors.push(`audit.byDomain.${domain} must be a number`);
      }
    }
  } else {
    errors.push("audit.byDomain required");
  }
  if (!Array.isArray(data.audit?.recentIssues)) {
    errors.push("audit.recentIssues must be an array");
  }
  if (!Array.isArray(data.externalMessages?.recentFailures)) {
    errors.push("externalMessages.recentFailures must be an array");
  }
  if (!Array.isArray(data.cron?.recentFailures)) {
    errors.push("cron.recentFailures must be an array");
  }
  return errors;
}

/** ADMIN auth regression — unauthenticated admin ops APIs must not return 200 + data */
export function assertAdminApiBlocked(status, json) {
  if (status === 200 && json?.ok === true && json?.data) {
    return ["admin API returned 200 with data without auth"];
  }
  if (status !== 401 && status !== 403) {
    return [`expected 401/403 without auth, got ${status}`];
  }
  return [];
}
