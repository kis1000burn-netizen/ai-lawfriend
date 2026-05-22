import type { Prisma, UserRole } from "@prisma/client";
import {
  createQuestionSetRepository,
  deleteQuestionSetRepository,
  getActiveQuestionSetRepository,
  getQuestionSetByIdRepository,
  listQuestionSetsRepository,
  updateQuestionSetRepository,
} from "./question-set.repository";
import type {
  DocumentTemplateType,
  QuestionCondition,
  QuestionDocumentMapping,
  QuestionDocumentMappingRule,
  QuestionSetEntity,
  QuestionSetQuestion,
} from "./question-set.types";

const EDITOR_ROLES: UserRole[] = ["LAWYER", "STAFF", "ADMIN", "SUPER_ADMIN"];

export function canManageQuestionSets(role: string | null | undefined): boolean {
  return role != null && EDITOR_ROLES.includes(role as UserRole);
}

function normalizeDocumentMappingRule(
  r: Partial<QuestionDocumentMappingRule> | null | undefined,
): QuestionDocumentMappingRule | null {
  if (!r) return null;
  return {
    enabled: r.enabled !== false,
    sectionTitle: r.sectionTitle ?? null,
    paragraphLabel: r.paragraphLabel ?? null,
    order: r.order ?? null,
    format: r.format ?? "BLOCK",
    emptyPolicy: r.emptyPolicy ?? "SKIP",
    prefix: r.prefix ?? null,
    suffix: r.suffix ?? null,
  };
}

