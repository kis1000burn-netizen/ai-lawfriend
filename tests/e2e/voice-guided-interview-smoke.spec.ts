import { test, expect } from "@playwright/test";

/**
 * Phase 5-F — Voice QA 스모크: **미로그인** `POST stt-capture` → **401**(API). 인증 UI 플로는 별도 describe/스펙 권장.
 * UI 시나리오는 `VOICE_QA_ACCESSIBILITY_SMOKE.md` 환경 변수 블록을 참조.
 */

const SAMPLE_CASE_UUID = "00000000-0000-4000-a000-000000000099";

test.describe("[Phase 5-F] Voice transcript REST (항상 실행)", () => {
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
});
