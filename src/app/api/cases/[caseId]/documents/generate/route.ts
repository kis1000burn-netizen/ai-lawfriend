import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { buildParagraphDraftSeeds } from "@/lib/document-template-engine";
import {
  invokeDocumentParagraphGenerate,
  persistAiCoreAudit,
  buildAiAuditRecord,
  AI_PROMPT_KEYS,
  AI_CORE_TASK_TYPES,
  type PublicSafeAiAuditRecord,
} from "@/features/ai-core";
import { getQuestionSetDefinitionByCodeVersion } from "@/lib/question-set-registry";
import { getQuestionSetDefinitionFromDb } from "@/lib/question-set-repository";
import {
  getDocumentTemplateDefinitionFromRecord,
  getPublishedDocumentTemplateByCodeVersion,
} from "@/lib/document-template-repository";
import {
  buildDocumentGenerationTraceInput,
  getTemplateSourceRuntimeBlockerMessage,
} from "@/lib/document-generation-trace";
import { validateOfficialFormRequiredFields } from "@/features/document-generation/official-form-required-field-validator";
import { buildIntegratedDocumentContext } from "@/features/ai-core";
import {
  finalizeGongbuhoDocumentRulesEvaluation,
  mergeLatestGongbuhoTraceDocumentGenerationResult,
  prepareGongbuhoDocumentRulesForCase,
  type GongbuhoDocumentRulesEvaluation,
} from "@/features/gongbuho/gongbuho-document-rules.service";
import { buildOfficialFormGenerationContext } from "@/features/document-generation/official-form-source-prompt";
import { buildDocumentGenerationGuardrailTrace } from "@/features/document-generation/document-generation-guardrail-trace";
import { buildGuardrailViolationSuggestions } from "@/features/document-generation/document-generation-guardrail-suggestions";
import {
  DOCUMENT_GENERATION_POLICIES,
  checkForbiddenAssertions,
} from "@/features/document-generation/document-generation-policy";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

type GeneratedDocumentType = "STATEMENT" | "OPINION" | "CONSULT_NOTE";
type GeneratedParagraphStatus = "DRAFT";

