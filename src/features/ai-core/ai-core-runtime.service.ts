/**
 * Phase 8-B — AI Core Route Migration & Runtime Enforcement.
 * Spec: [`AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md`](../../../docs/ai/AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md)
 */
import type { DraftPreviewParagraph } from "@/features/document-drafts/document-draft.types";
import { regenerateSingleParagraphFallback } from "@/features/document-drafts/document-paragraph-ai.fallback";
import type { DocumentGenerationPolicy } from "@/features/document-generation/document-generation-policy";
import {
  buildDocumentGenerationGuardrail,
  checkForbiddenAssertions,
} from "@/features/document-generation/document-generation-policy";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import type { ParagraphGenerationMode } from "@/lib/definitions/document-template";
import { ValidationError } from "@/lib/errors";
import {
  invokeOpenAiDocumentParagraphGenerate,
  invokeOpenAiDocumentParagraphRewrite,
} from "./ai-core-openai.provider";
import {
  buildAiAuditRecord,
  persistAiCoreAudit,
  toPublicSafeAiAuditRecord,
  type PublicSafeAiAuditRecord,
} from "./ai-audit";
import {
  AI_CORE_TASK_TYPES,
  AI_PROMPT_KEYS,
  resolvePromptKeyForOperation,
} from "./ai-prompt-registry";
import { isAiProviderConfigured } from "./ai-provider-ssot";
import { resolveGenerationModeRuntimeGate } from "./generation-mode-runtime";
import {
  handleAiProviderCallFailure,
  markAiProviderCallSuccess,
  preAiCallCircuitCheck,
} from "@/features/platform/reliability/ai-fallback-circuit-breaker.service";

export const PHASE8B_AI_CORE_RUNTIME_MARKER = "PHASE8B_AI_CORE_ROUTE_MIGRATION" as const;
export const PHASE8C_AI_CORE_RUNTIME_MARKER = "PHASE8C_AI_CORE_LEGACY_CLEANUP" as const;

export type AiCoreAuditContext = {
  actorUserId?: string;
  caseId?: string;
  legalDocumentId?: string;
  paragraphId?: string;
  paragraphKey?: string;
};

export type InvokeDocumentParagraphGenerateInput = {
  title: string;
  seedContent: string;
  generationMode: ParagraphGenerationMode;
  integratedPrompt?: string | null;
  templateAiPromptKey?: string | null;
  guardrailPolicy: DocumentGenerationPolicy;
  auditContext?: AiCoreAuditContext;
};

export type InvokeDocumentParagraphGenerateResult = {
  content: string;
  aiModel: string | null;
  audit: PublicSafeAiAuditRecord;
};

export type InvokeDocumentParagraphRegenerateInput = {
  documentTitle: string;
  templateType: DocumentTemplateType;
  generationMode: ParagraphGenerationMode;
  isApprovedLocked?: boolean;
  guardrailPolicy?: DocumentGenerationPolicy;
  paragraph: {
    id: string;
    title: string;
    content: string;
    sectionKey: string;
    paragraphKey: string;
  };
  instruction?: string;
  templateAiPromptKey?: string | null;
  auditContext?: AiCoreAuditContext;
};

export type InvokeDocumentParagraphRegenerateResult = {
  content: string;
  aiModel: string | null;
  audit: PublicSafeAiAuditRecord;
};

export type InvokeDraftParagraphRegenerateBatchInput = {
  paragraphs: DraftPreviewParagraph[];
  templateType: DocumentTemplateType;
  title: string;
  targetParagraphIds: string[];
  force?: boolean;
  instructionByParagraphId?: Record<string, string | null | undefined>;
  generationModeByParagraphId?: Record<string, ParagraphGenerationMode>;
  templateAiPromptKeyByParagraphId?: Record<string, string | null | undefined>;
  guardrailPolicy?: DocumentGenerationPolicy;
  auditContext?: AiCoreAuditContext & { actorUserId: string; caseId: string };
};

