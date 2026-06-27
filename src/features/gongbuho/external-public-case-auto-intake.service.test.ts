import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/cases/case.service", () => ({
  createCaseService: vi.fn(),
}));

vi.mock("@/features/gongbuho/legal-knowledge-pipeline.service", () => ({
  createLegalKnowledgeIntake: vi.fn(),
}));

import {
  RECENT_CONSTRUCTION_INJURY_PUBLIC_CASE_AUTO_INTAKE,
  buildExternalPublicCaseDraftInput,
  buildExternalPublicCaseLegalKnowledgeIntakePayload,
  createExternalPublicCaseGongbuhoAutoIntake,
  type ExternalPublicCaseAutoIntakeInput,
} from "@/features/gongbuho/external-public-case-auto-intake.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

const currentUser: SessionUser = {
  id: "user-1",
  email: "client@example.com",
  name: "의뢰인",
  role: "USER",
  status: "ACTIVE",
};

describe("external-public-case-auto-intake.service", () => {
  it("외부 공개 사건을 공부호 Legal Knowledge Intake payload로 변환한다", () => {
    const payload = buildExternalPublicCaseLegalKnowledgeIntakePayload(
      RECENT_CONSTRUCTION_INJURY_PUBLIC_CASE_AUTO_INTAKE,
    );

    expect(payload.status).toBe("READY_FOR_RESEARCH");
    expect(payload.intakeCompliance).toMatchObject({
      noRawUgcStored: true,
      intakeMethod: "AGGREGATE_IMPORT",
      prohibitedFieldScan: "PASS",
    });
    expect(payload.querySignature.normalizedKeyword).toContain("건설현장");
    expect(payload.caseTypeMapping.mappedCaseType).toBe(
      "CONSTRUCTION_INJURY_COMPENSATION",
    );
    expect(payload.suggestedGongbuhoCode).toBe("LAW-CONSTRUCTION-INJURY-001");
  });

  it("외부 공개 사건을 사건 접수 초안 입력값으로 변환한다", () => {
    const draft = buildExternalPublicCaseDraftInput(
      RECENT_CONSTRUCTION_INJURY_PUBLIC_CASE_AUTO_INTAKE,
    );

    expect(draft.title).toContain("건설현장 산재");
    expect(draft.category).toBe("CONSTRUCTION_INJURY_COMPENSATION");
    expect(draft.opponentName).toBe("원청 시공사 및 하청 기업");
    expect(draft.incidentDate).toBe("2017-04-01T00:00:00.000Z");
  });

  it("원문·스니펫 저장 위험 키가 섞이면 접수를 차단한다", () => {
    const unsafeInput = {
      ...RECENT_CONSTRUCTION_INJURY_PUBLIC_CASE_AUTO_INTAKE,
      rawSnippet: "검색 결과 원문 스니펫",
    } as ExternalPublicCaseAutoIntakeInput & { rawSnippet: string };

    expect(() =>
      buildExternalPublicCaseLegalKnowledgeIntakePayload(unsafeInput),
    ).toThrow(/LEGAL_KNOWLEDGE_PROHIBITED_FIELD/);
  });

  it("DB 의존성 없이 자동 접수 오케스트레이션을 검증할 수 있다", async () => {
    const createLegalKnowledgeIntake = vi.fn().mockResolvedValue({
      id: "intake-1",
      status: "READY_FOR_RESEARCH",
      suggestedGongbuhoCode: "LAW-CONSTRUCTION-INJURY-001",
    });
    const createCaseService = vi.fn().mockResolvedValue({
      id: "case-1",
      title: "공개사건 자동접수 · 건설현장 산재 손해배상",
      category: "CONSTRUCTION_INJURY_COMPENSATION",
      status: "CREATED",
      allowedLifecycleActions: ["START_INTERVIEW"],
    });

    const result = await createExternalPublicCaseGongbuhoAutoIntake(
      currentUser,
      RECENT_CONSTRUCTION_INJURY_PUBLIC_CASE_AUTO_INTAKE,
      {
        createCaseDraft: true,
        deps: {
          createLegalKnowledgeIntake,
          createCaseService,
        },
      },
    );

    expect(createLegalKnowledgeIntake).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        status: "READY_FOR_RESEARCH",
        suggestedGongbuhoCode: "LAW-CONSTRUCTION-INJURY-001",
      }),
    );
    expect(createCaseService).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        title: "공개사건 자동접수 · 건설현장 산재 손해배상",
        category: "CONSTRUCTION_INJURY_COMPENSATION",
      }),
    );
    expect(result).toEqual({
      legalKnowledgeIntake: {
        id: "intake-1",
        status: "READY_FOR_RESEARCH",
        suggestedGongbuhoCode: "LAW-CONSTRUCTION-INJURY-001",
      },
      caseDraft: {
        id: "case-1",
        title: "공개사건 자동접수 · 건설현장 산재 손해배상",
        category: "CONSTRUCTION_INJURY_COMPENSATION",
        status: "CREATED",
        allowedLifecycleActions: ["START_INTERVIEW"],
      },
    });
  });
});