function asRecordOrNull(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function buildCaseSummary(caseRecord: {
  title?: string | null;
  description?: string | null;
}) {
  return caseRecord.description ?? caseRecord.title ?? null;
}

async function buildCaseAttachmentSummary(caseId: string): Promise<string | null> {
  const items = await prisma.caseAttachment.findMany({
    where: {
      caseId,
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      originalName: true,
      category: true,
      mimeType: true,
      sizeBytes: true,
    },
  });

  if (!items.length) {
    return null;
  }

  const lines = items.map(
    (a) =>
      `- ${a.originalName} (${String(a.category)}, ${a.mimeType}, ${(a.sizeBytes / 1024).toFixed(1)} KiB)`,
  );
  return ["사건 활성 첨부파일 목록(파일 내용은 미포함):", ...lines].join("\n");
}

function getTemplateGenerationPolicy(template: unknown) {
  const generationPolicy = asRecordOrNull(template)?.generationPolicy;

  if (typeof generationPolicy === "string") {
    return generationPolicy;
  }

  return DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS;
}

const BodySchema = z.object({
  documentType: z.enum(["STATEMENT", "OPINION", "CONSULT_NOTE"]),
  title: z.string().trim().min(1),
  questionSetCode: z.string().trim().min(1),
  questionSetVersion: z.string().trim().min(1),
  templateCode: z.string().trim().min(1),
  templateVersion: z.string().trim().min(1),
});

const GONGBUHO_RULES_EVAL_EMPTY: GongbuhoDocumentRulesEvaluation = {
  applied: false,
  validationChecklist: [],
  forbiddenHits: [],
  riskFlags: [],
  expertReviewPoints: [],
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const { caseId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = BodySchema.parse(await req.json());

    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        ownerUserId: true,
        assignedLawyerUserId: true,
        assignedStaffUserId: true,
      },
    });

    if (!caseRecord) {
      return Response.json({ ok: false, message: "사건을 찾을 수 없습니다." }, { status: 404 });
    }

    if (["DELETED", "REJECTED", "CLOSED"].includes(caseRecord.status)) {
      return Response.json(
        { ok: false, message: "현재 사건 상태에서는 문서 초안을 생성할 수 없습니다." },
        { status: 400 },
      );
    }

    const permCtx = await buildPermissionContextForCase(sessionUser, caseRecord);
    assertCaseAccess("document.generate", permCtx);

    const interview = await prisma.interview.findFirst({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        answersJson: true,
      },
    });

    if (interview?.status !== "COMPLETED") {
      return Response.json(
        { ok: false, message: "인터뷰 완료 후에만 문서 초안을 생성할 수 있습니다." },
        { status: 400 },
      );
    }

    const gongbuhoPrepared = await prepareGongbuhoDocumentRulesForCase(caseId);

    const questionSet =
      (await getQuestionSetDefinitionFromDb(body.questionSetCode, body.questionSetVersion)) ??
      getQuestionSetDefinitionByCodeVersion(body.questionSetCode, body.questionSetVersion);
    if (!questionSet) {
      return Response.json({ ok: false, message: "질문셋 정의를 찾을 수 없습니다." }, { status: 404 });
    }

    const templateRecord = await getPublishedDocumentTemplateByCodeVersion(
      body.templateCode,
      body.templateVersion,
    );
    if (!templateRecord) {
      return Response.json({ ok: false, message: "문서 템플릿 정의를 찾을 수 없습니다." }, { status: 404 });
    }

    const template = getDocumentTemplateDefinitionFromRecord(templateRecord);
    if (!template) {
      return Response.json(
        { ok: false, message: "저장된 문서 템플릿 정의가 올바르지 않습니다." },
        { status: 409 },
      );
    }

    const templateSourceBlocker = getTemplateSourceRuntimeBlockerMessage(templateRecord);
    if (templateSourceBlocker) {
      return Response.json({ ok: false, message: templateSourceBlocker }, { status: 409 });
    }

    if (template.type !== body.documentType) {
      return Response.json(
        { ok: false, message: "문서 타입과 템플릿 타입이 일치하지 않습니다." },
        { status: 400 },
      );
    }

    const answers = (interview.answersJson ?? {}) as Record<string, unknown>;
    const requiredFieldValidation = validateOfficialFormRequiredFields({
      documentType: body.documentType,
      answers,
    });
    const missingWarningFields = requiredFieldValidation.missingFields.filter(
      (field) => field.severity === "WARNING",
    );

    if (requiredFieldValidation.shouldBlockGeneration) {
      return Response.json(
        {
          ok: false,
          code: "MISSING_REQUIRED_DOCUMENT_FIELDS",
          message: "문서 생성에 필요한 필수항목이 부족합니다.",
          missingFields: requiredFieldValidation.missingFields,
          suggestedQuestions: requiredFieldValidation.suggestedQuestions,
        },
        { status: 422 },
      );
    }

    const paragraphDraftSeeds = buildParagraphDraftSeeds({
      template,
      questionSet,
      answers,
    });
    const generationPolicy = getTemplateGenerationPolicy(templateRecord);
    const { officialFormTrace, officialFormParsedTextExcerpt } =
      buildOfficialFormGenerationContext(templateRecord);
    const attachmentSummary = await buildCaseAttachmentSummary(caseId);

    const { prompt, guardrail } = buildIntegratedDocumentContext({
      documentType: template.type,
      templateTitle: template.title,
      caseSummary: buildCaseSummary(caseRecord),
      interviewAnswers: answers,
      officialFormTrace,
      officialFormParsedTextExcerpt,
      attachmentSummary,
      generationPolicy,
      missingWarningFields,
      gongbuhoRulesAppendix: gongbuhoPrepared?.promptAppendix ?? null,
    });

    const docType = body.documentType as GeneratedDocumentType;

    const generatedParagraphs = await Promise.all(
      paragraphDraftSeeds.map(async (seed) => {
        const { content, audit } = await invokeDocumentParagraphGenerate({
          title: seed.title,
          seedContent: seed.content,
          generationMode: seed.generationMode,
          integratedPrompt: prompt,
          templateAiPromptKey: seed.aiPromptKey ?? null,
          guardrailPolicy: guardrail.policy,
        });

        return {
          sectionKey: seed.sectionKey,
          paragraphKey: seed.paragraphKey,
          title: seed.title,
          displayOrder: seed.order,
          content,
          status: "DRAFT" as GeneratedParagraphStatus,
          generationMode: seed.generationMode,
          aiPromptKey: seed.aiPromptKey ?? null,
          lockOnApproval: seed.lockOnApproval,
          supportsRegeneration: seed.supportsRegeneration,
          supportsRestore: seed.supportsRestore,
          aiAudit: audit,
        };
      }),
    );
    const aiAuditTrail: PublicSafeAiAuditRecord[] = generatedParagraphs.map((p) => p.aiAudit);
    const generatedBody = generatedParagraphs
      .map((paragraph) => paragraph.content)
      .filter(Boolean)
      .join("\n\n");
    const assertionCheck = checkForbiddenAssertions(generatedBody);

    if (!assertionCheck.passed) {
      const suggestions = buildGuardrailViolationSuggestions(assertionCheck.issues);
      const guardrailTrace = buildDocumentGenerationGuardrailTrace({
        generationPolicy: guardrail.policy,
        guardrailCheckStatus: "FAILED",
        guardrailIssues: assertionCheck.issues,
        guardrailSuggestions: suggestions,
        warningMissingFields: missingWarningFields,
      });

      return Response.json(
        {
          ok: false,
          code: "DOCUMENT_GENERATION_GUARDRAIL_VIOLATION",
          message:
            "AI 생성 결과에 검증되지 않은 법령·판례·단정 표현으로 의심되는 문구가 포함되어 문서 생성을 중단했습니다.",
          issues: assertionCheck.issues,
          suggestedQuestions: suggestions.flatMap((suggestion) => suggestion.suggestedQuestions),
          suggestions,
          policy: guardrail.policy,
          guardrailTrace,
        },
        { status: 422 },
      );
    }

    const guardrailTrace = buildDocumentGenerationGuardrailTrace({
      generationPolicy: guardrail.policy,
      guardrailCheckStatus: "PASSED",
      guardrailIssues: [],
      guardrailSuggestions: [],
      warningMissingFields: missingWarningFields,
    });

    const gongbuhoEvaluation =
      finalizeGongbuhoDocumentRulesEvaluation(generatedBody, gongbuhoPrepared) ??
      GONGBUHO_RULES_EVAL_EMPTY;

    const created = await prisma.$transaction(async (tx) => {
      const document = await tx.legalDocument.create({
        data: {
          caseId,
          type: docType,
          status: "DRAFT",
          title: body.title,
          questionSetVersion: body.questionSetVersion,
          templateCode: body.templateCode,
          templateVersion: body.templateVersion,
          body: generatedBody,
        },
      });

      await tx.documentGenerationTrace.create({
        data: buildDocumentGenerationTraceInput({
          legalDocumentId: document.id,
          template: templateRecord,
        }),
      });

      if (generatedParagraphs.length) {
        await tx.legalDocumentParagraph.createMany({
          data: generatedParagraphs.map((p) => ({
            documentId: document.id,
            sectionKey: p.sectionKey,
            paragraphKey: p.paragraphKey,
            title: p.title,
            displayOrder: p.displayOrder,
            content: p.content,
            status: p.status,
            generationMode: p.generationMode,
            aiPromptKey: p.aiPromptKey,
            lockOnApproval: p.lockOnApproval,
            supportsRegeneration: p.supportsRegeneration,
            supportsRestore: p.supportsRestore,
          })),
        });
      }

      await tx.legalDocumentVersion.create({
        data: {
          documentId: document.id,
          versionNo: 1,
          snapshotJson: {
            title: document.title,
            status: document.status,
            paragraphs: generatedParagraphs.map(({ aiAudit: _aiAudit, ...p }) => p),
            guardrailTrace,
            aiAuditTrail,
            gongbuhoDocumentRules: gongbuhoEvaluation,
          },
          approved: false,
        },
      });

      await tx.case.update({
        where: { id: caseId },
        data: {
          status: "DRAFTING",
        },
      });

      await tx.caseTimelineEvent.create({
        data: {
          caseId,
          type: "DOCUMENT_DRAFT_CREATED",
          title: `${body.documentType} 초안 생성`,
          description: body.title,
          metaJson: {
            documentType: body.documentType,
            templateCode: body.templateCode,
            templateVersion: body.templateVersion,
            sourceProvider: templateRecord.sourceProvider,
            sourceId: templateRecord.sourceId,
            sourceUrl: templateRecord.sourceUrl,
          },
          actorUserId: sessionUser.id,
        },
      });

      return document;
    });

    await persistAiCoreAudit({
      actorUserId: sessionUser.id,
      entityType: "CASE",
      entityId: caseId,
      record: buildAiAuditRecord({
        operation: "DOCUMENT_PARAGRAPH_GENERATE",
        taskType: AI_CORE_TASK_TYPES.DOCUMENT_GENERATION_INTEGRATED,
        model: "batch",
        promptKey: AI_PROMPT_KEYS.DOCUMENT_GENERATION_INTEGRATED,
        generationMode: "AI_GENERATE",
        guardrailPolicy: guardrail.policy,
        guardrailPassed: true,
        skippedLlm: aiAuditTrail.every((a) => a.skippedLlm),
      }),
      message: `Legal document generate (${aiAuditTrail.length} paragraphs)`,
    });

    if (gongbuhoEvaluation.applied) {
      await mergeLatestGongbuhoTraceDocumentGenerationResult(caseId, {
        occurredAtIso: new Date().toISOString(),
        legalDocumentId: created.id,
        documentType: body.documentType,
        evaluation: gongbuhoEvaluation,
      });
    }

    return ok(
      {
        document: created,
        generationPolicy: guardrail.policy,
        generationWarnings: guardrail.warnings,
        missingWarningFields,
        guardrailTrace,
        aiAuditTrail,
        gongbuhoDocumentRules: gongbuhoEvaluation,
        validation: {
          missingFields: missingWarningFields,
          suggestedQuestions: requiredFieldValidation.suggestedQuestions,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