function normalizeTemplateOverrides(
  raw: QuestionDocumentMapping["templateOverrides"] | undefined,
): QuestionDocumentMapping["templateOverrides"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const keys: DocumentTemplateType[] = ["STATEMENT", "LEGAL_OPINION", "CONSULTATION_NOTE"];
  const out: Partial<Record<DocumentTemplateType, QuestionDocumentMappingRule | null>> = {};

  for (const k of keys) {
    const v = raw[k];
    if (v === undefined) continue;
    out[k] = v ? normalizeDocumentMappingRule(v) : null;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

export function normalizeQuestions(questions: QuestionSetQuestion[]) {
  return [...questions]
    .map((q, index) => ({
      ...q,
      order: Number.isFinite(q.order) ? q.order : index + 1,
      active: q.active !== false,
      options: Array.isArray(q.options) ? q.options : [],
      visibilityRule: q.visibilityRule ?? null,
      documentMapping: q.documentMapping
        ? {
            enabled: q.documentMapping.enabled !== false,
            sectionTitle: q.documentMapping.sectionTitle ?? null,
            paragraphLabel: q.documentMapping.paragraphLabel ?? null,
            order: q.documentMapping.order ?? null,
            format: q.documentMapping.format ?? "BLOCK",
            emptyPolicy: q.documentMapping.emptyPolicy ?? "SKIP",
            prefix: q.documentMapping.prefix ?? null,
            suffix: q.documentMapping.suffix ?? null,
            templateOverrides: normalizeTemplateOverrides(q.documentMapping.templateOverrides),
          }
        : null,
    }))
    .sort((a, b) => a.order - b.order);
}

function validateQuestionOptions(question: QuestionSetQuestion) {
  const isSelectable = question.type === "SELECT" || question.type === "MULTI_SELECT";

  if (!isSelectable) return;

  if (!question.options || question.options.length === 0) {
    throw new Error(`선택형 질문에는 최소 1개 이상의 옵션이 필요합니다. key=${question.key}`);
  }

  const valueSet = new Set<string>();
  for (const option of question.options) {
    if (!option.label?.trim()) {
      throw new Error(`옵션 label이 비어 있습니다. key=${question.key}`);
    }
    if (!option.value?.trim()) {
      throw new Error(`옵션 value가 비어 있습니다. key=${question.key}`);
    }
    if (valueSet.has(option.value)) {
      throw new Error(`중복된 옵션 value가 있습니다. key=${question.key}, value=${option.value}`);
    }
    valueSet.add(option.value);
  }
}

function validateVisibilityRule(
  conditions: QuestionCondition[],
  allKeys: Set<string>,
  currentKey: string,
) {
  for (const condition of conditions) {
    if (!condition.sourceQuestionKey?.trim()) {
      throw new Error(`조건의 기준 질문이 비어 있습니다. target=${currentKey}`);
    }

    if (condition.sourceQuestionKey === currentKey) {
      throw new Error(`자기 자신을 참조하는 조건은 허용되지 않습니다. key=${currentKey}`);
    }

    if (!allKeys.has(condition.sourceQuestionKey)) {
      throw new Error(
        `조건이 존재하지 않는 질문을 참조합니다. target=${currentKey}, source=${condition.sourceQuestionKey}`,
      );
    }
  }
}

export function assertQuestionSetIntegrity(questionSet: QuestionSetEntity) {
  const questions = normalizeQuestions(questionSet.questions ?? []);
  const keySet = new Set<string>();

  for (const question of questions) {
    if (!question.key?.trim()) {
      throw new Error(`질문 key가 비어 있습니다. label=${question.label}`);
    }

    if (!question.label?.trim()) {
      throw new Error(`질문 label이 비어 있습니다. key=${question.key}`);
    }

    if (keySet.has(question.key)) {
      throw new Error(`중복된 질문 key가 있습니다. key=${question.key}`);
    }

    keySet.add(question.key);
    validateQuestionOptions(question);
  }

  for (const question of questions) {
    if (question.visibilityRule?.conditions?.length) {
      validateVisibilityRule(question.visibilityRule.conditions, keySet, question.key);
    }
  }
}

export async function listQuestionSets() {
  const rows = await listQuestionSetsRepository();
  return rows.map((row) => ({
    ...row,
    questions: normalizeQuestions(row.questions),
  }));
}

export async function getQuestionSetById(id: string) {
  const row = await getQuestionSetByIdRepository(id);
  if (!row) return null;

  return {
    ...row,
    questions: normalizeQuestions(row.questions),
  };
}

export async function getActiveQuestionSet() {
  const row = await getActiveQuestionSetRepository();
  if (!row) return null;

  return {
    ...row,
    questions: normalizeQuestions(row.questions),
  };
}

export async function createQuestionSet(
  input: Partial<QuestionSetEntity> & {
    name: string;
    definitionJson?: Prisma.InputJsonValue | null;
  },
) {
  const merged: QuestionSetEntity = {
    id: "new",
    name: input.name,
    code: input.code ?? null,
    description: input.description ?? null,
    isActive: input.isActive ?? true,
    questions: normalizeQuestions((input.questions ?? []) as QuestionSetQuestion[]),
  };

  assertQuestionSetIntegrity(merged);

  return await createQuestionSetRepository({
    name: merged.name,
    code: merged.code,
    description: merged.description,
    isActive: merged.isActive,
    questions: merged.questions,
    ...(input.definitionJson !== undefined && input.definitionJson !== null
      ? { definitionJson: input.definitionJson }
      : {}),
  });
}

export async function updateQuestionSet(id: string, input: Partial<QuestionSetEntity>) {
  const current = await getQuestionSetByIdRepository(id);
  if (!current) {
    throw new Error("질문셋을 찾을 수 없습니다.");
  }

  const merged: QuestionSetEntity = {
    ...current,
    ...input,
    questions: normalizeQuestions((input.questions ?? current.questions) as QuestionSetQuestion[]),
  };

  assertQuestionSetIntegrity(merged);

  return await updateQuestionSetRepository(id, merged);
}

export async function deleteQuestionSet(id: string) {
  const current = await getQuestionSetByIdRepository(id);
  if (!current) {
    throw new Error("질문셋을 찾을 수 없습니다.");
  }
  await deleteQuestionSetRepository(id);
}
