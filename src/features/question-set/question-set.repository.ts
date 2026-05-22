import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { QuestionSetEntity } from "./question-set.types";

type QuestionSetDelegate = typeof prisma.questionSet;

/** Prisma 클라이언트 모델명이 다를 때만 여기서 보정 */
function qs(): QuestionSetDelegate {
  const p = prisma as unknown as Record<string, QuestionSetDelegate | undefined>;
  return p.questionSet ?? p.caseQuestionSet ?? prisma.questionSet;
}

function parseQuestionsJson(raw: unknown): QuestionSetEntity["questions"] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as QuestionSetEntity["questions"];
  return [];
}

function parseVisibleToRolesJson(raw: unknown): string[] | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    return raw.map((r) => String(r));
  }
  return undefined;
}

export function mapQuestionSet(row: {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  questions: unknown;
  visibleToRoles?: unknown;
  createdAt: Date;
  updatedAt: Date;
}): QuestionSetEntity {
  return {
    id: String(row.id),
    name: row.name,
    code: row.code ?? null,
    description: row.description ?? null,
    isActive: Boolean(row.isActive),
    visibleToRoles: parseVisibleToRolesJson(row.visibleToRoles),
    questions: parseQuestionsJson(row.questions),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listQuestionSetsRepository() {
  const rows = await qs().findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return rows.map(mapQuestionSet);
}

export async function getQuestionSetByIdRepository(id: string) {
  const row = await qs().findUnique({
    where: { id },
  });

  return row ? mapQuestionSet(row) : null;
}

export async function getActiveQuestionSetRepository() {
  const row = await qs().findFirst({
    where: { isActive: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  return row ? mapQuestionSet(row) : null;
}

export async function createQuestionSetRepository(
  data: Omit<QuestionSetEntity, "id" | "createdAt" | "updatedAt"> & {
    definitionJson?: Prisma.InputJsonValue | null;
  },
) {
  const row = await qs().create({
    data: {
      name: data.name,
      code: data.code ?? null,
      description: data.description ?? null,
      isActive: data.isActive,
      questions: data.questions as unknown as Prisma.InputJsonValue,
      ...(data.definitionJson !== undefined && data.definitionJson !== null
        ? { definitionJson: data.definitionJson }
        : {}),
    },
  });

  return mapQuestionSet(row);
}

export async function updateQuestionSetRepository(
  id: string,
  input: Partial<QuestionSetEntity>,
) {
  const data: Prisma.QuestionSetUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.code !== undefined) data.code = input.code;
  if (input.description !== undefined) data.description = input.description;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.questions !== undefined) {
    data.questions = input.questions as unknown as Prisma.InputJsonValue;
  }

  const row = await qs().update({
    where: { id },
    data,
  });

  return mapQuestionSet(row);
}

export async function deleteQuestionSetRepository(id: string) {
  await qs().delete({
    where: { id },
  });
}
