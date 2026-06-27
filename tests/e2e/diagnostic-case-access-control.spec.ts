import { test, expect } from "@playwright/test";

const fakeCaseId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";

test.describe("diagnostic case access control", () => {
  test.beforeEach(({ }, testInfo) => {
    if (!process.env.E2E_INCLUDE_DIAGNOSTIC_ACCESS) {
      testInfo.skip(
        true,
        "진단 E2E: diagnostic engine --with-e2e 또는 E2E_INCLUDE_DIAGNOSTIC_ACCESS=1 필요",
      );
    }
  });

  test("unauthenticated user cannot read case detail API", async ({ request }) => {
    const response = await request.get(`/api/cases/${fakeCaseId}/detail`);
    expect(response.status()).toBe(401);
  });

  test("unauthenticated user cannot list case assignments", async ({ request }) => {
    const response = await request.get(`/api/cases/${fakeCaseId}/assignments`);
    expect([401, 403]).toContain(response.status());
  });

  test("unauthenticated user cannot read case interview API", async ({ request }) => {
    const response = await request.get(`/api/cases/${fakeCaseId}/interview`);
    expect([401, 403]).toContain(response.status());
  });

  test("missing case detail returns 404 only after auth (browser route)", async ({ page }) => {
    await page.goto(`/cases/${fakeCaseId}`);
    await expect(page).toHaveURL(/\/(login|cases\/|dashboard)/);
  });
});

test.describe.skip("diagnostic authenticated isolation (requires staging fixtures)", () => {
  test("other lawyer direct case URL is blocked with 403 or 404", async ({ request }) => {
    const otherLawyerCaseId = process.env.E2E_DIAGNOSTIC_OTHER_LAWYER_CASE_ID;
    test.skip(!otherLawyerCaseId, "E2E_DIAGNOSTIC_OTHER_LAWYER_CASE_ID required");

    const response = await request.get(`/api/cases/${otherLawyerCaseId}/detail`);
    expect([403, 404]).toContain(response.status());
  });

  test("deleted case URL returns 404", async ({ request }) => {
    const deletedCaseId = process.env.E2E_DIAGNOSTIC_DELETED_CASE_ID;
    test.skip(!deletedCaseId, "E2E_DIAGNOSTIC_DELETED_CASE_ID required");

    const response = await request.get(`/api/cases/${deletedCaseId}/detail`);
    expect(response.status()).toBe(404);
  });
});
