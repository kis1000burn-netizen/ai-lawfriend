import { NextRequest } from "next/server";
import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import {
  adminCreateGongbuhoPacketBodySchema,
  adminListGongbuhoPacketsQuerySchema,
  gongbuhoPacketJsonMinSchema,
} from "@/lib/validators/gongbuho";
import type { GongbuhoPacketStatus } from "@prisma/client";
import {
  createGongbuhoPacketDraft,
  listGongbuhoPacketsForAdmin,
} from "@/features/gongbuho/gongbuho-packet.service";
import { writeGongbuhoAuditLog } from "@/lib/gongbuho/gongbuho-audit-log";

export const dynamic = "force-dynamic";

function optQuery(s: string | null): string | undefined {
  const t = s?.trim();
  return t ?? undefined;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LIST");
    const { searchParams } = new URL(req.url);
    let query: z.infer<typeof adminListGongbuhoPacketsQuerySchema>;
    try {
      query = adminListGongbuhoPacketsQuerySchema.parse({
        status: optQuery(searchParams.get("status")) as GongbuhoPacketStatus | undefined,
        code: optQuery(searchParams.get("code")),
        caseType: optQuery(searchParams.get("caseType")),
      });
    } catch (e: unknown) {
      return fail("목록 필터 형식이 올바르지 않습니다.", 400, {
        code: "VALIDATION_ERROR",
        details:
          e instanceof z.ZodError ? e.flatten() : { message: String(e) },
      });
    }

    const items = await listGongbuhoPacketsForAdmin(query);
    return ok({ items });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (
      typeof err.status === "number" &&
      (err.status === 401 || err.status === 403)
    ) {
      return fail(err.message ?? "권한 오류", err.status, {
        code:
          err.status === 401
            ? "UNAUTHORIZED"
            : ("FORBIDDEN" as const),
      });
    }
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "CREATE_PACKET");

    const raw = (await req.json()) as unknown;
    const body = adminCreateGongbuhoPacketBodySchema.parse(raw);

    let parsed;
    try {
      parsed = gongbuhoPacketJsonMinSchema.parse(body.packetJson);
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        return fail("packetJson 스키마가 표준 패킷 필수 형식과 맞지 않습니다.", 400, {
          code: "VALIDATION_ERROR",
          details: e.flatten(),
        });
      }
      throw e;
    }

    const created = await createGongbuhoPacketDraft(user.id, parsed);
    await writeGongbuhoAuditLog({
      actorUserId: user.id,
      event: "GONGBUHO_PACKET_CREATED",
      entityType: "GONGBUHO_PACKET",
      entityId: created.id,
      metadata: {
        code: created.code,
        version: created.version,
        role: user.role,
        createdAtIso: created.createdAt.toISOString(),
      },
    });
    return ok({ packet: created }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (
      typeof err.status === "number" &&
      (err.status === 401 || err.status === 403)
    ) {
      return fail(err.message ?? "권한 오류", err.status, {
        code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
