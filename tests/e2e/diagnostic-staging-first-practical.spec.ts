import { test, expect } from "@playwright/test";
import {
  assertNoSensitiveFixtureLeak,
  buildDiagnosticRunFixtureNames,
  getDiagnosticRunId,
} from "./helpers/diagnostic-run-fixture";

test.describe("diagnostic staging first practical verification", () => {
  test.beforeEach(({ }, testInfo) => {
    if (!process.env.E2E_INCLUDE_DIAGNOSTIC_ACCESS) {
      testInfo.skip(
        true,
        "staging first practical E2E requires E2E_INCLUDE_DIAGNOSTIC_ACCESS=1",
      );
    }
    if (!getDiagnosticRunId()) {
      testInfo.skip(true, "DIAGNOSTIC_RUN_ID is required");
    }
  });

  test.afterAll(async () => {
    const runId = getDiagnosticRunId();
    if (!runId) return;
    try {
      const fixtures = buildDiagnosticRunFixtureNames(runId);
      expect(fixtures.caseCrossAccessTitle.startsWith(runId)).toBe(true);
    } catch {
      // cleanup marker is recorded by engine script even when fixture helper fails
    }
  });

  test("uses run-scoped fixture names for lawyer A/B and cross-access case", () => {
    const fixtures = buildDiagnosticRunFixtureNames();
    expect(fixtures.lawyerAEmail).toBe(`${fixtures.runId}-lawyer-a@diagnostic.local`);
    expect(fixtures.lawyerBEmail).toBe(`${fixtures.runId}-lawyer-b@diagnostic.local`);
    expect(fixtures.caseCrossAccessTitle).toBe(`${fixtures.runId}-case-cross-access`);
  });

  test("non-admin cannot read admin matching recommendation detail", async ({ request }) => {
    const fixtures = buildDiagnosticRunFixtureNames();
    const response = await request.get(
      `/api/admin/cases/clxxxxxxxxxxxxxxxxxxxxxxxxx/lawyer-matching/recommendations/${fixtures.runId}-rec`,
    );
    expect([401, 403]).toContain(response.status());
  });

  test("lawyer dashboard HTML does not leak fixture identifiers or counts", async ({ page }) => {
    await page.goto("/lawyer");
    const html = await page.content();
    assertNoSensitiveFixtureLeak(html);
  });
});

test.describe.skip("diagnostic staging approval chain (requires live staging fixtures)", () => {
  test("admin recommendation is created without auto CaseAssignment", async () => {
    test.skip(true, "Requires authenticated admin session and seeded staging DB");
  });

  test("lawyer B cannot access lawyer A case URL", async ({ request }) => {
    test.skip(true, "Requires authenticated lawyer B session and run-scoped case id");
    const response = await request.get("/api/cases/run-scoped-case/detail");
    expect([401, 403, 404]).toContain(response.status());
  });

  test("deleted case URL returns 404", async ({ request }) => {
    test.skip(true, "Requires authenticated session and deleted run-scoped case id");
    const response = await request.get("/api/cases/run-scoped-deleted-case/detail");
    expect(response.status()).toBe(404);
  });
});
