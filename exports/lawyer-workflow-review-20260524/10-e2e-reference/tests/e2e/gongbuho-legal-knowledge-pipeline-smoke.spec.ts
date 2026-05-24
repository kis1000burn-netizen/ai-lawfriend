import { test, expect } from "@playwright/test";
import { buildLegalKnowledgeIntakeCreatePayload } from "../../src/features/gongbuho/legal-knowledge-intake-form-defaults";

/**
 * A. 항상 실행: 미인증 Legal Knowledge Pipeline API → 401/403
 * B. 옵션: `E2E_LEGAL_KNOWLEDGE_PIPELINE_SMOKE=1` + ADMIN 계정 + DB migration 적용 시 전체 API 파이프라인
 *
 * ```bash
 * npm run dev
 * npm run db:migrate
 * $env:E2E_LEGAL_KNOWLEDGE_PIPELINE_SMOKE="1"
 * $env:E2E_ADMIN_EMAIL="admin@example.com"
 * $env:E2E_ADMIN_PASSWORD="..."
 * npx playwright test tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts
 * ```
 */

test.describe("Legal Knowledge Pipeline — always-on API gate", () => {
  test("미로그인 GET intake 목록은 401", async ({ request }) => {
    const res = await request.get("/api/admin/gongbuho/legal-knowledge/intake");
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 POST intake 생성은 401", async ({ request }) => {
    const res = await request.post("/api/admin/gongbuho/legal-knowledge/intake", {
      data: buildLegalKnowledgeIntakeCreatePayload({
        normalizedKeyword: "e2e-gate",
        mappedCaseType: "JEONSE",
      }),
      headers: { "Content-Type": "application/json" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 compile-packet-draft 는 401", async ({ request }) => {
    const res = await request.post(
      "/api/admin/gongbuho/legal-knowledge/lawyer-review/clfake123/compile-packet-draft",
      {
        data: { code: "X", version: "1.0.0", name: "n", domain: "AI법친" },
        headers: { "Content-Type": "application/json" },
      },
    );
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 GET lawyer research-briefs 는 401", async ({ request }) => {
    const res = await request.get("/api/lawyer/legal-knowledge/research-briefs");
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 GET legal-knowledge dashboard 는 401", async ({ request }) => {
    const res = await request.get("/api/admin/gongbuho/legal-knowledge/dashboard");
    expect([401, 403]).toContain(res.status());
  });

  test("미로그인 POST lawyer lawyer-review 는 401", async ({ request }) => {
    const res = await request.post(
      "/api/lawyer/legal-knowledge/research-briefs/clfake123/lawyer-review",
      {
        data: {
          decision: "APPROVE_FOR_PACKET_DRAFT",
          reviewNotes: "gate",
          noUgcOrPiiInReviewNotes: true,
        },
        headers: { "Content-Type": "application/json" },
      },
    );
    expect([401, 403]).toContain(res.status());
  });
});

const pipelineSmokeEnabled =
  process.env.E2E_LEGAL_KNOWLEDGE_PIPELINE_SMOKE === "1" &&
  process.env.E2E_ADMIN_EMAIL &&
  process.env.E2E_ADMIN_PASSWORD;

const describePipelineSmoke = pipelineSmokeEnabled
  ? test.describe
  : test.describe.skip;

describePipelineSmoke(
  "Legal Knowledge Pipeline — full API smoke (ADMIN + DB)",
  () => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL!;
    const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

    async function loginAdmin(request: import("@playwright/test").APIRequestContext) {
      const login = await request.post("/api/auth/login", {
        data: { email: adminEmail, password: adminPassword },
        headers: { "Content-Type": "application/json" },
      });
      expect(login.ok()).toBeTruthy();
    }

    test("Intake → Brief → Review → compile → approve → PACKET_APPROVED", async ({
      request,
    }) => {
      await loginAdmin(request);

      const suffix = Date.now();
      const intakeRes = await request.post(
        "/api/admin/gongbuho/legal-knowledge/intake",
        {
          data: buildLegalKnowledgeIntakeCreatePayload({
            normalizedKeyword: `e2e-pipeline-${suffix}`,
            mappedCaseType: "JEONSE",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );
      expect(intakeRes.ok()).toBeTruthy();
      const intakeBody = await intakeRes.json();
      expect(intakeBody.ok).toBe(true);
      const intakeId = intakeBody.data.intake.id as string;

      const briefRes = await request.post(
        `/api/admin/gongbuho/legal-knowledge/intake/${intakeId}/research-brief`,
        {
          data: {
            packetIntent: "NEW_PACKET",
            canonicalSourceRefs: [
              {
                sourceKind: "STATUTE",
                citationKey: "민법 제565조",
                summaryPointer: "E2E smoke — 임대차 종료",
              },
            ],
            legalIssueOutline: "E2E Legal Knowledge pipeline smoke",
            structureHints: {
              suggestedQuestionThemes: ["사실관계"],
              suggestedOutputSections: ["쟁점"],
              suggestedForbiddenThemes: ["확정적 승소"],
            },
          },
          headers: { "Content-Type": "application/json" },
        },
      );
      expect(briefRes.ok()).toBeTruthy();
      const briefBody = await briefRes.json();
      const briefId = briefBody.data.brief.id as string;

      const readyRes = await request.post(
        `/api/admin/gongbuho/legal-knowledge/research-brief/${briefId}/ready-for-review`,
      );
      expect(readyRes.ok()).toBeTruthy();

      const reviewRes = await request.post(
        `/api/admin/gongbuho/legal-knowledge/research-brief/${briefId}/lawyer-review`,
        {
          data: {
            decision: "APPROVE_FOR_PACKET_DRAFT",
            reviewNotes: "E2E smoke lawyer review",
            noUgcOrPiiInReviewNotes: true,
          },
          headers: { "Content-Type": "application/json" },
        },
      );
      expect(reviewRes.ok()).toBeTruthy();
      const reviewBody = await reviewRes.json();
      const reviewId = reviewBody.data.review.id as string;

      const packetCode = `LAW-E2E-${suffix}`;
      const compileRes = await request.post(
        `/api/admin/gongbuho/legal-knowledge/lawyer-review/${reviewId}/compile-packet-draft`,
        {
          data: {
            code: packetCode,
            version: "1.0.0",
            name: `E2E Pipeline ${suffix}`,
            domain: "AI법친",
          },
          headers: { "Content-Type": "application/json" },
        },
      );
      expect(compileRes.ok()).toBeTruthy();
      const compileBody = await compileRes.json();
      const packetId = compileBody.data.packet.id as string;

      const approveRes = await request.post(
        `/api/admin/gongbuho/${packetId}/approve`,
      );
      expect(approveRes.ok()).toBeTruthy();

      const intakeGet = await request.get(
        `/api/admin/gongbuho/legal-knowledge/intake/${intakeId}`,
      );
      expect(intakeGet.ok()).toBeTruthy();
      const intakeAfter = await intakeGet.json();
      expect(intakeAfter.data.intake.status).toBe("PACKET_APPROVED");
    });
  },
);

describePipelineSmoke("Legal Knowledge Pipeline — browser Intake form", () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL!;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

  test("관리자 UI Intake 등록 폼 제출", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(adminEmail);
    await page.getByPlaceholder("비밀번호 입력").fill(adminPassword);
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 15000 });

    await page.goto("/admin/gongbuho/legal-knowledge/new");
    const suffix = Date.now();
    await page.getByTestId("intake-normalized-keyword").fill(`ui-e2e-${suffix}`);
    await page.getByTestId("intake-mapped-case-type").fill("JEONSE");
    await page.getByTestId("intake-create-submit").click();

    await page.waitForURL(/\/admin\/gongbuho\/legal-knowledge\/intake\//, {
      timeout: 15000,
    });
    await expect(page.getByText("READY_FOR_RESEARCH")).toBeVisible();
  });
});

