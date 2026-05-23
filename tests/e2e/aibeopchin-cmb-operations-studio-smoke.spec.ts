import { test, expect } from "@playwright/test";

/**
 * Phase 6-H — CMB Operations Studio E2E
 *
 * A. always-on: 미로그인 API → 401/403
 * B. optional: E2E_CMB_OPERATIONS_STUDIO_SMOKE=1 + ADMIN + db:migrate
 */

test.describe("CMB Operations Studio — always-on API gate", () => {
  test("미로그인 GET operations-studio 는 401/403", async ({ request }) => {
    const res = await request.get("/api/admin/cmb/operations-studio");
    expect([401, 403]).toContain(res.status());
  });
});

const studioSmokeEnabled =
  process.env.E2E_CMB_OPERATIONS_STUDIO_SMOKE === "1" &&
  process.env.E2E_ADMIN_EMAIL &&
  process.env.E2E_ADMIN_PASSWORD;

const describeStudioSmoke = studioSmokeEnabled ? test.describe : test.describe.skip;

describeStudioSmoke("CMB Operations Studio — ADMIN smoke (Phase 6-H)", () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL!;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

  test("ADMIN GET dashboard meta-only", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { email: adminEmail, password: adminPassword },
      headers: { "Content-Type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.get("/api/admin/cmb/operations-studio");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.dashboard).toHaveProperty("revisionBacklog");
    expect(body.data.dashboard).toHaveProperty("caseTypeCoverage");
    expect(JSON.stringify(body.data.dashboard)).not.toContain('"configJson"');
  });

  test("관리자 Operations Studio UI", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(adminEmail);
    await page.getByPlaceholder("비밀번호 입력").fill(adminPassword);
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 15000 });

    await page.goto("/admin/cmb/operations-studio");
    await expect(page.getByTestId("cmb-operations-studio-dashboard")).toBeVisible();
    await expect(page.getByTestId("cmb-ops-total-revisions")).toBeVisible();
  });
});
