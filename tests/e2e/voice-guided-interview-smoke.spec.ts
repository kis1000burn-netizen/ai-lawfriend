import { test, expect } from "@playwright/test";

/**
 * Phase 5-F + **Phase 7-A** Voice QA/E2E
 *
 * A. 항상 실행: 미로그인 API → 401
 * B. 옵션: `E2E_VOICE_OPS_SMOKE=1` + ADMIN (+ 선택 USER/case) + DB migration
 *
 * ```powershell
 * npm run dev
 * npm run db:migrate
 * $env:E2E_VOICE_OPS_SMOKE="1"
 * $env:E2E_ADMIN_EMAIL="admin@example.com"
 * $env:E2E_ADMIN_PASSWORD="..."
 * npx playwright test tests/e2e/voice-guided-interview-smoke.spec.ts
 * ```
 */

const SAMPLE_CASE_UUID = "00000000-0000-4000-a000-000000000099";

test.describe("[Phase 5-F/7-A] Voice transcript REST (항상 실행)", () => {
  test("미로그인 POST stt-capture → 401", async ({ request }) => {
    const res = await request.post(`/api/cases/${SAMPLE_CASE_UUID}/voice/transcripts/stt-capture`, {
      data: {
        questionKey: "case_background",
        sttDraftText: "플레이스홀더 STT 초안",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test("미로그인 GET admin voice transcripts → 401/403", async ({ request }) => {
    const res = await request.get("/api/admin/voice/transcripts");
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 GET admin voice transcripts summary → 401/403", async ({ request }) => {
    const res = await request.get("/api/admin/voice/transcripts/summary");
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 GET admin voice privacy-requests → 401/403", async ({ request }) => {
    const res = await request.get("/api/admin/voice/privacy-requests");
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 POST admin voice privacy-requests → 401/403", async ({ request }) => {
    const res = await request.post("/api/admin/voice/privacy-requests", {
      data: {
        caseId: SAMPLE_CASE_UUID,
        requestType: "DELETION",
        requesterNote: "e2e gate",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect([401, 403]).toContain(res.status());
  });
});

const voiceOpsSmokeEnabled =
  process.env.E2E_VOICE_OPS_SMOKE === "1" &&
  process.env.E2E_ADMIN_EMAIL &&
  process.env.E2E_ADMIN_PASSWORD;

const describeVoiceOpsSmoke = voiceOpsSmokeEnabled ? test.describe : test.describe.skip;

describeVoiceOpsSmoke("[Phase 7-A] Voice ops — ADMIN API smoke", () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL!;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

  async function loginWithCredentials(
    request: import("@playwright/test").APIRequestContext,
    email: string,
    password: string,
  ) {
    const login = await request.post("/api/auth/login", {
      data: { email, password },
      headers: { "Content-Type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();
  }

  test("ADMIN summary + privacy request lifecycle (metadata only)", async ({ request }) => {
    await loginWithCredentials(request, adminEmail, adminPassword);

    const summaryRes = await request.get("/api/admin/voice/transcripts/summary");
    expect(summaryRes.ok()).toBeTruthy();
    const summaryBody = await summaryRes.json();
    expect(summaryBody.ok).toBe(true);
    expect(summaryBody.data.summary).toHaveProperty("ttlOverdueCount");

    const listRes = await request.get("/api/admin/voice/transcripts?limit=5");
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    expect(listBody.ok).toBe(true);
    if (listBody.data.items.length > 0) {
      expect(listBody.data.items[0]).not.toHaveProperty("draftText");
    }

    const caseId =
      process.env.E2E_VOICE_CASE_ID ??
      (listBody.data.items[0]?.caseId as string | undefined) ??
      SAMPLE_CASE_UUID;

    const createRes = await request.post("/api/admin/voice/privacy-requests", {
      data: {
        caseId,
        requestType: "CORRECTION",
        requesterNote: `E2E Phase 7-A smoke ${Date.now()}`,
        requesterChannel: "e2e@test.local",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(createRes.ok()).toBeTruthy();
    const createBody = await createRes.json();
    const requestId = createBody.data.request.id as string;

    const patchRes = await request.patch(`/api/admin/voice/privacy-requests/${requestId}`, {
      data: {
        status: "IN_REVIEW",
        opsNotes: "E2E review — no transcript body",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(patchRes.ok()).toBeTruthy();
    const patched = await patchRes.json();
    expect(patched.data.request.status).toBe("IN_REVIEW");
  });
});

const voiceUserFlowEnabled =
  voiceOpsSmokeEnabled &&
  process.env.E2E_USER_EMAIL &&
  process.env.E2E_USER_PASSWORD &&
  process.env.E2E_VOICE_CASE_ID;

const describeVoiceUserFlow = voiceUserFlowEnabled ? test.describe : test.describe.skip;

describeVoiceUserFlow("[Phase 7-A] Voice auth — USER stt-capture smoke", () => {
  const userEmail = process.env.E2E_USER_EMAIL!;
  const userPassword = process.env.E2E_USER_PASSWORD!;
  const caseId = process.env.E2E_VOICE_CASE_ID!;

  test("로그인 USER POST stt-capture → 200 또는 도메인 4xx", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { email: userEmail, password: userPassword },
      headers: { "Content-Type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.post(`/api/cases/${caseId}/voice/transcripts/stt-capture`, {
      data: {
        questionKey: "case_background",
        sttDraftText: "E2E Phase 7-A authenticated STT draft",
      },
      headers: { "Content-Type": "application/json" },
    });

    expect([200, 201, 400, 403, 404, 409, 422]).toContain(res.status());
    const body = await res.json();
    if (res.ok()) {
      expect(body.ok).toBe(true);
      expect(body.data.transcript).toHaveProperty("id");
    }
  });
});

describeVoiceOpsSmoke("[Phase 7-A] Voice ops — browser admin UI", () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL!;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

  test("관리자 Voice transcript 운영 대시보드", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(adminEmail);
    await page.getByPlaceholder("비밀번호 입력").fill(adminPassword);
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 15000 });

    await page.goto("/admin/voice/transcripts");
    await expect(page.getByTestId("voice-transcript-ops-page")).toBeVisible();
    await expect(page.getByTestId("voice-ops-total")).toBeVisible();

    await page.goto("/admin/voice/privacy-requests");
    await expect(page.getByTestId("voice-privacy-ops-page")).toBeVisible();
    await expect(page.getByTestId("voice-privacy-ops-new-link")).toBeVisible();
  });
});