function normalizeLineBreaks(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildRuntimeAudit(
  operation: "DOCUMENT_PARAGRAPH_GENERATE" | "DOCUMENT_PARAGRAPH_REGENERATE",
  args: {
    generationMode: ParagraphGenerationMode;
    guardrailPolicy: DocumentGenerationPolicy;
    guardrailPassed: boolean;
    guardrailIssues?: string[];
    model: string;
    skippedLlm: boolean;
    skipReason?: string;
    templateAiPromptKey?: string | null;
  },
) {
  const resolved = resolvePromptKeyForOperation(operation, args.templateAiPromptKey);
  return buildAiAuditRecord({
    operation,
    taskType: resolved.taskType,
    model: args.model,
    promptKey: resolved.promptKey,
    templateAiPromptKey: resolved.templateAiPromptKey,
    generationMode: args.generationMode,
    guardrailPolicy: args.guardrailPolicy,
    guardrailPassed: args.guardrailPassed,
    guardrailIssues: args.guardrailIssues,
    skippedLlm: args.skippedLlm,
    skipReason: args.skipReason,
  });
}

function inferParagraphFormat(content: string): DraftPreviewParagraph["format"] {
  const trimmed = content.trim();
  if (trimmed.startsWith("- ")) return "BULLET";
  if (trimmed.includes("\n")) return "BLOCK";
  return "INLINE";
}

function buildDraftParagraphFromLegal(args: {
  id: string;
  title: string;
  content: string;
  sectionKey: string;
  paragraphKey: string;
}): DraftPreviewParagraph {
  return {
    id: args.id,
    sectionTitle: args.sectionKey,
    label: args.title,
    content: args.content,
    format: inferParagraphFormat(args.content),
    order: 0,
    sourceQuestionKey: args.paragraphKey,
    included: true,
    locked: false,
  };
}

async function maybePersistAudit(
  auditContext: AiCoreAuditContext | undefined,
  record: ReturnType<typeof buildAiAuditRecord>,
) {
  if (!auditContext?.actorUserId) {
    return;
  }

  const entityId =
    auditContext.paragraphId ??
    auditContext.legalDocumentId ??
    auditContext.caseId ??
    "unknown";

  await persistAiCoreAudit({
    actorUserId: auditContext.actorUserId,
    entityType: auditContext.legalDocumentId ? "LEGAL_DOCUMENT" : "CASE",
    entityId,
    record,
  });
}

function assertRegenerateGuardrail(content: string, policy: DocumentGenerationPolicy) {
  const assertionCheck = checkForbiddenAssertions(content);
  if (!assertionCheck.passed) {
    throw new ValidationError(
      "재생성 결과에 검증되지 않은 법령·판례·단정 표현이 포함되어 재생성을 중단했습니다.",
      {
        code: "DOCUMENT_REGENERATE_GUARDRAIL_VIOLATION",
        details: {
          issues: assertionCheck.issues,
          policy,
        },
      },
    );
  }
}

export async function invokeDocumentParagraphGenerate(
  input: InvokeDocumentParagraphGenerateInput,
): Promise<InvokeDocumentParagraphGenerateResult> {
  const seed = (input.seedContent ?? "").trim();
  const gate = resolveGenerationModeRuntimeGate(
    input.generationMode,
    "DOCUMENT_PARAGRAPH_GENERATE",
  );
  const integratedPrompt = input.integratedPrompt?.trim();
  const providerReady = isAiProviderConfigured();
  const canUseLlm = gate.llmAllowed && providerReady && Boolean(integratedPrompt);

  if (!seed) {
    const audit = buildRuntimeAudit("DOCUMENT_PARAGRAPH_GENERATE", {
      generationMode: input.generationMode,
      guardrailPolicy: input.guardrailPolicy,
      guardrailPassed: true,
      model: "none",
      skippedLlm: true,
      skipReason: "EMPTY_SEED",
      templateAiPromptKey: input.templateAiPromptKey,
    });
    await maybePersistAudit(input.auditContext, audit);
    return { content: "", aiModel: null, audit: toPublicSafeAiAuditRecord(audit) };
  }

  if (!canUseLlm) {
    const skipReason = !gate.llmAllowed
      ? gate.skipReason
      : !providerReady
        ? "PROVIDER_NOT_CONFIGURED"
        : "NO_INTEGRATED_PROMPT";

    const audit = buildRuntimeAudit("DOCUMENT_PARAGRAPH_GENERATE", {
      generationMode: input.generationMode,
      guardrailPolicy: input.guardrailPolicy,
      guardrailPassed: checkForbiddenAssertions(seed).passed,
      model: "none",
      skippedLlm: true,
      skipReason,
      templateAiPromptKey: input.templateAiPromptKey,
    });
    await maybePersistAudit(input.auditContext, audit);
    return { content: seed, aiModel: null, audit: toPublicSafeAiAuditRecord(audit) };
  }

  let content = seed;
  let aiModel: string | null = null;
  const resolved = resolvePromptKeyForOperation(
    "DOCUMENT_PARAGRAPH_GENERATE",
    input.templateAiPromptKey,
  );

  try {
    preAiCallCircuitCheck("openai");
    const aiResult = await invokeOpenAiDocumentParagraphGenerate({
      title: input.title,
      seedContent: seed,
      integratedPrompt: integratedPrompt!,
      paragraphHint: resolved.paragraphHint,
      templateAiPromptKey: resolved.templateAiPromptKey,
    });
    content = aiResult.text;
    aiModel = aiResult.model;
    markAiProviderCallSuccess("openai");
  } catch (e) {
    console.error("[AI_CORE_GENERATE_PARAGRAPH]", e);
    await handleAiProviderCallFailure({
      error: e,
      taskType: "DOCUMENT_PARAGRAPH_GENERATE",
      caseId: input.auditContext?.caseId,
      actorUserId: input.auditContext?.actorUserId,
      entityType: input.auditContext?.legalDocumentId ? "LegalDocument" : "Case",
      entityId: input.auditContext?.legalDocumentId ?? input.auditContext?.caseId,
      attemptCount: 1,
    });
    content = seed;
    aiModel = null;
  }

  const assertionCheck = checkForbiddenAssertions(content);
  const audit = buildRuntimeAudit("DOCUMENT_PARAGRAPH_GENERATE", {
    generationMode: input.generationMode,
    guardrailPolicy: input.guardrailPolicy,
    guardrailPassed: assertionCheck.passed,
    guardrailIssues: assertionCheck.issues,
    model: aiModel ?? "none",
    skippedLlm: !aiModel,
    skipReason: aiModel ? undefined : "GENERATE_FALLBACK_TO_SEED",
    templateAiPromptKey: input.templateAiPromptKey,
  });
  await maybePersistAudit(input.auditContext, audit);

  return { content, aiModel, audit: toPublicSafeAiAuditRecord(audit) };
}

export async function invokeDocumentParagraphRegenerate(
  input: InvokeDocumentParagraphRegenerateInput,
): Promise<InvokeDocumentParagraphRegenerateResult> {
  const policy =
    input.guardrailPolicy ??
    buildDocumentGenerationGuardrail({ generationPolicy: undefined }).policy;
  const base = input.paragraph.content.trim();

  if (!base) {
    const audit = buildRuntimeAudit("DOCUMENT_PARAGRAPH_REGENERATE", {
      generationMode: input.generationMode,
      guardrailPolicy: policy,
      guardrailPassed: true,
      model: "none",
      skippedLlm: true,
      skipReason: "EMPTY_CONTENT",
      templateAiPromptKey: input.templateAiPromptKey,
    });
    await maybePersistAudit(input.auditContext, audit);
    return { content: "", aiModel: null, audit: toPublicSafeAiAuditRecord(audit) };
  }

  if (!input.instruction?.trim()) {
    const audit = buildRuntimeAudit("DOCUMENT_PARAGRAPH_REGENERATE", {
      generationMode: input.generationMode,
      guardrailPolicy: policy,
      guardrailPassed: checkForbiddenAssertions(base).passed,
      model: "none",
      skippedLlm: true,
      skipReason: "NO_INSTRUCTION",
      templateAiPromptKey: input.templateAiPromptKey,
    });
    await maybePersistAudit(input.auditContext, audit);
    return { content: base, aiModel: null, audit: toPublicSafeAiAuditRecord(audit) };
  }

  const draftParagraph = buildDraftParagraphFromLegal(input.paragraph);
  const runtimeContext = { isApprovedLocked: input.isApprovedLocked ?? false };
  const gate = resolveGenerationModeRuntimeGate(
    input.generationMode,
    "DOCUMENT_PARAGRAPH_REGENERATE",
    runtimeContext,
  );
  const providerReady = isAiProviderConfigured();
  const canUseLlm = gate.llmAllowed && providerReady;

  let nextContent: string;
  let aiModel: string | null;
  let skippedLlm = true;
  let skipReason = gate.skipReason;

  if (canUseLlm) {
    try {
      preAiCallCircuitCheck("openai");
      const aiResult = await invokeOpenAiDocumentParagraphRewrite({
        templateType: input.templateType,
        title: input.documentTitle,
        paragraph: draftParagraph,
        userInstruction: input.instruction,
        templateAiPromptKey: input.templateAiPromptKey,
      });
      nextContent = normalizeLineBreaks(aiResult.text);
      aiModel = aiResult.model;
      skippedLlm = false;
      skipReason = undefined;
      markAiProviderCallSuccess("openai");
    } catch (e) {
      console.error("[AI_CORE_REGENERATE_PARAGRAPH]", e);
      await handleAiProviderCallFailure({
        error: e,
        taskType: "DOCUMENT_PARAGRAPH_REGENERATE",
        caseId: input.auditContext?.caseId,
        actorUserId: input.auditContext?.actorUserId,
        entityType: "LegalDocumentParagraph",
        entityId: input.paragraph.id,
        attemptCount: 1,
      });
      const fb = regenerateSingleParagraphFallback({
        paragraph: draftParagraph,
        templateType: input.templateType,
        customInstruction: input.instruction,
      });
      nextContent = fb.content;
      aiModel = "local-fallback";
      skipReason = "OPENAI_ERROR_FALLBACK";
    }
  } else {
    const fb = regenerateSingleParagraphFallback({
      paragraph: draftParagraph,
      templateType: input.templateType,
      customInstruction: input.instruction,
    });
    nextContent = fb.content;
    aiModel = "local-fallback";
    if (!gate.llmAllowed) {
      skipReason = gate.skipReason;
    } else if (!providerReady) {
      skipReason = "PROVIDER_NOT_CONFIGURED";
    }
  }

  assertRegenerateGuardrail(nextContent, policy);

  const audit = buildRuntimeAudit("DOCUMENT_PARAGRAPH_REGENERATE", {
    generationMode: input.generationMode,
    guardrailPolicy: policy,
    guardrailPassed: true,
    model: aiModel ?? "none",
    skippedLlm,
    skipReason,
    templateAiPromptKey: input.templateAiPromptKey,
  });
  await maybePersistAudit(input.auditContext, audit);

  return {
    content: nextContent,
    aiModel,
    audit: toPublicSafeAiAuditRecord(audit),
  };
}

export async function invokeDraftParagraphRegenerateBatch(
  input: InvokeDraftParagraphRegenerateBatchInput,
) {
  const targetSet = new Set(input.targetParagraphIds);
  const policy =
    input.guardrailPolicy ??
    buildDocumentGenerationGuardrail({ generationPolicy: undefined }).policy;
  const regeneratedIds: string[] = [];
  const skippedIds: string[] = [];
  const audits: PublicSafeAiAuditRecord[] = [];
  const historyDrafts: Array<{
    paragraphId: string;
    sourceQuestionKey?: string | null;
    beforeContent: string;
    afterContent: string;
    instruction?: string | null;
    aiModel?: string | null;
  }> = [];

  const nextParagraphs: DraftPreviewParagraph[] = [];

  for (const paragraph of input.paragraphs) {
    const isTarget = targetSet.has(paragraph.id);

    if (!isTarget) {
      nextParagraphs.push(paragraph);
      continue;
    }

    if (paragraph.locked && !input.force) {
      skippedIds.push(paragraph.id);
      nextParagraphs.push(paragraph);
      continue;
    }

    const userInstruction = input.instructionByParagraphId?.[paragraph.id] ?? null;
    const beforeContent = paragraph.content;
    const generationMode =
      input.generationModeByParagraphId?.[paragraph.id] ?? "AI_REGENERATE";
    const templateAiPromptKey =
      input.templateAiPromptKeyByParagraphId?.[paragraph.id] ?? null;

    const regenResult = await invokeDocumentParagraphRegenerate({
      documentTitle: input.title,
      templateType: input.templateType,
      generationMode,
      guardrailPolicy: policy,
      templateAiPromptKey,
      paragraph: {
        id: paragraph.id,
        title: paragraph.label ?? paragraph.sectionTitle ?? "문단",
        content: beforeContent,
        sectionKey: paragraph.sectionTitle ?? "body",
        paragraphKey: paragraph.sourceQuestionKey,
      },
      instruction: userInstruction ?? undefined,
      auditContext: input.auditContext
        ? {
            caseId: input.auditContext.caseId,
            paragraphId: paragraph.id,
            paragraphKey: paragraph.sourceQuestionKey,
          }
        : undefined,
    });

    const nextParagraph: DraftPreviewParagraph = {
      ...paragraph,
      content: regenResult.content,
      aiHint: userInstruction?.trim() || "기본 재작성",
    };

    nextParagraphs.push(nextParagraph);
    regeneratedIds.push(paragraph.id);
    audits.push(regenResult.audit);

    historyDrafts.push({
      paragraphId: paragraph.id,
      sourceQuestionKey: paragraph.sourceQuestionKey,
      beforeContent,
      afterContent: nextParagraph.content,
      instruction: userInstruction,
      aiModel: regenResult.aiModel,
    });
  }

  if (input.auditContext?.actorUserId && audits.length > 0) {
    await persistAiCoreAudit({
      actorUserId: input.auditContext.actorUserId,
      entityType: "CASE",
      entityId: input.auditContext.caseId,
      record: buildAiAuditRecord({
        operation: "DOCUMENT_PARAGRAPH_REGENERATE",
        taskType: AI_CORE_TASK_TYPES.DOCUMENT_PARAGRAPH_REGENERATE,
        model: audits[0]?.model ?? "batch",
        promptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_REWRITE,
        generationMode: "AI_REGENERATE",
        guardrailPolicy: policy,
        guardrailPassed: true,
        skippedLlm: audits.every((a) => a.skippedLlm),
      }),
      message: `Draft paragraph regenerate batch (${regeneratedIds.length} paragraphs)`,
    });
  }

  return {
    paragraphs: nextParagraphs,
    regeneratedIds,
    skippedIds,
    historyDrafts,
    audits,
  };
}
