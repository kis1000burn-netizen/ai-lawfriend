import { test, expect } from "@playwright/test";

/**
 * Phase 8-D — AI Core audit policy API smoke
 *
 * A. always-on: 미로그인 → 401/403
 * B. optional: E2E_AI_CORE_AUDIT_SMOKE=1 + STAFF/ADMIN credentials
 */

test.describe("AI Core audit policy — always-on API gate", () => {
  test("미로그인 GET /api/admin/ai-core/audit-policy 는 401/403", async ({ request }) => {
    const res = await request.get("/api/admin/ai-core/audit-policy");
    expect([401, 403]).toContain(res.status());
  });
});

const auditSmokeEnabled =
  process.env.E2E_AI_CORE_AUDIT_SMOKE === "1" &&
  process.env.E2E_ADMIN_EMAIL &&
  process.env.E2E_ADMIN_PASSWORD;

const describeAuditSmoke = auditSmokeEnabled ? test.describe : test.describe.skip;

describeAuditSmoke("AI Core audit policy — STAFF+ smoke (Phase 8-D)", () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL!;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

  test("STAFF+ GET audit-policy exposes promptVersion and required fields", async ({
    request,
  }) => {
    const login = await request.post("/api/auth/login", {
      data: { email: adminEmail, password: adminPassword },
      headers: { "Content-Type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.get("/api/admin/ai-core/audit-policy");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.policy.promptRegistryVersion).toBe("8-C.1");
    expect(body.data.policy.requiredAuditMetadataFields).toEqual(
      expect.arrayContaining(["promptVersion", "templateAiPromptKey", "generationMode", "taskType"]),
    );
    expect(body.data.policy.deprecatedShimMarker).toBe(
      "PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM",
    );
  });
});