const dashboardSmokeEnabled =
  process.env.E2E_LEGAL_KNOWLEDGE_DASHBOARD_SMOKE === "1" &&
  process.env.E2E_ADMIN_EMAIL &&
  process.env.E2E_ADMIN_PASSWORD;

const describeDashboardSmoke = dashboardSmokeEnabled ? test.describe : test.describe.skip;

describeDashboardSmoke("Legal Knowledge Intelligence — ADMIN API smoke (Phase 4-I)", () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL!;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

  test("ADMIN GET dashboard returns meta-only snapshot", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { email: adminEmail, password: adminPassword },
      headers: { "Content-Type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.get("/api/admin/gongbuho/legal-knowledge/dashboard");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.dashboard).toHaveProperty("funnel");
    expect(body.data.dashboard).toHaveProperty("demandGap");
    expect(body.data.dashboard).not.toHaveProperty("legalIssueOutline");
    const serialized = JSON.stringify(body.data.dashboard);
    expect(serialized).not.toContain('"reviewNotes"');
  });
});

describeDashboardSmoke("Legal Knowledge Intelligence — browser dashboard (Phase 4-I)", () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL!;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

  test("관리자 Intelligence Dashboard UI", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(adminEmail);
    await page.getByPlaceholder("비밀번호 입력").fill(adminPassword);
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 15000 });

    await page.goto("/admin/gongbuho/legal-knowledge/dashboard");
    await expect(page.getByTestId("legal-knowledge-intelligence-dashboard")).toBeVisible();
    await expect(page.getByTestId("lk-intel-total-intakes")).toBeVisible();
  });
});
