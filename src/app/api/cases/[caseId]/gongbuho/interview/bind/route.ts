import { z } from "zod";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError } from "@/lib/errors";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  bindCaseGongbuhoInterview,
  type GongbuhoInterviewBindInput,
} from "@/features/gongbuho/gongbuho-interview-binding.service";

export const dynamic = "force-dynamic";

const bindAutoSchema = z.object({ auto: z.literal(true) }).strict();

const bindExplicitSchema = z
  .object({
    gongbuhoPacketId: z.string().cuid("유효한 공부호 패킷 ID가 아닙니다."),
    questionSetId: z.string().cuid("유효한 질문셋 ID가 아닙니다."),
  })
  .strict();

const bindBodySchema = z.union([bindAutoSchema, bindExplicitSchema]);

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

function toBindInput(body: z.infer<typeof bindBodySchema>): GongbuhoInterviewBindInput {
  if ("auto" in body) return { mode: "auto" };
  return {
    mode: "explicit",
    gongbuhoPacketId: body.gongbuhoPacketId,
    questionSetId: body.questionSetId,
  };
}

/**
 * POST /api/cases/[caseId]/gongbuho/interview/bind
 * 게시(PUBLISHED)·활성 질문셋만 사건 인터뷰에 연결합니다.
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const access = await getCaseAccessContext(currentUser, caseId);
    if (!access.canWriteCase) {
      throw new ForbiddenError("공부호 인터뷰 연결에는 사건 수정 권한이 필요합니다.");
    }

    let bodyRaw: unknown;
    try {
      bodyRaw = await req.json();
    } catch {
      return fail("JSON 본문이 필요합니다.", 400, { code: "VALIDATION_ERROR" });
    }

    const parsed = bindBodySchema.safeParse(bodyRaw);
    if (!parsed.success) {
      return fail("요청 본문이 올바르지 않습니다.", 400, {
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const data = await bindCaseGongbuhoInterview(
      caseId,
      toBindInput(parsed.data),
      currentUser.id,
    );
    return ok(data, { status: 201 });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
