import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";

const CreateSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  version: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("questionSet.create", permissionContextFromSession(sessionUser, {}));

    await assertLawyerProfessionalAccess(sessionUser);

    const body = CreateSchema.parse(await req.json());

    const definitionJson = {
      version: body.version,
      code: body.code,
      title: body.title,
      description: "",
      status: "DRAFT" as const,
      supportedDocumentTypes: ["STATEMENT"] as const,
      visibleToRoles: ["ADMIN", "LAWYER", "STAFF", "CLIENT"] as const,
      sections: [],
    };

    const created = await prisma.questionSet.create({
      data: {
        name: body.title,
        code: body.code,
        version: body.version,
        description: "",
        catalogStatus: "DRAFT",
        supportedDocumentTypes: ["STATEMENT"] as unknown as Prisma.InputJsonValue,
        visibleToRoles: ["ADMIN", "LAWYER", "STAFF", "CLIENT"] as unknown as Prisma.InputJsonValue,
        definitionJson: definitionJson as unknown as Prisma.InputJsonValue,
        questions: [],
      },
    });

    return ok({ id: created.id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
