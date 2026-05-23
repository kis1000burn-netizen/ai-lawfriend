import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockUser = {
  id: "user-owner",
  email: "u@x.com",
  name: "U",
  role: "USER",
  status: "ACTIVE",
} as const;

vi.mock("@/lib/get-session-user", () => ({
  getSessionUser: vi.fn(async () => mockUser),
}));

const createVoiceCapture = vi.hoisted(() =>
  vi.fn(async (_input?: unknown) => ({
    id: "tr_voice_1",
    caseId: "cjld2cyqh0001t9rmn839i921",
    questionKey: "key1",
    status: "NEEDS_CONFIRMATION" as const,
    draftText: "초안",
    expiresAt: new Date("2026-06-01T00:00:00.000Z"),
  })),
);

vi.mock("@/features/voice/voice-transcript.service", () => ({
  createVoiceTranscriptFromSttCapture: (input: unknown) => createVoiceCapture(input),
}));

import { POST } from "./route";

const SAMPLE_CASE_CID = "cjld2cyqh0001t9rmn839i921";

describe("POST /api/cases/[caseId]/voice/transcripts/stt-capture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createVoiceCapture.mockClear();
  });

  it("필수 필드 없으면 400 (Zod)", async () => {
    const res = await POST(
      new NextRequest("http://localhost/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ caseId: SAMPLE_CASE_CID }) },
    );
    expect(res.status).toBe(400);
    expect(createVoiceCapture).not.toHaveBeenCalled();
  });

  it("유효한 바디면 서비스 호출 후 200", async () => {
    const res = await POST(
      new NextRequest("http://localhost/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionKey: "key1",
          sttDraftText: "사건 발생일자는 2025년 1월입니다",
        }),
      }),
      { params: Promise.resolve({ caseId: SAMPLE_CASE_CID }) },
    );

    expect(res.status).toBe(200);
    expect(createVoiceCapture).toHaveBeenCalledOnce();

    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.transcript.id).toBe("tr_voice_1");
  });
});
