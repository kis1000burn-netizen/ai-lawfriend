import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";

const UpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  supportedDocumentTypes: z.array(z.string()),
  visibleToRoles: z.array(z.string()),
  definitionJson: z.unknown(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ questionSetId: string }> },
) {
  try {
    const { questionSetId } = await params;
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("questionSet.update", permissionContextFromSession(sessionUser, {}));

    await assertLawyerProfessionalAccess(sessionUser);

    const body = UpdateSchema.parse(await req.json());

    const def = body.definitionJson as Record<string, unknown> | null;
    const titleFromDef = typeof def?.title === "string" ? def.title : body.title;

    const updated = await prisma.questionSet.update({
      where: { id: questionSetId },
      data: {
        name: titleFromDef,
        description: body.description ?? "",
        supportedDocumentTypes: body.supportedDocumentTypes as unknown as Prisma.InputJsonValue,
        visibleToRoles: body.visibleToRoles as unknown as Prisma.InputJsonValue,
        definitionJson: body.definitionJson as Prisma.InputJsonValue,
      },
    });

    return ok({
      id: updated.id,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
