import type { Case, LegalKnowledgeDemandIntake } from "@prisma/client";
import type { z } from "zod";
import { createCaseService } from "@/features/cases/case.service";
import type { CreateCaseInput } from "@/features/cases/case.validators";
import { createLegalKnowledgeIntake } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { assertNoProhibitedJsonKeys } from "@/lib/gongbuho/legal-knowledge-pipeline-gates";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { createLegalKnowledgeIntakeBodySchema } from "@/lib/validators/legal-knowledge-pipeline";

export type ExternalPublicCaseAutoIntakeInput = {
  normalizedKeyword: string;
  publicCaseLabel: string;
  publicCaseSummary: string;
  mappedCaseType: string;
  mappingRationale: string;
  mappingConfidence: "LOW" | "MEDIUM" | "HIGH";
  questionTypeCode?: string;
  demandStrength?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  suggestedGongbuhoCode?: string | null;
  observedAt: string;
  publishedAt?: string | null;
  incidentDate?: string | null;
  caseDraft?: {
    title: string;
    description?: string;
    category?: string;
    opponentName?: string;
    courtName?: string;
  };
};

export type ExternalPublicCaseLegalKnowledgePayload = z.infer<
  typeof createLegalKnowledgeIntakeBodySchema
>;

type AutoIntakeDependencies = {
  createLegalKnowledgeIntake?: typeof createLegalKnowledgeIntake;
  createCaseService?: typeof createCaseService;
};

export type ExternalPublicCaseAutoIntakeResult = {
  legalKnowledgeIntake: Pick<
    LegalKnowledgeDemandIntake,
    "id" | "status" | "suggestedGongbuhoCode"
  >;
  caseDraft: (Pick<Case, "id" | "title" | "category" | "status"> & {
    allowedLifecycleActions?: unknown;
  }) | null;
};

function dateOnly(value: string | null | undefined) {
  const source = value && value.trim().length > 0 ? value : new Date().toISOString();
  return source.slice(0, 10);
}

export function buildExternalPublicCaseLegalKnowledgeIntakePayload(
  input: ExternalPublicCaseAutoIntakeInput,
): ExternalPublicCaseLegalKnowledgePayload {
  assertNoProhibitedJsonKeys(input);
  const observedDate = dateOnly(input.observedAt);
  const publishedDate = dateOnly(input.publishedAt ?? input.observedAt);

  return createLegalKnowledgeIntakeBodySchema.parse({
    signalSource: "INTERNAL_PRODUCT_SIGNAL",
    observationWindow: {
      from: publishedDate,
      to: observedDate,
    },
    querySignature: {
      normalizedKeyword: input.normalizedKeyword.trim(),
      locale: "ko-KR",
    },
    questionType: {
      questionTypeCode: input.questionTypeCode ?? "QT_PUBLIC_CASE_AUTO_INTAKE",
      taxonomyVersion: "2026.06",
      confidence: input.mappingConfidence,
    },
    caseTypeMapping: {
      mappedCaseType: input.mappedCaseType.trim(),
      mappingRationale: input.mappingRationale.trim(),
      mappingConfidence: input.mappingConfidence,
      suggestedGongbuhoCode: input.suggestedGongbuhoCode ?? null,
    },
    suggestedGongbuhoCode: input.suggestedGongbuhoCode ?? null,
    demandStrength: input.demandStrength ?? "MEDIUM",
    intakeCompliance: {
      compilerPolicyVersion: "2026-05-23",
      noRawUgcStored: true,
      intakeMethod: "AGGREGATE_IMPORT",
      prohibitedFieldScan: "PASS",
    },
    operatorNote:
      `외부 공개사건 자동 접수 후보: ${input.publicCaseLabel.trim()} — ` +
      input.publicCaseSummary.trim(),
    status: "READY_FOR_RESEARCH",
  });
}

export function buildExternalPublicCaseDraftInput(
  input: ExternalPublicCaseAutoIntakeInput,
): CreateCaseInput {
  assertNoProhibitedJsonKeys(input);

  const draft = input.caseDraft;
  return {
    title: draft?.title?.trim() || input.publicCaseLabel.trim(),
    description:
      draft?.description?.trim() ||
      [
        input.publicCaseSummary.trim(),
        "",
        "공부호 외부 공개사건 자동 접수 후보입니다. 실제 사건으로 사용하기 전 변호사 검토와 원문 판결·공식자료 확인이 필요합니다.",
      ].join("\n"),
    category: draft?.category?.trim() || input.mappedCaseType.trim(),
    opponentName: draft?.opponentName?.trim() || "",
    courtName: draft?.courtName?.trim() || "",
    incidentDate: input.incidentDate ? `${dateOnly(input.incidentDate)}T00:00:00.000Z` : "",
  };
}

export async function createExternalPublicCaseGongbuhoAutoIntake(
  currentUser: SessionUser,
  input: ExternalPublicCaseAutoIntakeInput,
  options: {
    createCaseDraft?: boolean;
    deps?: AutoIntakeDependencies;
  } = {},
): Promise<ExternalPublicCaseAutoIntakeResult> {
  const createIntake = options.deps?.createLegalKnowledgeIntake ?? createLegalKnowledgeIntake;
  const createCase = options.deps?.createCaseService ?? createCaseService;

  const legalKnowledgeIntake = await createIntake(
    currentUser.id,
    buildExternalPublicCaseLegalKnowledgeIntakePayload(input),
  );

  const caseDraft = options.createCaseDraft
    ? await createCase(currentUser, buildExternalPublicCaseDraftInput(input))
    : null;

  return {
    legalKnowledgeIntake: {
      id: legalKnowledgeIntake.id,
      status: legalKnowledgeIntake.status,
      suggestedGongbuhoCode: legalKnowledgeIntake.suggestedGongbuhoCode,
    },
    caseDraft: caseDraft
      ? {
          id: caseDraft.id,
          title: caseDraft.title,
          category: caseDraft.category,
          status: caseDraft.status,
          allowedLifecycleActions: caseDraft.allowedLifecycleActions,
        }
      : null,
  };
}

export const RECENT_CONSTRUCTION_INJURY_PUBLIC_CASE_AUTO_INTAKE: ExternalPublicCaseAutoIntakeInput = {
  normalizedKeyword: "건설현장 소화배관 추락 산재 손해배상 원청 하청 책임",
  publicCaseLabel: "건설현장 소화배관 추락 산재 손해배상 공개 사건",
  publicCaseSummary:
    "2026년 6월 공개 보도에서 확인된 건설현장 중량물 추락 산재 손해배상 사례. 원청·하청의 작업계획 준수, 안전교육, 관리감독, 개인 과실 및 소멸시효 항변이 주요 쟁점이다.",
  mappedCaseType: "CONSTRUCTION_INJURY_COMPENSATION",
  mappingRationale:
    "산업재해 손해배상 사건으로, 원청·하청 공동 책임과 향후 치료비·간병비 산정이 핵심인 공개 사건이다.",
  mappingConfidence: "HIGH",
  demandStrength: "HIGH",
  suggestedGongbuhoCode: "LAW-CONSTRUCTION-INJURY-001",
  observedAt: "2026-06-20T08:00:00.000Z",
  publishedAt: "2026-06-18T00:00:00.000Z",
  incidentDate: "2017-04-01T00:00:00.000Z",
  caseDraft: {
    title: "공개사건 자동접수 · 건설현장 산재 손해배상",
    category: "CONSTRUCTION_INJURY_COMPENSATION",
    opponentName: "원청 시공사 및 하청 기업",
    courtName: "인천지방법원 항소심",
  },
};
