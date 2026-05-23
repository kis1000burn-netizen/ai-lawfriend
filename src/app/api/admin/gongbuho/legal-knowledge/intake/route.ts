import { NextRequest } from "next/server";
import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { createLegalKnowledgeIntakeBodySchema } from "@/lib/validators/legal-knowledge-pipeline";
import type { LegalKnowledgeIntakeStatus } from "@prisma/client";
import {
  createLegalKnowledgeIntake,
  listLegalKnowledgeIntakes,
} from "@/features/gongbuho/legal-knowledge-pipeline.service";

export const dynamic = "force-dynamic";

function handleAuthError(error: unknown) {
  const err = error as Error & { status?: number };
  if (
    typeof err.status === "number" &&
    (err.status === 401 || err.status === 403)
  ) {
    return fail(err.message ?? "권한 오류", err.status, {
      code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    });
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_READ");

    const status = req.nextUrl.searchParams.get("status")?.trim();
    const items = await listLegalKnowledgeIntakes(
      status ? { status: status as LegalKnowledgeIntakeStatus } : undefined,
    );
    return ok({ items });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_WRITE");

    const body = createLegalKnowledgeIntakeBodySchema.parse(await req.json());
    const intake = await createLegalKnowledgeIntake(user.id, body);
    return ok({ intake }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return fail("Intake 요청 형식이 올바르지 않습니다.", 400, {
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      });
    }
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}
