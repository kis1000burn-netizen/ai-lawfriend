import { test, expect } from "@playwright/test";

/**
 * A. 항상 실행: 미로그인 lookup API → 401 (CI/로컬 모두 "상시 스모크").
 * B. 옵션: `smokeEnabled`일 때만 PENDING/APPROVED 브라우저·API 흐름 — 스테이징/CI는 계정·env 준비 후 [425] PASS, 미준비 시 BLOCKED(스킵).
 *
 * 로컬: `npm run dev` 가 떠 있고 DB에 계정이 있을 때 B를 활성화합니다.
 *
 * ```bash
 * $env:E2E_LAWYER_VERIFICATION_SMOKE="1"
 * $env:E2E_LAWYER_PENDING_EMAIL="pending@example.com"
 * $env:E2E_LAWYER_PENDING_PASSWORD="..."
 * $env:E2E_LAWYER_APPROVED_EMAIL="approved@example.com"
 * $env:E2E_LAWYER_APPROVED_PASSWORD="..."
 * npx playwright test tests/e2e/lawyer-verification-smoke.spec.ts
 * ```
 *
 * 증빙 ID: [EVIDENCE-20260427-425] — `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
 */

const smokeEnabled =
  process.env.E2E_LAWYER_VERIFICATION_SMOKE === "1" &&
  process.env.E2E_LAWYER_PENDING_EMAIL &&
  process.env.E2E_LAWYER_PENDING_PASSWORD &&
  process.env.E2E_LAWYER_APPROVED_EMAIL &&
  process.env.E2E_LAWYER_APPROVED_PASSWORD;

test.describe("lawyer verification — always-on API 스모크", () => {
  test("미로그인 상태 POST /api/lawyer/case-packages/lookup 은 401", async ({
    request,
  }) => {
    const res = await request.post("/api/lawyer/case-packages/lookup", {
      data: { publicCode: "E2E_NONEXISTENT_CODE" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});

const describeSmoke = smokeEnabled ? test.describe : test.describe.skip;

describeSmoke(
  "[EVIDENCE-20260427-425] 변호사 자격검증 승인 전후 E2E 스모크",
  () => {
    const pendingEmail = process.env.E2E_LAWYER_PENDING_EMAIL!;
    const pendingPassword = process.env.E2E_LAWYER_PENDING_PASSWORD!;
    const approvedEmail = process.env.E2E_LAWYER_APPROVED_EMAIL!;
    const approvedPassword = process.env.E2E_LAWYER_APPROVED_PASSWORD!;

    test("PENDING 변호사: 패키지 조회 API 는 LAWYER_VERIFICATION_REQUIRED(403)", async ({
      request,
    }) => {
      const login = await request.post("/api/auth/login", {
        data: { email: pendingEmail, password: pendingPassword },
        headers: { "Content-Type": "application/json" },
      });
      expect(login.ok()).toBeTruthy();

      const res = await request.post("/api/lawyer/case-packages/lookup", {
        data: { publicCode: "E2E_ANY_PUBLIC_CODE" },
        headers: { "Content-Type": "application/json" },
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body.code).toBe("LAWYER_VERIFICATION_REQUIRED");
    });

    test("PENDING 변호사: /lawyer 접근 시 verification-pending 으로 이동", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.getByPlaceholder("you@example.com").fill(pendingEmail);
      await page.getByPlaceholder("비밀번호 입력").fill(pendingPassword);
      await page.getByRole("button", { name: "로그인" }).click();
      await page.waitForURL(/\/(dashboard|lawyer)/, { timeout: 15000 });

      await page.goto("/lawyer");
      await expect(page).toHaveURL(/\/lawyer\/verification-pending/);
    });

    test("PENDING 변호사: /lawyer/case-packages/lookup 은 verification-pending", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.getByPlaceholder("you@example.com").fill(pendingEmail);
      await page.getByPlaceholder("비밀번호 입력").fill(pendingPassword);
      await page.getByRole("button", { name: "로그인" }).click();
      await page.waitForURL(/\/(dashboard|lawyer)/, { timeout: 15000 });

      await page.goto("/lawyer/case-packages/lookup");
      await expect(page).toHaveURL(/\/lawyer\/verification-pending/);
    });

    test("APPROVED 변호사: /lawyer 에 머무름(검증 대기로 튕기지 않음)", async ({ page }) => {
      await page.goto("/login");
      await page.getByPlaceholder("you@example.com").fill(approvedEmail);
      await page.getByPlaceholder("비밀번호 입력").fill(approvedPassword);
      await page.getByRole("button", { name: "로그인" }).click();
      await page.waitForURL(/\/(dashboard|lawyer)/, { timeout: 15000 });

      await page.goto("/lawyer");
      await expect(page).toHaveURL(/\/lawyer$/);
      await expect(page.getByRole("heading", { name: "변호사 포털" })).toBeVisible({
        timeout: 15000,
      });
    });

    test("APPROVED 변호사: /dashboard 접근 가능", async ({ page }) => {
      await page.goto("/login");
      await page.getByPlaceholder("you@example.com").fill(approvedEmail);
      await page.getByPlaceholder("비밀번호 입력").fill(approvedPassword);
      await page.getByRole("button", { name: "로그인" }).click();
      await page.waitForURL(/\/(dashboard|lawyer)/, { timeout: 15000 });

      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/dashboard/);
    });
  },
);
