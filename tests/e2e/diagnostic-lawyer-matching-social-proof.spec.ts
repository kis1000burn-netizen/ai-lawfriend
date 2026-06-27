import { test, expect } from "@playwright/test";

test.describe("diagnostic lawyer matching + social proof staging", () => {
  test.beforeEach(({ }, testInfo) => {
    if (!process.env.E2E_INCLUDE_DIAGNOSTIC_ACCESS) {
      testInfo.skip(
        true,
        "staging E2E: diagnostic:staging-full 또는 E2E_INCLUDE_DIAGNOSTIC_ACCESS=1 필요",
      );
    }
  });

  test("non-admin cannot read admin lawyer matching recommendation detail", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/admin/cases/clxxxxxxxxxxxxxxxxxxxxxxxxx/lawyer-matching/recommendations/rec-1",
    );
    expect([401, 403]).toContain(response.status());
  });

  test("lawyer dashboard page does not expose fixture identifiers in HTML", async ({
    page,
  }) => {
    await page.goto("/lawyer");
    const html = await page.content();
    expect(html).not.toContain("case-joohwan-land-access");
    expect(html).not.toContain("장주환");
    expect(html).not.toMatch(/\b\d{2,}\b.*건/);
  });
});

test.describe.skip("diagnostic admin matching approval chain (requires staging fixtures)", () => {
  test("admin generates recommendation, approves, and creates assignment", async () => {
    test.skip(true, "Requires staging admin session + seeded case/lawyer fixtures");
  });

  test("approved social proof payload contains only safe themes", async ({ request }) => {
    test.skip(true, "Requires authenticated lawyer session against staging");
    const response = await request.get("/lawyer");
    expect(response.ok()).toBeTruthy();
  });
});
